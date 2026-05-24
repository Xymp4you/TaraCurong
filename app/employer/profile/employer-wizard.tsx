"use client";

import { FormEvent, useState, useEffect } from "react";
import { Save, Loader2, Building2, MapPin, BarChart3, FileText, CheckCircle2, AlertCircle, ClipboardList, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SRS_INDUSTRY_CODES } from "@/lib/validation-schemas";
import { compressImage } from "@/lib/image-utils";

const TABS = [
  { id: "company",    label: "Establishment",  icon: Building2 },
  { id: "location",   label: "Geographic",     icon: MapPin },
  { id: "contact",    label: "Contact & SRS",  icon: ClipboardList },
  { id: "identity",   label: "Identity verification", icon: BadgeCheck },
  { id: "docs",       label: "Documents",      icon: FileText },
] as const;

type Tab = typeof TABS[number]["id"];

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Input({ name, value, onChange, placeholder, type = "text", disabled }: {
  name: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <input
      name={name} value={value} onChange={onChange} type={type} placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition disabled:bg-slate-50 disabled:text-slate-400"
    />
  );
}

function DocumentCard({ id, label, hint, currentUrl, uploading, onUpload }: {
  id: string; label: string; hint: string; currentUrl?: string; uploading: boolean; onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center hover:border-slate-400 transition-colors">
      {currentUrl ? (
        <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
      ) : (
        <FileText className="h-6 w-6 text-slate-400 mx-auto" />
      )}
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="text-xs text-slate-400">{hint}</p>
      
      {currentUrl ? (
        <div className="flex flex-col gap-2">
          <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-700 hover:underline">View Document</a>
          <label className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700">
            Change File
            <input type="file" className="hidden" accept=".pdf,image/*" onChange={onUpload} disabled={uploading} />
          </label>
        </div>
      ) : (
        <label className={`cursor-pointer inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white shadow-sm hover:bg-slate-100 h-8 px-3 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          {uploading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
          {uploading ? "Uploading..." : "Upload PDF / Image"}
          <input type="file" className="hidden" accept=".pdf,image/*" onChange={onUpload} disabled={uploading} />
        </label>
      )}
    </div>
  );
}

function buildMatchReadiness(form: ReturnType<typeof buildForm>) {
  const checks = [
    { label: "Establishment Name",     ok: !!form.establishmentName },
    { label: "Industry Code (SRS 2)",  ok: Array.isArray(form.industryCode) ? form.industryCode.length > 0 : !!form.industryCode },
    { label: "Company TIN",            ok: !!form.companyTaxId },
    { label: "Province / City",        ok: !!form.province && !!form.city },
    { label: "Barangay",               ok: !!form.barangay },
    { label: "Contact Person",         ok: !!form.contactPerson },
    { label: "Contact Phone",          ok: !!form.contactPhone },
    { label: "No. of Paid Employees",  ok: Number(form.totalPaidEmployees) > 0 },
    { label: "Vacant Positions",       ok: Number(form.totalVacantPositions) > 0 },
    { label: "Public listing consent", ok: form.srsSubscriberIntent },
    { label: "Acronym / Abbreviation", ok: !!form.acronymAbbreviation },
    { label: "Type of Establishment", ok: !!form.typeOfEstablishment },
    { label: "Prepared By (SRS 2A)",   ok: !!form.srsPreparedBy },
    // Identity verification (required for the "Verified" badge)
    { label: "Authorized rep name",    ok: !!form.repFullName },
    { label: "Rep date of birth",      ok: !!form.repDateOfBirth },
    { label: "Rep relationship",       ok: !!form.repRelationship },
    { label: "Rep phone",              ok: !!form.repPhone },
    { label: "Rep government ID",      ok: !!form.repIdFile },
    { label: "Rep selfie with ID",     ok: !!form.repSelfieFile },
    { label: "Authorization confirmed", ok: form.authorizationConfirmed },
  ];
  const done = checks.filter(c => c.ok).length;
  return { checks, done, total: checks.length, pct: Math.round((done / checks.length) * 100) };
}

function buildForm(profile: Record<string, any>) {
  // Ensure industryCode is always an array
  let industryCode = profile.industry_code || [];
  if (typeof industryCode === "string") {
    industryCode = industryCode.split(",").filter(Boolean);
  }

  return {
    // Establishment Details
    establishmentName:    profile.establishment_name     || "",
    industryCode:         industryCode,
    companyTaxId:         profile.company_tax_id         || "",
    totalPaidEmployees:   profile.total_paid_employees   ?? 0,
    totalVacantPositions: profile.total_vacant_positions ?? 0,
    acronymAbbreviation:  profile.acronym_abbreviation   || "",
    typeOfEstablishment:  profile.type_of_establishment  || "",
    srsSubscriberIntent:  profile.srs_subscriber_intent !== false, // default true

    // Location
    province:             profile.province               || "",
    city:                 profile.city                   || "",
    barangay:             profile.barangay               || "",
    address:              profile.address                || "",
    zipCode:              profile.zip_code               || "",
    geographicCode:       profile.geographic_code        || "",
    barangayChairperson:  profile.barangay_chairperson   || "",
    barangaySecretary:    profile.barangay_secretary     || "",

    // Contact
    contactPerson:        profile.contact_person         || "",
    contactPhone:         profile.contact_phone          || "",
    designation:          profile.designation            || "",

    // Job Posting - Prepared by footer
    srsPreparedBy:          profile.srs_prepared_by          || "",
    srsPreparedDesignation: profile.srs_prepared_designation  || "",
    srsPreparedDate:        profile.srs_prepared_date         || new Date().toISOString().split('T')[0],
    srsPreparedContact:     profile.srs_prepared_contact      || "",

    // Documents
    businessPermitFile:    profile.business_permit_file     || "",
    bir2303File:           profile.bir_2303_file            || "",
    doleCertificationFile: profile.dole_certification_file  || "",
    companyProfileFile:    profile.company_profile_file     || "",

    // Identity verification (authorized representative)
    repFullName:           profile.rep_full_name            || "",
    repDateOfBirth:        profile.rep_date_of_birth        || "",
    repRelationship:       profile.rep_relationship         || "",
    repPhone:              profile.rep_phone                || "",
    repIdType:             profile.rep_id_type              || "",
    repIdFile:             profile.rep_id_file              || "",
    repSelfieFile:         profile.rep_selfie_file          || "",
    authorizationConfirmed: profile.authorization_confirmed === true,

    // General
    description:  profile.description   || "",
    website:      profile.website        || "",
    profileImage: profile.profile_image  || "",
  };
}

export default function EmployerProfileWizard({
  initialProfile,
  onSave,
}: {
  initialProfile: Record<string, any>;
  onSave: (payload: Record<string, any>) => Promise<void>;
}) {
  const [form, setForm] = useState(() => buildForm(initialProfile));
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("company");
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialProfile.profile_image) {
      setForm(prev => ({ ...prev, profileImage: initialProfile.profile_image }));
    }
  }, [initialProfile.profile_image]);

  const set = (field: keyof typeof form, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    if (type === "checkbox") {
      set(name as any, (e.target as HTMLInputElement).checked);
    } else if (type === "number") {
      set(name as any, parseInt(value) || 0);
    } else {
      set(name as any, value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const readiness = buildMatchReadiness(form);
  const curIdx = TABS.findIndex(t => t.id === activeTab);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
      {/* Sidebar nav */}
      <div className="space-y-3">
        <Card className="p-4">
          <nav className="flex flex-col gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all text-left ${
                  activeTab === id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </Card>

        {/* Match Readiness Panel */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">SRS Readiness</p>
            <span className={`text-sm font-bold ${readiness.pct >= 80 ? "text-emerald-600" : readiness.pct >= 50 ? "text-amber-600" : "text-rose-600"}`}>
              {readiness.pct}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${readiness.pct >= 80 ? "bg-emerald-500" : readiness.pct >= 50 ? "bg-amber-400" : "bg-rose-400"}`}
              style={{ width: `${readiness.pct}%` }}
            />
          </div>
          <ul className="space-y-1.5">
            {readiness.checks.map(c => (
              <li key={c.label} className="flex items-center gap-2 text-xs">
                {c.ok
                  ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  : <AlertCircle  className="h-3.5 w-3.5 text-rose-400 shrink-0" />}
                <span className={c.ok ? "text-slate-600" : "text-slate-400"}>{c.label}</span>
              </li>
            ))}
          </ul>
          {readiness.pct < 100 && (
            <p className="text-[10px] text-slate-400 pt-1">
              Complete all fields for full complete profile and better job-seeker matching.
            </p>
          )}
        </Card>
      </div>

      {/* Main content */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ─── TAB 1: Establishment ─── */}
          {activeTab === "company" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Establishment Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">Corresponds to Employer Profile — Establishment Listing Sheet</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Field label="Name of Establishment" required>
                    <Input name="establishmentName" value={form.establishmentName} onChange={handleChange} placeholder="e.g. KCC Mall of Tacurong" />
                  </Field>
                </div>

                <Field label="Acronym / Abbreviation" hint="Short name or initials">
                  <Input name="acronymAbbreviation" value={form.acronymAbbreviation} onChange={handleChange} placeholder="e.g. KCC" />
                </Field>

                <Field label="Type of Establishment">
                  <select
                    name="typeOfEstablishment"
                    value={form.typeOfEstablishment}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition"
                  >
                    <option value="">Select type...</option>
                    <option value="Private">Private</option>
                    <option value="Public">Public (Government)</option>
                    <option value="NGO">NGO (Non-Governmental Organization)</option>
                    <option value="Cooperatives">Cooperatives</option>
                    <option value="Others">Others</option>
                  </select>
                </Field>

                {/* Industry Code — 17 DOLE codes */}
                <div className="md:col-span-2">
                  <Field label="Type of Industry" required hint="Employer Profile — Column 4 / Job Posting — Section 2 (Select one or more)">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      {SRS_INDUSTRY_CODES.map(({ code, label }) => (
                        <label
                          key={code}
                          className={`flex items-start gap-2 rounded-lg border px-3 py-2 cursor-pointer text-sm transition-all ${
                            form.industryCode.includes(code)
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 hover:border-slate-400 text-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            name="industryCode"
                            value={code}
                            checked={form.industryCode.includes(code)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const current = [...form.industryCode];
                              if (checked) {
                                if (!current.includes(code)) current.push(code);
                              } else {
                                const idx = current.indexOf(code);
                                if (idx > -1) current.splice(idx, 1);
                              }
                              set("industryCode", current);
                            }}
                            className="sr-only"
                          />
                          <span className="font-bold shrink-0 w-5">{code}</span>
                          <span className="leading-snug">{label}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                </div>

                <Field label="No. of Paid Employees" hint="Employer Profile — Column 2">
                  <Input name="totalPaidEmployees" type="number" value={form.totalPaidEmployees} onChange={handleChange} placeholder="e.g. 50" />
                </Field>

                <Field label="No. of Vacant Positions" hint="Employer Profile — Column 3">
                  <Input name="totalVacantPositions" type="number" value={form.totalVacantPositions} onChange={handleChange} placeholder="e.g. 5" />
                </Field>

                <Field label="Company Tax Identification Number" hint="Required by profile footer">
                  <Input name="companyTaxId" value={form.companyTaxId} onChange={handleChange} placeholder="000-000-000-000" />
                </Field>

                <Field label="Company Website">
                  <Input name="website" value={form.website} onChange={handleChange} placeholder="https://example.com" />
                </Field>

                <div className="md:col-span-2">
                  <Field label="Company Description">
                    <textarea
                      name="description" value={form.description} onChange={handleChange} rows={3}
                      placeholder="Brief description of your establishment's business activities..."
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none"
                    />
                  </Field>
                </div>

                {/* SRS subscriber opt-in */}
                <div className="md:col-span-2">
                  <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      name="srsSubscriberIntent"
                      checked={form.srsSubscriberIntent}
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 rounded accent-slate-900"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Allow my establishment to be listed in the TaraCurong employer directory
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        By checking this, your establishment agrees to appear in the TaraCurong employer directory and to have its job vacancies shown to registered jobseekers.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="button" onClick={() => setActiveTab("location")}>Next: Geographic →</Button>
              </div>
            </div>
          )}

          {/* ─── TAB 2: Geographic ─── */}
          {activeTab === "location" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Geographic Identification</h3>
                <p className="text-xs text-slate-500 mt-0.5">Corresponds to Employer Profile — Geographic Identification header</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Province" required>
                  <Input name="province" value={form.province} onChange={handleChange} placeholder="e.g. Sultan Kudarat" />
                </Field>
                <Field label="City / Municipality" required>
                  <Input name="city" value={form.city} onChange={handleChange} placeholder="e.g. Tacurong City" />
                </Field>
                <Field label="Barangay">
                  <Input name="barangay" value={form.barangay} onChange={handleChange} placeholder="e.g. Brgy. Tina" />
                </Field>
                <Field label="Geographic Code" hint="Barangay/municipal geographic code from PSA">
                  <Input name="geographicCode" value={form.geographicCode} onChange={handleChange} placeholder="e.g. 129804001" />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Complete Street Address">
                    <Input name="address" value={form.address} onChange={handleChange} placeholder="Building, Street, Subdivision" />
                  </Field>
                </div>
                <Field label="ZIP Code">
                  <Input name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="e.g. 9800" />
                </Field>

                <div className="md:col-span-2 mt-2 p-4 rounded-xl border border-teal-100 bg-teal-50 space-y-3">
                  <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Barangay Officials</p>
                  <p className="text-xs text-teal-700">As declared in profile header. Fill in the name of your barangay's officials.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Barangay Chairperson">
                      <Input name="barangayChairperson" value={form.barangayChairperson} onChange={handleChange} placeholder="Full name of Barangay Captain" />
                    </Field>
                    <Field label="Barangay Secretary">
                      <Input name="barangaySecretary" value={form.barangaySecretary} onChange={handleChange} placeholder="Full name of Barangay Secretary" />
                    </Field>
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => setActiveTab("company")}>← Back</Button>
                <Button type="button" onClick={() => setActiveTab("contact")}>Next: Contact & SRS →</Button>
              </div>
            </div>
          )}

          {/* ─── TAB 3: Contact & SRS Prepared By ─── */}
          {activeTab === "contact" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Contact & Posting Footer</h3>
                <p className="text-xs text-slate-500 mt-0.5">Contact information and the "Prepared By" block required at the bottom of every job posting</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Contact Person" required>
                  <Input name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Full name" />
                </Field>
                <Field label="Designation / Position">
                  <Input name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. HR Manager" />
                </Field>
                <Field label="Contact Phone" required>
                  <Input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+63 900 000 0000" />
                </Field>
              </div>

              <div className="mt-2 p-4 rounded-xl border border-amber-100 bg-amber-50 space-y-3">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Job Posting — Prepared By</p>
                <p className="text-xs text-amber-600">
                  These fields populate the footer of your job postings. They can be different from the contact person above.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Prepared By (Full Name)">
                    <Input name="srsPreparedBy" value={form.srsPreparedBy} onChange={handleChange} placeholder="Name of the person who prepares the form" />
                  </Field>
                  <Field label="Designation">
                    <Input name="srsPreparedDesignation" value={form.srsPreparedDesignation} onChange={handleChange} placeholder="e.g. HR Officer" />
                  </Field>
                  <Field label="Date Accomplished" hint="Footer field">
                    <Input name="srsPreparedDate" type="date" value={form.srsPreparedDate} onChange={handleChange} />
                  </Field>
                  <Field label="Contact Number" hint="Footer field">
                    <Input name="srsPreparedContact" value={form.srsPreparedContact} onChange={handleChange} placeholder="+63 900 000 0000" />
                  </Field>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => setActiveTab("location")}>← Back</Button>
                <Button type="button" onClick={() => setActiveTab("identity")}>Next: Identity verification →</Button>
              </div>
            </div>
          )}

          {/* ─── TAB 4: Identity verification ─── */}
          {activeTab === "identity" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Identity verification</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Required for the &quot;Verified&quot; badge. Submitted documents are reviewed manually by the
                  project maintainer, stored privately, and not shared with anyone else.
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-800">
                <p className="font-semibold uppercase tracking-wider mb-1">Why we ask</p>
                <p className="leading-relaxed">
                  Applicants share contact details and resumes when they apply. To prevent fake employers
                  from harvesting that data, we verify the identity of the person authorized to manage this
                  account. This is <strong>not</strong> a government background check — we only confirm the
                  documents look genuine.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Authorized representative</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full legal name" required hint="As shown on your government ID">
                    <Input name="repFullName" value={form.repFullName} onChange={handleChange} placeholder="e.g. Juan M. Dela Cruz" />
                  </Field>
                  <Field label="Date of birth" required hint="Must be 18+">
                    <Input name="repDateOfBirth" type="date" value={form.repDateOfBirth} onChange={handleChange} />
                  </Field>
                  <Field label="Relationship to establishment" required>
                    <select
                      name="repRelationship"
                      value={form.repRelationship}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition"
                    >
                      <option value="">Select…</option>
                      <option value="owner">Owner / Proprietor</option>
                      <option value="officer">Corporate Officer (President, Director, etc.)</option>
                      <option value="hr_manager">HR Manager</option>
                      <option value="authorized_hiring_agent">Authorized Hiring Agent</option>
                      <option value="other">Other (specify below)</option>
                    </select>
                  </Field>
                  <Field label="Personal mobile" required hint="For OTP if disputes arise">
                    <Input name="repPhone" value={form.repPhone} onChange={handleChange} placeholder="+63 900 000 0000" />
                  </Field>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">ID documents</h4>
                <p className="text-xs text-slate-500 mb-3">
                  Upload one government-issued ID and a selfie of the representative holding that same ID.
                  Accepted IDs: PhilID, UMID, Driver&apos;s License, Postal ID, Passport, Voter&apos;s ID, PhilHealth,
                  SSS, TIN ID, PRC.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(
                    [
                      { id: "repIdFile", label: "Representative's government ID", hint: "Front side, clear photo, all corners visible" },
                      { id: "repSelfieFile", label: "Selfie with the ID", hint: "Hold the ID next to your face. Both must be readable." },
                    ] as const
                  ).map(({ id, label, hint }) => {
                    const currentUrl = (form as any)[id];
                    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                      const raw = e.target.files?.[0];
                      if (!raw) return;
                      setUploadingState(prev => ({ ...prev, [id]: true }));
                      // Compress images client-side to stay under Supabase free-tier storage limits.
                      // PDFs and other non-image files pass through unchanged.
                      const file = raw.type.startsWith("image/") ? await compressImage(raw) : raw;
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("documentType", id);
                      try {
                        const res = await fetch("/api/upload/employer-document", {
                          method: "POST",
                          body: formData,
                        });
                        const data = await res.json();
                        if (res.ok && data.url) {
                          set(id as any, data.url);
                        } else {
                          alert(data.error || "Upload failed");
                        }
                      } catch {
                        alert("An error occurred during upload");
                      } finally {
                        setUploadingState(prev => ({ ...prev, [id]: false }));
                      }
                    };
                    return (
                      <DocumentCard
                        key={id}
                        id={id}
                        label={label}
                        hint={hint}
                        currentUrl={currentUrl}
                        uploading={!!uploadingState[id]}
                        onUpload={handleUpload}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="authorizationConfirmed"
                    checked={form.authorizationConfirmed}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded accent-slate-900"
                  />
                  <div className="text-sm text-slate-800 leading-relaxed">
                    <p className="font-semibold text-slate-900">I confirm under penalty of false declaration that:</p>
                    <ul className="mt-1 list-disc pl-5 space-y-0.5 text-xs">
                      <li>The IDs and documents I&apos;m uploading belong to me.</li>
                      <li>I am authorized to act on behalf of this establishment for hiring purposes.</li>
                      <li>Applicant data I receive will only be used for this hiring decision and will not be redistributed.</li>
                      <li>I will not charge any applicant a fee, deposit, or payment of any kind.</li>
                    </ul>
                  </div>
                </label>
              </div>

              <div className="text-xs text-slate-500">
                Files are stored privately and may be deleted on request. See the{" "}
                <a href="/privacy" className="text-teal-700 hover:underline">Privacy Policy</a> for full
                retention details.
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => setActiveTab("contact")}>← Back</Button>
                <Button type="button" onClick={() => setActiveTab("docs")}>Next: Business documents →</Button>
              </div>
            </div>
          )}

          {/* ─── TAB 5: Documents ─── */}
          {activeTab === "docs" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Supporting Documents</h3>
                <p className="text-xs text-slate-500 mt-0.5">Upload scanned copies of your establishment documents for verification.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "businessPermitFile",    label: "Business Permit",             hint: "Current year business permit from LGU" },
                  { id: "bir2303File",           label: "BIR Form 2303 (COR)",         hint: "Certificate of Registration from BIR" },
                  { id: "doleCertificationFile", label: "DOLE Certification",          hint: "DOLE establishment registration (if applicable)" },
                  { id: "companyProfileFile",    label: "Company Profile / Brochure",  hint: "Optional but recommended for verification" },
                ].map(({ id, label, hint }) => {
                  const currentUrl = (form as any)[id];
                  
                  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    setUploadingState(prev => ({ ...prev, [id]: true }));
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("documentType", id);

                    try {
                      const res = await fetch("/api/upload/employer-document", {
                        method: "POST",
                        body: formData,
                      });
                      const data = await res.json();
                      if (res.ok && data.url) {
                        set(id as any, data.url);
                      } else {
                        alert(data.error || "Upload failed");
                      }
                    } catch (err) {
                      alert("An error occurred during upload");
                    } finally {
                      setUploadingState(prev => ({ ...prev, [id]: false }));
                    }
                  };

                  return (
                    <DocumentCard
                      key={id}
                      id={id}
                      label={label}
                      hint={hint}
                      currentUrl={currentUrl}
                      uploading={!!uploadingState[id]}
                      onUpload={handleUpload}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => setActiveTab("identity")}>← Back</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Profile
                </Button>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
