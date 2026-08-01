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

function App() {
  const experienceRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);

  const candidate = useResumeStore((s) => s.resume.candidate);
  const sections = useResumeStore((s) => s.resume.sections);
  const setCandidate = useResumeStore((s) => s.setCandidate);
  const toggleSection = useResumeStore((s) => s.toggleSection);
  const patch = useResumeStore((s) => s.patch);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [hasContent, setHasContent] = useState(false);
  // The original app had NO error UI at all — a failed fetch left the loader
  // spinning forever with only a console.error. This is a real P0 hardening gap.
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const { name, role } = candidate;
    document.title = name && role ? `${name}_${role}_Resume` : "Resume_Builder";
  }, [candidate]);

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
          !isModalOpen &&
          hasContent && (
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
          )
        )}
      </div>
      {!isModalOpen && hasContent && !loadError && (
        <div className="btndownContainer no-print">
          <ButtonContainer onStateChange={handleStateChange} />
        </div>
      )}
      <Startmodal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} />
    </>
  );
}

export default App;
