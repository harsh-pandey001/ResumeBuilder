/**
 * Mapping between the editor's ResumeModel (list items carry local ids) and
 * the persisted ResumeContent JSON owned by CareerNext (no ids — mirrors
 * packages/shared-types/src/resume.ts in the CareerNext monorepo), plus the
 * profile → new-resume prefill.
 */

import {
  createEmptyResume,
  newId,
  type ResumeModel,
} from "../model/resume";
import type { CareerNextProfile, CareerNextUser } from "./api";

type ResumeContent = Omit<ResumeModel, "template" | "experience" | "projects" | "education"> & {
  experience: { company: string; duration: string; points: string[] }[];
  projects: { name: string; techStack: string[]; points: string[] }[];
  education: { institution: string; year: string }[];
};

export function serializeResumeContent(resume: ResumeModel): string {
  const { template: _template, ...rest } = resume;
  const content: ResumeContent = {
    ...rest,
    experience: resume.experience.map(({ id: _id, ...item }) => item),
    projects: resume.projects.map(({ id: _id, ...item }) => item),
    education: resume.education.map(({ id: _id, ...item }) => item),
  };
  return JSON.stringify(content);
}

export function deserializeResumeContent(json: string, template: string): ResumeModel {
  const empty = createEmptyResume();
  let parsed: Partial<ResumeContent>;
  try {
    parsed = JSON.parse(json) as Partial<ResumeContent>;
  } catch {
    return { ...empty, template };
  }
  return {
    ...empty,
    ...parsed,
    candidate: { ...empty.candidate, ...parsed.candidate },
    sections: { ...empty.sections, ...parsed.sections },
    experience: (parsed.experience ?? []).map((item) => ({ ...item, id: newId() })),
    projects: (parsed.projects ?? []).map((item) => ({ ...item, id: newId() })),
    education: (parsed.education ?? []).map((item) => ({ ...item, id: newId() })),
    template,
  };
}

function formatMonthYear(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatRange(startDate: string, endDate: string | null, isCurrent: boolean): string {
  const start = formatMonthYear(startDate);
  const end = isCurrent || !endDate ? "Present" : formatMonthYear(endDate);
  return start ? `${start} - ${end}` : end;
}

/** Prefill a brand-new resume from the user's CareerNext profile. */
export function resumeFromProfile(user: CareerNextUser, profile: CareerNextProfile): ResumeModel {
  const empty = createEmptyResume();
  const experience = profile.experiences.map((exp) => ({
    id: newId(),
    company: `${exp.title} — ${exp.company}`,
    duration: formatRange(exp.startDate, exp.endDate, exp.isCurrent),
    points: exp.description
      ? exp.description.split("\n").map((line) => line.trim()).filter(Boolean)
      : [],
  }));
  const education = profile.educations.map((edu) => ({
    id: newId(),
    institution: [edu.degree, edu.fieldOfStudy, edu.institution].filter(Boolean).join(", "),
    year: formatRange(edu.startDate, edu.endDate, false),
  }));

  return {
    ...empty,
    candidate: {
      name: `${user.firstName} ${user.lastName}`.trim(),
      role: profile.headline ?? "",
    },
    summary: profile.bio ?? "",
    skills: profile.skills.map((skill) => skill.name),
    experience,
    education,
    sections: {
      experience: experience.length > 0,
      education: education.length > 0,
      interests: false,
    },
  };
}
