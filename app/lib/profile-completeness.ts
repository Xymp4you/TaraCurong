// Required-fields gates for the two key actions: a jobseeker applying to a
// job, and an employer posting a job. Mirrors what the signup wizards collect
// so the same rules apply to older accounts that pre-date the wizards.

export type RequiredField = { col: string; label: string };

export const REQUIRED_JOBSEEKER_FIELDS: RequiredField[] = [
  { col: "first_name", label: "First name" },
  { col: "last_name", label: "Last name" },
  { col: "facebook_link", label: "Facebook profile link" },
  { col: "birth_date", label: "Birth date" },
  { col: "gender", label: "Gender" },
  { col: "civil_status", label: "Civil status" },
  { col: "barangay", label: "Barangay" },
  { col: "city", label: "City / Municipality" },
  { col: "province", label: "Province" },
  { col: "preferred_occupation_1", label: "Preferred job" },
  { col: "resume_url", label: "Resume" },
];

export const REQUIRED_EMPLOYER_FIELDS: RequiredField[] = [
  { col: "establishment_name", label: "Company name" },
  { col: "contact_person", label: "Contact person" },
  { col: "city", label: "City / Municipality" },
];

export const JOBSEEKER_REQUIRED_COLS = REQUIRED_JOBSEEKER_FIELDS.map((f) => f.col);
export const EMPLOYER_REQUIRED_COLS = REQUIRED_EMPLOYER_FIELDS.map((f) => f.col);

export function missingFields(
  profile: Record<string, unknown> | null | undefined,
  required: RequiredField[],
): string[] {
  if (!profile) return required.map((f) => f.label);
  return required
    .filter((f) => {
      const v = profile[f.col];
      if (v === null || v === undefined) return true;
      if (typeof v === "string" && v.trim() === "") return true;
      return false;
    })
    .map((f) => f.label);
}
