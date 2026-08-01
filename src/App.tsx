import "./App.css";
import { useEffect, useRef, useState } from "react";
import EducationAndOther from "./components/EducationAndOther";
import Header from "./components/Header";
import Project from "./components/Projects";
import Workexperience from "./components/Workexperience";
import Careerandprofile from "./components/Careerandprofile";
import Startmodal, { type StartModalSubmitOptions } from "./StartPage/Startmodal";
import { ClipLoader } from "react-spinners";
import ButtonContainer from "./components/ButtonContainer";
import { API_BASE_URL } from "./config";
import { useResumeStore } from "./store/resumeStore";
import { mapGeneratedProjects, type GeneratedRolesPayload } from "./model/resume";
import {
  bootstrapAuth,
  createResumeDraft,
  fetchMyProfile,
  fetchResumeDraft,
  updateResumeDraft,
  type CareerNextUser,
} from "./careernext/api";
import {
  deserializeResumeContent,
  resumeFromProfile,
  serializeResumeContent,
} from "./careernext/mapping";
import SaveBar, { type SaveState } from "./careernext/SaveBar";
import SignInPrompt from "./careernext/SignInPrompt";

/**
 * Connection to CareerNext:
 * - "connecting"  — silent SSO bootstrap + initial data load in flight
 * - "connected"   — signed in; editor is open, Save writes a ResumeDraft
 * - "signin"      — no CareerNext session; user may sign in or go standalone
 * - "standalone"  — original flow (start modal + generation backend), no save
 */
type ConnectMode =
  | { kind: "connecting" }
  | { kind: "connected"; user: CareerNextUser }
  | { kind: "signin" }
  | { kind: "standalone" };

const urlParams = new URLSearchParams(window.location.search);
const initialDraftId = urlParams.get("draftId");
const returnUrl = urlParams.get("returnUrl");

