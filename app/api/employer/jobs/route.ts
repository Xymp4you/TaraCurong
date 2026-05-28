export const dynamic = "force-dynamic";
import { createJobPostingSchema, employerJobsListQuerySchema } from "@/lib/validation-schemas";
import { createGetHandler, createPostHandler, type ApiHandlerContext } from "@/lib/api-handler";
import { safeDatabaseOperation, successResponse, errorResponse, createApiError, ErrorCode } from "@/lib/api-errors";
import { listEmployerJobs } from "@/lib/db-helpers";
import { supabaseAdmin } from "@/lib/supabase";
import { tryCreateNotification } from "@/lib/notifications";
import {
  EMPLOYER_REQUIRED_COLS,
  REQUIRED_EMPLOYER_FIELDS,
  missingFields,
} from "@/lib/profile-completeness";
import { z } from "zod";

type EmployerJobsListQuery = z.infer<typeof employerJobsListQuerySchema>;
type CreateJobPostingBody = z.infer<typeof createJobPostingSchema>;

export const GET = createGetHandler<EmployerJobsListQuery>(
  async (ctx: ApiHandlerContext, query?: EmployerJobsListQuery) => {
    if (!ctx.user || ctx.user.role !== "employer") {
      return errorResponse(
        createApiError(ErrorCode.UNAUTHORIZED, "Employer role required"),
        ctx.requestId
      );
    }

    const filters: Partial<EmployerJobsListQuery> = query ?? {};
    const limit = filters.limit ?? 10;
    const offset = filters.offset ?? 0;

    const jobs = await listEmployerJobs(ctx.user.id, {
      status: filters.status,
      search: filters.search,
      limit: limit + 1,
      offset,
    });

    if (!jobs) {
      return errorResponse(
        createApiError(ErrorCode.DATABASE_ERROR, "Failed to fetch jobs"),
        ctx.requestId
      );
    }

    const jobsList = jobs.length > limit ? jobs.slice(0, limit) : jobs;

    const mappedJobs = jobsList.map((job: any) => ({
      ...job,
      positionTitle: job.position_title,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      rejectionReason: job.rejection_reason,
      employmentType: job.work_setup,
      workType: job.work_type,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      salaryPeriod: job.salary_period,
      vacantPositions: job.vacancies,
      mainSkillOrSpecialization: job.main_skill_desired,
      minimumEducationRequired: job.minimum_education_required,
      yearsOfExperienceRequired: job.years_of_experience_required,
      employmentContractType: job.employment_contract_type,
      industryCodes: job.industry_code ? [job.industry_code] : [],
    }));

    return successResponse(
      {
        jobs: mappedJobs,
        pagination: { limit, offset, hasMore: jobs.length > limit },
      },
      ctx.requestId
    );
  },
  {
    requireAuth: true,
    querySchema: employerJobsListQuerySchema,
    rateLimitMaxRequests: 50,
  }
);

