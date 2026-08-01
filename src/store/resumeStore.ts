import { create } from 'zustand';
import {
  createEmptyResume,
  newId,
  type EducationItem,
  type ExperienceItem,
  type ProjectItem,
  type ResumeModel,
  type ResumeSections,
} from '../model/resume';

/**
 * The single source of truth for the resume being edited. Every component reads
 * its slice from here and writes back through these actions — replacing the old
 * pattern where each component kept a private `useState` copy that never synced
 * back, which made saving / persistence / AI impossible.
 */
interface ResumeStore {
  resume: ResumeModel;

  /** Replace the whole resume (e.g. after generation or loading an existing one). */
  hydrate: (resume: ResumeModel) => void;
  /** Merge a partial patch (e.g. generation output over the current draft). */
  patch: (partial: Partial<ResumeModel>) => void;
  reset: () => void;

  setCandidate: (patch: Partial<ResumeModel['candidate']>) => void;
  setSummary: (summary: string) => void;
  toggleSection: (key: keyof ResumeSections, value: boolean) => void;
  setTemplate: (template: string) => void;

  // Simple string lists (skills, career highlights, interests).
  addToList: (key: 'skills' | 'careerHighlights' | 'interests', value: string) => void;
  updateInList: (key: 'skills' | 'careerHighlights' | 'interests', index: number, value: string) => void;
  removeFromList: (key: 'skills' | 'careerHighlights' | 'interests', index: number) => void;

  // Experience.
  addExperience: (item: Omit<ExperienceItem, 'id'>) => void;
  updateExperience: (id: string, patch: Partial<Omit<ExperienceItem, 'id'>>) => void;
  removeExperience: (id: string) => void;

  // Projects.
  addProject: (item: Omit<ProjectItem, 'id'>) => void;
  updateProject: (id: string, patch: Partial<Omit<ProjectItem, 'id'>>) => void;
  removeProject: (id: string) => void;

  // Education.
  addEducation: (item: Omit<EducationItem, 'id'>) => void;
  updateEducation: (id: string, patch: Partial<Omit<EducationItem, 'id'>>) => void;
  removeEducation: (id: string) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  resume: createEmptyResume(),

  hydrate: (resume) => set({ resume }),
  patch: (partial) => set((s) => ({ resume: { ...s.resume, ...partial } })),
  reset: () => set({ resume: createEmptyResume() }),

  setCandidate: (patch) =>
    set((s) => ({ resume: { ...s.resume, candidate: { ...s.resume.candidate, ...patch } } })),
  setSummary: (summary) => set((s) => ({ resume: { ...s.resume, summary } })),
  toggleSection: (key, value) =>
    set((s) => ({ resume: { ...s.resume, sections: { ...s.resume.sections, [key]: value } } })),
  setTemplate: (template) => set((s) => ({ resume: { ...s.resume, template } })),

  addToList: (key, value) =>
    set((s) => ({ resume: { ...s.resume, [key]: [...s.resume[key], value] } })),
  updateInList: (key, index, value) =>
    set((s) => ({
      resume: { ...s.resume, [key]: s.resume[key].map((v, i) => (i === index ? value : v)) },
    })),
  removeFromList: (key, index) =>
    set((s) => ({ resume: { ...s.resume, [key]: s.resume[key].filter((_, i) => i !== index) } })),

  addExperience: (item) =>
    set((s) => ({ resume: { ...s.resume, experience: [...s.resume.experience, { ...item, id: newId() }] } })),
  updateExperience: (id, patch) =>
    set((s) => ({
      resume: {
        ...s.resume,
        experience: s.resume.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      },
    })),
  removeExperience: (id) =>
    set((s) => ({ resume: { ...s.resume, experience: s.resume.experience.filter((e) => e.id !== id) } })),

  addProject: (item) =>
    set((s) => ({ resume: { ...s.resume, projects: [...s.resume.projects, { ...item, id: newId() }] } })),
  updateProject: (id, patch) =>
    set((s) => ({
      resume: { ...s.resume, projects: s.resume.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) },
    })),
  removeProject: (id) =>
    set((s) => ({ resume: { ...s.resume, projects: s.resume.projects.filter((p) => p.id !== id) } })),

  addEducation: (item) =>
    set((s) => ({ resume: { ...s.resume, education: [...s.resume.education, { ...item, id: newId() }] } })),
  updateEducation: (id, patch) =>
    set((s) => ({
      resume: {
        ...s.resume,
        education: s.resume.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      },
    })),
  removeEducation: (id) =>
    set((s) => ({ resume: { ...s.resume, education: s.resume.education.filter((e) => e.id !== id) } })),
}));