function App() {
  const experienceRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);

  const candidate = useResumeStore((s) => s.resume.candidate);
  const sections = useResumeStore((s) => s.resume.sections);
  const setCandidate = useResumeStore((s) => s.setCandidate);
  const toggleSection = useResumeStore((s) => s.toggleSection);
  const patch = useResumeStore((s) => s.patch);
  const hydrate = useResumeStore((s) => s.hydrate);

  const [mode, setMode] = useState<ConnectMode>({ kind: "connecting" });
  const [draftId, setDraftId] = useState<string | null>(initialDraftId);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Standalone-flow state (original behavior, kept intact).
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const { name, role } = candidate;
    document.title = name && role ? `${name}_${role}_Resume` : "Resume_Builder";
  }, [candidate]);

  // Silent SSO bootstrap: refresh-cookie → access token → hydrate the editor
  // from the requested draft or from the user's CareerNext profile.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await bootstrapAuth();
      if (cancelled) return;
      if (!user) {
        setMode({ kind: "signin" });
        return;
      }
      try {
        if (initialDraftId) {
          const draft = await fetchResumeDraft(initialDraftId);
          if (cancelled) return;
          hydrate(deserializeResumeContent(draft.content, draft.template));
        } else {
          const profile = await fetchMyProfile();
          if (cancelled) return;
          hydrate(resumeFromProfile(user, profile));
        }
        setMode({ kind: "connected", user });
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setMode({ kind: "connected", user });
          setSaveState("error");
          setSaveError("Couldn't load your CareerNext data — starting blank.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  const saveDraft = async () => {
    setSaveState("saving");
    setSaveError(null);
    try {
      const resume = useResumeStore.getState().resume;
      const title = resume.candidate.name
        ? `${resume.candidate.name}${resume.candidate.role ? ` — ${resume.candidate.role}` : ""}`
        : "Untitled Resume";
      const content = serializeResumeContent(resume);
      if (draftId) {
        await updateResumeDraft(draftId, { title, template: resume.template, content });
      } else {
        const created = await createResumeDraft({ title, template: resume.template, content });
        setDraftId(created.id);
        // Reflect the draft in the URL so a reload re-opens it instead of
        // starting a fresh profile-prefilled resume.
        const url = new URL(window.location.href);
        url.searchParams.set("draftId", created.id);
        window.history.replaceState(null, "", url.toString());
      }
      setSaveState("saved");
    } catch (error) {
      console.error(error);
      setSaveState("error");
      setSaveError(error instanceof Error ? error.message : "Save failed.");
    }
  };

  // --- Standalone (original) generation flow ---

  const startStandalone = () => {
    setMode({ kind: "standalone" });
    setIsModalOpen(true);
  };

  const fetchProjects = async (jd: string, experience: string, selectedProjects: string[]) => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await fetch(`${API_BASE_URL}/generate-roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, experience, projects: selectedProjects }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: GeneratedRolesPayload = await response.json();
      patch({
        summary: data.roles_and_responsibilities?.summary ?? "",
        skills: data.roles_and_responsibilities?.tools_and_technologies ?? [],
        careerHighlights: data.roles_and_responsibilities?.bullet_points ?? [],
        projects: mapGeneratedProjects(data),
      });
      setHasContent(true);
    } catch (error) {
      console.error(error);
      setLoadError("Something went wrong generating your resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = ({ experience, education }: { experience: boolean; education: boolean }) => {
    toggleSection("experience", experience);
    toggleSection("education", education);
    if (experience && experienceRef.current) {
      experienceRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (education && educationRef.current) {
      educationRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleModalSubmit = (
    candidatename: string,
    designation: string,
    jd: string,
    experience: string,
    selectedProjects: string[],
    { includeEducation, includeInterests, includeExperiance }: StartModalSubmitOptions,
  ) => {
    if (!candidatename || !designation) {
      alert("Please enter your name and designation before submitting.");
      return;
    }

    setIsModalOpen(false);
    setCandidate({ name: candidatename, role: designation });
    toggleSection("education", includeEducation);
    toggleSection("interests", includeInterests);
    toggleSection("experience", includeExperiance);

    // JD/experience/projects are only needed for AI-assisted generation — if
    // any are skipped (or the generator is unavailable), open the resume
    // shell directly so it can be filled in manually via the editable sections.
    if (jd && experience && selectedProjects.length > 0) {
      fetchProjects(jd, experience, selectedProjects);
    } else {
      setHasContent(true);
    }
  };

  const retry = () => {
    setLoadError(null);
    setIsModalOpen(true);
  };

  const resumeSections = (
    <>
      <div className="section avoid-break">
        <Header />
      </div>

      <div className="section page-break">
        <Careerandprofile />
      </div>
      {sections.experience && (
        <div className="section page-break" ref={experienceRef}>
          <Workexperience />
        </div>
      )}

      <div className="section page-break">
        <Project />
      </div>

      {sections.education && (
        <div className="section page-break" ref={educationRef}>
          <EducationAndOther includeInterests={sections.interests} />
        </div>
      )}
    </>
  );

  const sectionToggles = (
    <div className="btndownContainer no-print">
      <ButtonContainer
        experience={sections.experience}
        education={sections.education}
        onStateChange={handleStateChange}
      />
    </div>
  );

  if (mode.kind === "connecting") {
    return (
      <div className="App">
        <div className="loader">
          <ClipLoader color="#20ddc0" size={50} />
        </div>
      </div>
    );
  }

  if (mode.kind === "signin") {
    return (
      <div className="App">
        <SignInPrompt onContinueStandalone={startStandalone} />
      </div>
    );
  }

  if (mode.kind === "connected") {
    return (
      <>
        <SaveBar
          userName={`${mode.user.firstName} ${mode.user.lastName}`.trim()}
          saveState={saveState}
          errorMessage={saveError}
          returnUrl={returnUrl}
          onSave={saveDraft}
        />
        <div className="App">{resumeSections}</div>
        {sectionToggles}
      </>
    );
  }

  // Standalone: the original start-modal + generation flow (nothing is saved).
  return (
    <>
      <div className="App">
        {loading ? (
          <div className="loader">
            <ClipLoader color="#20ddc0" size={50} />
          </div>
        ) : loadError ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p>{loadError}</p>
            <button onClick={retry} className="no-print">
              Try Again
            </button>
          </div>
        ) : (
          !isModalOpen && hasContent && resumeSections
        )}
      </div>
      {!isModalOpen && hasContent && !loadError && sectionToggles}
      <Startmodal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} />
    </>
  );
}

export default App;
