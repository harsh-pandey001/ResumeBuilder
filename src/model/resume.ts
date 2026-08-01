/**
 * The single, typed shape of a resume. This is the source of truth the whole
 * editor reads from and writes to (via the Zustand store) — so a resume can be
 * serialized, persisted, loaded for editing, and later optimized by AI, none
 * of which was possible when each component held its own local copy.
 *
 * Field names are normalized from the old ad-hoc shapes (e.g. the nested
 * `project.roles_and_responsibilities.roles_and_responsibilities`, and the
 * `experiance` typo) into flat, explicit ones.
 */

export interface ExperienceItem {
  id: string;
  company: string;
  duration: string;
  points: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  techStack: string[];
  points: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  year: string;
}

export interface ResumeSections {
  experience: boolean;
  education: boolean;
  interests: boolean;
}

export interface ResumeModel {
  candidate: { name: string; role: string };
  summary: string;
  skills: string[];
  careerHighlights: string[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  interests: string[];
  sections: ResumeSections;
  /** Selected template id — the seam for multi-template support (P1). */
  template: string;
}

export const DEFAULT_TEMPLATE = 'classic';

/** A blank resume — no personal data baked in (the old code shipped real contact details). */
export function createEmptyResume(): ResumeModel {
  return {
    candidate: { name: '', role: '' },
    summary: '',
    skills: [],
    careerHighlights: [],
    experience: [],
    projects: [],
    education: [],
    interests: [],
    sections: { experience: false, education: false, interests: false },
    template: DEFAULT_TEMPLATE,
  };
}

/** Stable id for list items (browser-native; no dependency). */
export function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Shape returned by the generation backend (FastAPI `/generate-roles`), mapped
 * into the normalized model. Kept isolated here so the backend's wire shape
 * (nested/legacy naming) never leaks into components.
 */
export interface GeneratedRolesPayload {
  roles_and_responsibilities?: {
    summary?: string;
    tools_and_technologies?: string[];
    bullet_points?: string[];
  };
  project_details?: Array<{
    name?: string;
    roles_and_responsibilities?: {
      roles_and_responsibilities?: string[];
      tech_stack?: string[];
    };
  }>;
}

export function mapGeneratedProjects(payload: GeneratedRolesPayload): ProjectItem[] {
  return (payload.project_details ?? []).map((p) => ({
    id: newId(),
    name: p.name ?? '',
    techStack: p.roles_and_responsibilities?.tech_stack ?? [],
    points: p.roles_and_responsibilities?.roles_and_responsibilities ?? [],
  }));
}
