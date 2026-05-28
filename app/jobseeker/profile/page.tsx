"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, FileText, Link2, Loader2, Save, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { compressImage } from "@/lib/image-utils";
import { handleApiError } from "@/lib/error-utils";
import JobseekerProfileWizard, { JobseekerProfileWizardRef } from "./profile-wizard";

type JobseekerProfile = Record<string, any>;

export default function JobseekerProfilePage() {
  const [profile, setProfile] = useState<JobseekerProfile | null>(null);
  const [resume, setResume] = useState({
    education: [],
    experience: [],
    trainings: [],
    languages: [],
    licenses: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [facebookLink, setFacebookLink] = useState("");
  const [savingFacebook, setSavingFacebook] = useState(false);
  const [resumeSummary, setResumeSummary] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [savingSummary, setSavingSummary] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const wizardRef = useRef<JobseekerProfileWizardRef>(null);
  const router = useRouter();

  const handleGlobalSave = async () => {
    if (wizardRef.current) {
      setSaving(true);
      setError("");
      setSuccess("");
      try {
        // Trigger save for both profile and resume to be sure everything is persisted
        await wizardRef.current.saveAll();
        setSuccess("Profile and resume changes saved successfully.");
        router.refresh();
        await loadData();
      } catch (err) {
        setSuccess(""); // Clear any partial success messages
        setError("One or more sections failed to save. Please try again.");
      } finally {
        setSaving(false);
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [profileRes, resumeRes] = await Promise.all([
        fetch("/api/jobseeker/profile", { cache: "no-store" }),
        fetch("/api/jobseeker/resume", { cache: "no-store" })
      ]);
      
      const profileData = await profileRes.json();
      const resumeData = await resumeRes.json();

      if (!profileRes.ok || !profileData.profile) {
        setError(profileData.error ?? "Unable to load profile");
        return;
      }

      setProfile(profileData.profile);
      setResume({
        education: resumeData.education || [],
        experience: resumeData.experience || [],
        trainings: resumeData.trainings || [],
        languages: resumeData.languages || [],
        licenses: resumeData.licenses || [],
      });
    } catch {
      setError("Unable to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Initialize the editable Facebook link + AI summary once the profile loads.
  useEffect(() => {
    if (profile) {
      setFacebookLink(profile.facebook_link || "");
      setResumeSummary(profile.resume_summary || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const generateSummary = async () => {
    setGeneratingSummary(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/jobseeker/resume-summary", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Unable to generate a summary right now.");
        return;
      }
      setResumeSummary(data.summary || "");
      setSuccess("Draft summary generated. Review and edit it, then click Save summary.");
    } catch {
      setError("Unable to generate a summary right now.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const saveSummary = async () => {
    setSavingSummary(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/jobseeker/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeSummary: resumeSummary.trim() }),
      });
      if (!res.ok) {
        const handled = await handleApiError(res, { showToast: false });
        setError(handled.message);
        return;
      }
      const data = await res.json();
      if (data.profile) setProfile(data.profile);
      setSuccess("Summary saved.");
    } catch {
      setError("Unable to save summary");
    } finally {
      setSavingSummary(false);
    }
  };

  const saveFacebook = async () => {
    setSavingFacebook(true);
    setError("");
    setSuccess("");
    try {
      const raw = facebookLink.trim();
      const normalized = raw && !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw;
      const res = await fetch("/api/jobseeker/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facebookLink: normalized }),
      });
      if (!res.ok) {
        const handled = await handleApiError(res, { showToast: false });
        setError(handled.message);
        return;
      }
      const data = await res.json();
      if (data.profile) setProfile(data.profile);
      setSuccess("Facebook link saved.");
    } catch {
      setError("Unable to save Facebook link");
    } finally {
      setSavingFacebook(false);
    }
  };

  const uploadProfileImage = async (file: File) => {
    setUploadingImage(true);
    setError("");
    setSuccess("");

    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressedFile);

      const response = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.url) {
        setError(data.error ?? "Unable to upload profile image");
        return;
      }

      setProfile((prev) => (prev ? { ...prev, profile_image: data.url } : prev));
      setSuccess(data.message ?? "Profile image uploaded. Save your profile to keep it current.");
      router.refresh();
    } catch {
      setError("Unable to upload profile image");
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadResume = async (file: File) => {
    setUploadingResume(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload/resume", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.path) {
        setError(uploadData.error ?? "Unable to upload resume");
        return;
      }

      // Persist the storage path on the jobseeker profile (private bucket).
      const saveRes = await fetch("/api/jobseeker/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeUrl: uploadData.path }),
      });
      if (!saveRes.ok) {
        const saveData = await saveRes.json().catch(() => ({}));
        setError(saveData.error ?? "Uploaded, but failed to save it to your profile");
        return;
      }

      setProfile((prev) => (prev ? { ...prev, resume_url: uploadData.path } : prev));
      setSuccess("Resume uploaded.");
      router.refresh();
    } catch {
      setError("Unable to upload resume");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSaveProfile = useCallback(async (payload: Record<string, any>) => {
    try {
      const response = await fetch("/api/jobseeker/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const handled = await handleApiError(response, { showToast: false });
        setError(handled.message);
        throw new Error(handled.message);
      }

      const data = await response.json();
      if (data.profile) {
        setProfile(data.profile);
      }

      // Success message is handled by the caller (handleGlobalSave or individual submit)
    } catch (err: any) {
      if (!error) setError(err.message || "Unable to update profile");
      throw err;
    }
  }, [error]);

  const handleSaveResume = useCallback(async (payload: Record<string, any>) => {
    try {
      const response = await fetch("/api/jobseeker/resume", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const handled = await handleApiError(response, { showToast: false });
        setError(handled.message);
        throw new Error(handled.message);
      }

      const data = await response.json();
      // Success message is handled by the caller
    } catch (err: any) {
      if (!error) setError(err.message || "Unable to update resume");
      throw err;
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="p-6 text-center text-slate-600">
        Profile not found.
      </Card>
    );
  }

  const completionPercent = profile.profile_completeness ?? 0;
  const profileImageSrc = profile.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Jobseeker Profile</h1>
          <p className="text-slate-500">National Skills Registration Program (NSRP Form 1)</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border">
          <div className="text-right">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completeness</p>
            <p className="text-xl font-bold text-slate-900">{completionPercent}%</p>
          </div>
          <div className="h-10 w-10 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
            <svg className="h-10 w-10 -rotate-90">
              <circle cx="20" cy="20" r="16" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-slate-100" />
              <circle cx="20" cy="20" r="16" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray={100} strokeDashoffset={100 - completionPercent} className="text-slate-900 transition-all duration-1000" />
            </svg>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl">{success}</div>}

      <div className="grid gap-6">
        <Card className="p-6 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-slate-900" />
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-md">
                <img src={profileImageSrc} alt="Profile" className="h-full w-full object-cover" />
              </div>
              <label className="absolute -bottom-2 -right-2 h-8 w-8 bg-slate-900 text-white rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-800 shadow-lg transition-transform active:scale-95">
                <Camera className="h-4 w-4" />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadProfileImage(e.target.files[0])} />
              </label>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-900">{profile.first_name} {profile.last_name}</h2>
              <p className="text-slate-500">{profile.email}</p>
              <div className="mt-2 flex gap-2 justify-center md:justify-start">
                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md uppercase tracking-wider">{profile.employment_status || 'Status Unknown'}</span>
              </div>
            </div>
            <div>
              <Button onClick={handleGlobalSave} disabled={saving} className="bg-slate-900 text-white hover:bg-slate-800">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Resume / CV</h3>
              <p className="text-sm text-slate-500 mt-1">
                Upload your resume (PDF, DOC, or DOCX — max 10MB). It can be shared with employers when you apply.
              </p>
              {profile.resume_url ? (
                <a
                  href={`/api/files/resume?path=${encodeURIComponent(profile.resume_url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-slate-900 underline"
                >
                  <FileText className="h-4 w-4" /> View current resume
                </a>
              ) : (
                <p className="text-sm text-slate-400 mt-3">No resume uploaded yet.</p>
              )}
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg cursor-pointer hover:bg-slate-800 text-sm font-semibold shrink-0 active:scale-95 transition-transform">
              {uploadingResume ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploadingResume ? "Uploading..." : profile.resume_url ? "Replace resume" : "Upload resume"}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                disabled={uploadingResume}
                onChange={(e) => e.target.files?.[0] && uploadResume(e.target.files[0])}
              />
            </label>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Professional summary</h3>
              <p className="text-sm text-slate-500 mt-1">
                A short paragraph that introduces you to employers. Generate a draft from your
                uploaded resume (or your CV details), then edit it to sound like you.
              </p>
            </div>
            <Button
              type="button"
              onClick={generateSummary}
              disabled={generatingSummary || savingSummary}
              className="bg-sky-600 text-white hover:bg-sky-700 shrink-0"
            >
              {generatingSummary ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              {generatingSummary ? "Generating..." : "✨ Generate from resume"}
            </Button>
          </div>

          <textarea
            value={resumeSummary}
            onChange={(e) => setResumeSummary(e.target.value)}
            rows={5}
            maxLength={3000}
            placeholder="e.g. I'm a customer service representative with 3 years of experience in retail..."
            className="mt-4 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none ring-sky-300 focus:ring-2"
          />

          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              ✨ AI-generated drafts are a starting point — always review for accuracy before saving.
            </p>
            <Button
              type="button"
              onClick={saveSummary}
              disabled={savingSummary || generatingSummary}
              className="bg-slate-900 text-white hover:bg-slate-800 shrink-0"
            >
              {savingSummary ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {savingSummary ? "Saving..." : "Save summary"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900">Facebook profile</h3>
          <p className="text-sm text-slate-500 mt-1">
            Your public Facebook profile link — helps employers and TaraCurong confirm you&apos;re a real person.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={facebookLink}
                onChange={(e) => setFacebookLink(e.target.value)}
                placeholder="https://facebook.com/your.profile"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none ring-sky-300 focus:ring-2"
              />
            </div>
            <Button onClick={saveFacebook} disabled={savingFacebook} className="bg-slate-900 text-white hover:bg-slate-800 shrink-0">
              {savingFacebook ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {savingFacebook ? "Saving..." : "Save link"}
            </Button>
          </div>
          {profile.facebook_link ? (
            <a
              href={profile.facebook_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-slate-900 underline"
            >
              <Link2 className="h-4 w-4" /> View current profile
            </a>
          ) : null}
        </Card>

        <JobseekerProfileWizard
          ref={wizardRef}
          initialProfile={profile} 
          initialResume={resume}
          onSaveProfile={handleSaveProfile} 
          onSaveResume={handleSaveResume}
        />
      </div>
    </div>
  );
}