export const POST = createPostHandler<CreateJobPostingBody>(
  async (ctx: ApiHandlerContext, body?: CreateJobPostingBody) => {
    if (!ctx.user || ctx.user.role !== "employer") {
      return errorResponse(
        createApiError(ErrorCode.UNAUTHORIZED, "Employer role required"),
        ctx.requestId
      );
    }

    // --- Profile-completeness gate ---
    // Employers are now auto-active (no admin approval), but they still can't
    // post jobs until the required establishment info is filled — same rules
    // the signup wizard enforces, applied to older accounts too.
    const employerData = await safeDatabaseOperation(
      async () => {
        const { data, error } = await supabaseAdmin
          .from("employers")
          .select(["account_status", ...EMPLOYER_REQUIRED_COLS].join(", "))
          .eq("id", ctx.user!.id)
          .single();
        if (error) throw error;
        return data as unknown as Record<string, unknown> | null;
      },
      "checkEmployerProfile"
    );

    if (!employerData.success) {
      return errorResponse(
        createApiError(ErrorCode.DATABASE_ERROR, "Unable to verify employer profile"),
        ctx.requestId
      );
    }

    if (employerData.data?.account_status === "suspended") {
      return errorResponse(
        createApiError(
          ErrorCode.FORBIDDEN,
          "Your employer account has been suspended. Contact TaraCurong support."
        ),
        ctx.requestId
      );
    }

    const missing = missingFields(employerData.data, REQUIRED_EMPLOYER_FIELDS);
    if (missing.length) {
      return errorResponse(
        createApiError(
          ErrorCode.FORBIDDEN,
          `Complete your employer profile before posting jobs. Missing: ${missing.join(", ")}.`,
          `Please complete your employer profile first. Missing: ${missing.join(", ")}.`,
          { code: "PROFILE_INCOMPLETE", missing }
        ),
        ctx.requestId
      );
    }
    // -------------------------------

    const payload = body;
    if (!payload) {
      return errorResponse(
        createApiError(ErrorCode.BAD_REQUEST, "Invalid request body"),
        ctx.requestId
      );
    }

    const result = await safeDatabaseOperation(
      async () => {
        const inserted = await supabaseAdmin
          .from("jobs")
          .insert({
            employer_id: ctx.user!.id,
            position_title: payload.positionTitle.trim(),
            description: payload.description.trim(),
            minimum_education_required: payload.minimumEducationRequired,
            main_skill_desired: payload.mainSkillDesired,
            years_of_experience_required: payload.yearsOfExperienceRequired,
            starting_salary: payload.salaryMin && payload.salaryMax 
              ? `PHP ${payload.salaryMin.toLocaleString()} - ${payload.salaryMax.toLocaleString()}` 
              : payload.salaryMin 
                ? `PHP ${payload.salaryMin.toLocaleString()}` 
                : null,
            salary_min: payload.salaryMin || null,
            salary_max: payload.salaryMax || null,
            salary_period: payload.salaryPeriod || "monthly",
            vacancies: payload.vacancies || 1,
            // Employers are auto-active in this community project, so new postings
            // are immediately visible to jobseekers. Admins can still suspend later.
            job_status: "active",
            work_setup: payload.employmentType || "onsite",
            work_type: payload.workType || "Full-time",
            employment_contract_type: payload.employmentContractType || null,
            industry_code: payload.industryCode || null,
            location: payload.location?.trim() || null,
            is_active: true,
            archived: false,
          })
          .select("id, position_title, job_status, created_at")
          .single();

        if (inserted.error || !inserted.data) {
          throw inserted.error ?? new Error("insert_failed");
        }
        return inserted.data;
      },
      "createEmployerJob"
    );

    if (!result.success) {
      return errorResponse(
        createApiError(ErrorCode.DATABASE_ERROR, "Failed to create job"),
        ctx.requestId
      );
    }

    // Notify Admins
    try {
      const { data: admins } = await supabaseAdmin.from("admins").select("id");
      if (admins) {
        const { data: employer } = await supabaseAdmin.from("employers").select("establishment_name").eq("id", ctx.user!.id).single();
        const employerName = employer?.establishment_name || "An employer";
        
        await Promise.all(
          admins.map((admin) =>
            tryCreateNotification({
              userId: admin.id,
              role: "admin",
              type: "job",
              title: "New Job Posting for Review",
              message: `${employerName} has posted a new job: "${result.data.position_title}". Please review it.`,
              relatedId: result.data.id,
              relatedType: "job",
            })
          )
        );
      }
    } catch (e) {
      console.warn("Failed to notify admins:", e);
    }

    return successResponse(
      { message: "Job created and submitted for review (SRS Form 2A)", job: result.data },
      ctx.requestId
    );
  },
  {
    bodySchema: createJobPostingSchema,
    requireAuth: true,
    rateLimitMaxRequests: 20,
  }
);