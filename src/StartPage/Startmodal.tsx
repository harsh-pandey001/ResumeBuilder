import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { ClipLoader } from "react-spinners";
import { API_BASE_URL } from "../config";

Modal.setAppElement("#root");

export interface StartModalSubmitOptions {
  includeEducation: boolean;
  includeInterests: boolean;
  includeExperiance: boolean;
}

interface StartmodalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    candidatename: string,
    designation: string,
    jd: string,
    experience: string,
    selectedProjects: string[],
    options: StartModalSubmitOptions,
  ) => void;
}

interface ProjectListItem {
  _id: { $oid: string };
  name: string;
}

type FocusableField = "" | "candidatename" | "designation" | "experience" | "jd";

const Startmodal: React.FC<StartmodalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [projectList, setProjectList] = useState<ProjectListItem[]>([]);
  const [candidatename, setCandidatename] = useState("");
  const [designation, setDesignation] = useState("");
  const [jd, setJd] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [includeEducation, setIncludeEducation] = useState(false);
  const [includeInterests, setIncludeInterests] = useState(false);
  const [includeExperiance, setIncludeExperiance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusableField>("");

  const handleFocus = (field: FocusableField) => setFocusedField(field);

  const handleBlur = (field: FocusableField) => {
    if (field === "candidatename" && !candidatename) setFocusedField("");
    if (field === "designation" && !designation) setFocusedField("");
    if (field === "experience" && !experience) setFocusedField("");
    if (field === "jd" && !jd) setFocusedField("");
  };

  const styles: Record<string, React.CSSProperties> = {
    loader: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      width: "400px",
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: "10px",
      padding: "0px 20px",
      width: "350px",
      display: "flex",
      flexDirection: "column",
    },
    form: { marginTop: "15px", display: "flex", flexDirection: "column" },
    title: { textAlign: "center", fontSize: "20px", fontWeight: "600" },
    group: { position: "relative" },
    inputarea: {
      padding: "10px",
      marginBottom: "10px",
      borderRadius: "5px",
      border: "1px solid rgba(0, 0, 0, 0.2)",
      outline: "none",
      width: "100%",
      backgroundColor: "transparent",
      transition: "border-color 0.3s ease",
      caretColor: "auto",
      color: "black",
    },
    label: {
      fontSize: "14px",
      color: "rgba(99, 102, 102, 0.8)",
      position: "absolute",
      top: "10px",
      left: "10px",
      backgroundColor: "#fff",
      transition: "all 0.3s ease",
      padding: "0 4px",
      pointerEvents: "none",
    },
    labelFloating: {
      top: "-5px",
      left: "10px",
      backgroundColor: "#fff",
      color: "#3366cc",
      fontWeight: "600",
      fontSize: "10px",
    },
    // Was referenced as `inputareaFocus` (a typo) and so never applied — fixed
    // to actually match, so the focus border color now works as intended.
    inputFocus: { borderColor: "#3366cc", outline: "none" },
    textarea: { resize: "none", height: "100px", marginBottom: "5px" },
    button: {
      backgroundColor: "#3366cc",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      padding: "8px",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginTop: "5px",
      width: "50%",
    },
    buttonHover: { backgroundColor: "#27408b" },
    pjtitle: { textAlign: "center", fontSize: "15px", fontWeight: "600" },
    projectGrid: { display: "flex", flexWrap: "wrap", gap: "5px", padding: "0px 5px", justifyContent: "flex-start" },
    project: { fontSize: "13px", fontWeight: "400", display: "flex", alignItems: "center" },
    checks: { display: "flex", alignItems: "center" },
    eduwork: { fontSize: "13px", fontWeight: "400", display: "flex", justifyContent: "space-between", marginBottom: "10px" },
  };

  useEffect(() => {
    const fetchProjectlist = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/list-projects`);
        const data = await response.json();
        setProjectList(data.projects || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectlist();
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(candidatename, designation, jd, experience, selectedProjects, {
      includeEducation,
      includeInterests,
      includeExperiance,
    });
  };

  return (
    <>
      {loading ? (
        <div style={styles.loader}>
          <ClipLoader color="#20ddc0" size={50} />
        </div>
      ) : (
        <Modal
          isOpen={isOpen}
          onRequestClose={onClose}
          shouldCloseOnOverlayClick={false}
          contentLabel="Project Form"
          style={{ content: styles.content, overlay: { background: "#fff" } }}
        >
          <div style={styles.card}>
            <span style={styles.title}>Enter Resume Details</span>
            <form style={styles.form} onSubmit={handleFormSubmit}>
              <div style={styles.group}>
                <input
                  style={{
                    ...styles.inputarea,
                    ...(focusedField === "candidatename" || candidatename ? styles.inputFocus : {}),
                  }}
                  value={candidatename}
                  type="text"
                  onChange={(e) => setCandidatename(e.target.value)}
                  onFocus={() => handleFocus("candidatename")}
                  onBlur={() => handleBlur("candidatename")}
                />
                <label
                  style={{
                    ...styles.label,
                    ...(focusedField === "candidatename" || candidatename ? styles.labelFloating : {}),
                  }}
                >
                  Name
                </label>
              </div>

              <div style={styles.group}>
                <input
                  style={{
                    ...styles.inputarea,
                    ...(focusedField === "designation" || designation ? styles.inputFocus : {}),
                  }}
                  value={designation}
                  type="text"
                  onChange={(e) => setDesignation(e.target.value)}
                  onFocus={() => handleFocus("designation")}
                  onBlur={() => handleBlur("designation")}
                />
                <label
                  style={{
                    ...styles.label,
                    ...(focusedField === "designation" || designation ? styles.labelFloating : {}),
                  }}
                >
                  Designation
                </label>
              </div>

              <div style={styles.group}>
                <input
                  style={{
                    ...styles.inputarea,
                    ...(focusedField === "experience" || experience ? styles.inputFocus : {}),
                  }}
                  value={experience}
                  type="text"
                  onChange={(e) => setExperience(e.target.value)}
                  onFocus={() => handleFocus("experience")}
                  onBlur={() => handleBlur("experience")}
                />
                <label
                  style={{
                    ...styles.label,
                    ...(focusedField === "experience" || experience ? styles.labelFloating : {}),
                  }}
                >
                  Experience
                </label>
              </div>
              <div style={styles.eduwork}>
                <div>
                  <label style={styles.checks}>
                    <input
                      type="checkbox"
                      checked={includeEducation}
                      onChange={(e) => setIncludeEducation(e.target.checked)}
                    />
                    Include Education
                  </label>
                  {includeEducation && (
                    <div>
                      <label style={styles.checks}>
                        <input
                          type="checkbox"
                          checked={includeInterests}
                          onChange={(e) => setIncludeInterests(e.target.checked)}
                        />
                        Include Interests
                      </label>
                    </div>
                  )}
                </div>
                <div>
                  <label style={styles.checks}>
                    <input
                      type="checkbox"
                      checked={includeExperiance}
                      onChange={(e) => setIncludeExperiance(e.target.checked)}
                    />
                    Include Experiance
                  </label>
                </div>
              </div>
              <div style={styles.group}>
                <textarea
                  style={{
                    ...styles.inputarea,
                    ...styles.textarea,
                    ...(focusedField === "jd" || jd ? styles.inputFocus : {}),
                  }}
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  onFocus={() => handleFocus("jd")}
                  onBlur={() => handleBlur("jd")}
                />
                <label style={{ ...styles.label, ...(focusedField === "jd" || jd ? styles.labelFloating : {}) }}>
                  Job Description (JD)
                </label>
              </div>
              <div style={styles.pjtitle}>Add Projects</div>
              <div style={styles.projectGrid}>
                {projectList.map((project) => (
                  <div style={styles.project} key={project._id.$oid}>
                    <input
                      type="checkbox"
                      id={project._id.$oid}
                      checked={selectedProjects.includes(project._id.$oid)}
                      onChange={() =>
                        setSelectedProjects((prev) =>
                          prev.includes(project._id.$oid)
                            ? prev.filter((id) => id !== project._id.$oid)
                            : [...prev, project._id.$oid],
                        )
                      }
                    />
                    <label htmlFor={project._id.$oid}>{project.name}</label>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "5px" }}>
                <button
                  type="submit"
                  style={{ ...styles.button, ...(isButtonHovered ? styles.buttonHover : {}) }}
                  onMouseEnter={() => setIsButtonHovered(true)}
                  onMouseLeave={() => setIsButtonHovered(false)}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Startmodal;
