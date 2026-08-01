import React, { useState } from "react";
import { FaLaptopCode, FaPlus, FaEdit, FaTimes } from "react-icons/fa";
import ContentEditable from "react-contenteditable";
import { useResumeStore } from "../store/resumeStore";

interface EditableProjectDraft {
  name: string;
  technologies: string;
  role: string;
  description: string;
}

const EMPTY_DRAFT: EditableProjectDraft = { name: "", technologies: "", role: "", description: "" };

/**
 * Projects list — backed by `resume.projects` in the store (populated either
 * by the generation flow via `hydrate`/`patch`, or manually via "+").
 */
const Project: React.FC = () => {
  const projects = useResumeStore((s) => s.resume.projects);
  const addProject = useResumeStore((s) => s.addProject);
  const updateProject = useResumeStore((s) => s.updateProject);
  const removeProject = useResumeStore((s) => s.removeProject);

  // Cosmetic per-project "Role" label — the original app never actually saved
  // this onto the project record either (dropped on every add/edit); kept as
  // display-only local state to match that pre-existing behavior exactly.
  const [roles, setRoles] = useState<string[]>([]);
  const roleFor = (index: number) => roles[index] ?? "Software Developer";
  const handleRoleChange = (value: string, index: number) => {
    setRoles((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<EditableProjectDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonHovered2, setIsButtonHovered2] = useState(false);

  const styles: Record<string, React.CSSProperties> = {
    section: { margin: "20px 0", padding: "0 20px" },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      borderBottom: "2px solid #ccc",
      paddingBottom: "5px",
      marginBottom: "10px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    icon: { fontSize: "0.9rem", verticalAlign: "middle", marginRight: "5px", paddingBottom: "5px" },
    list: { marginTop: "5px", fontSize: "14px" },
    listItem: { marginBottom: "5px" },
    projects: { marginLeft: "20px" },
    projectItem: { marginBottom: "15px" },
    subheading: { fontSize: "16px", fontWeight: "600", margin: "10px 0" },
    addIcon: {
      color: "#000",
      borderRadius: "50%",
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "1rem",
      marginLeft: "10px",
    },
    actionIcons: { marginLeft: "10px", cursor: "pointer", fontSize: "1rem", color: "#007bff" },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.5)",
      zIndex: 999,
    },
    headInput: { display: "flex", alignItems: "center", gap: "5px", margin: "0", fontSize: "14px" },
    modal: {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "#fff",
      padding: "20px",
      borderRadius: "20px",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      zIndex: 1000,
      minWidth: "400px",
    },
    card: {
      padding: "10px 35px",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "12px",
      background: "#fff",
      borderRadius: "20px",
    },
    card__title: { fontSize: "25px", fontWeight: "900", color: "#333" },
    card__form: { display: "flex", flexDirection: "column", gap: "10px" },
    input: {
      marginTop: "10px",
      outline: "0",
      background: "rgb(255, 255, 255)",
      boxShadow: "transparent 0px 0px 0px 1px inset",
      padding: "1em",
      borderRadius: "5px",
      border: "1px solid #333",
      color: "black",
    },
    textarea: {
      marginTop: "10px",
      minWidth: "45rem",
      outline: "0",
      background: "rgb(255, 255, 255)",
      boxShadow: "transparent 0px 0px 0px 1px inset",
      padding: "0.6em",
      borderRadius: "5px",
      border: "1px solid #333",
      color: "black",
      resize: "none",
    },
    button: {
      border: "0",
      background: "#111",
      color: "#fff",
      padding: "0.68em",
      borderRadius: "5px",
      fontWeight: "bold",
      flexBasis: "50%",
      fontSize: "15px",
      cursor: "pointer",
    },
    buttonHover: { opacity: "0.9" },
    closeButton: {
      position: "absolute",
      top: "10px",
      right: "10px",
      background: "transparent",
      border: "none",
      fontSize: "35px",
      fontWeight: "900",
      cursor: "pointer",
      color: "#333",
    },
  };

  const handleAddOrEditProject = () => {
    const trimmedName = currentProject.name.trim();
    const trimmedTechnologies = currentProject.technologies.trim();
    const trimmedDescription = currentProject.description.trim();

    if (!trimmedName || !trimmedTechnologies || !trimmedDescription) {
      alert("All fields are required.");
      return;
    }

    const payload = {
      name: trimmedName,
      techStack: trimmedTechnologies.split(","),
      points: trimmedDescription.split("\n"),
    };

    if (editingId) {
      updateProject(editingId, payload);
    } else {
      addProject(payload);
    }

    setIsModalOpen(false);
    setCurrentProject(EMPTY_DRAFT);
    setEditingId(null);
  };

  const handleEdit = (index: number) => {
    const project = projects[index];
    if (!project) return;
    setCurrentProject({
      name: project.name,
      technologies: project.techStack.join(", "),
      role: roleFor(index),
      description: project.points.join("\n"),
    });
    setEditingId(project.id);
    setIsModalOpen(true);
  };

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>
        <FaLaptopCode style={styles.icon} /> Projects
        <div
          className="no-print"
          style={styles.addIcon}
          onClick={() => {
            setCurrentProject(EMPTY_DRAFT);
            setEditingId(null);
            setIsModalOpen(true);
          }}
        >
          <FaPlus />
        </div>
      </h2>
      <div style={styles.projects}>
        {projects.map((project, index) => (
          <div key={project.id} style={styles.projectItem}>
            <p style={styles.subheading}>{project.name}</p>
            <p style={{ margin: "0", fontSize: "14px" }}>
              {" "}
              <b>Technologies used : </b>
              {project.techStack.join(", ")}
            </p>
            <p style={styles.headInput}>
              {" "}
              <b>Role: </b>{" "}
              <ContentEditable
                html={roleFor(index)}
                tagName="p"
                onChange={(e) => handleRoleChange(e.target.value, index)}
                style={{ padding: "5px", margin: "0", fontSize: "14px" }}
              />
            </p>
            <ul style={styles.list}>
              {project.points.map((desc, idx) => (
                <li style={styles.listItem} key={idx}>
                  {desc}
                </li>
              ))}
            </ul>
            <FaEdit className="no-print" style={styles.actionIcons} onClick={() => handleEdit(index)} title="Edit Project" />
            <FaTimes
              className="no-print"
              style={{ ...styles.actionIcons, color: "#ff4d4d" }}
              onClick={() => removeProject(project.id)}
              title="Delete Project"
            />
          </div>
        ))}
      </div>

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <>
          <div className="no-print" style={styles.overlay} onClick={() => setIsModalOpen(false)} />
          <div className="no-print" style={styles.modal}>
            <div style={styles.card}>
              <button style={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
              <span style={styles.card__title}>{editingId ? "Edit Project" : "Add New Project"}</span>
              <div style={styles.card__form}>
                <input
                  style={styles.input}
                  value={currentProject.name}
                  onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                  placeholder="Project Name"
                />
                <input
                  style={styles.input}
                  value={currentProject.technologies}
                  onChange={(e) => setCurrentProject({ ...currentProject, technologies: e.target.value })}
                  placeholder="Technologies Used (comma separated)"
                />
                <textarea
                  style={styles.textarea}
                  value={currentProject.description
                    .split("\n")
                    .map((line) => (line.trim() ? `• ${line.trim()}` : ""))
                    .join("\n")}
                  onChange={(e) =>
                    setCurrentProject({
                      ...currentProject,
                      description: e.target.value
                        .split("\n")
                        .map((line) => line.replace(/^•\s*/, "").trim())
                        .join("\n"),
                    })
                  }
                  placeholder="Roles and Responsibilities (Enter each point in a new line)"
                  rows={16}
                />
                <div
                  style={{
                    display: "flex",
                    gap: "50px",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    marginTop: "1rem",
                  }}
                >
                  <button
                    style={{ ...styles.button, ...(isButtonHovered2 ? styles.buttonHover : {}) }}
                    onMouseEnter={() => setIsButtonHovered2(true)}
                    onMouseLeave={() => setIsButtonHovered2(false)}
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    style={{ ...styles.button, ...(isButtonHovered ? styles.buttonHover : {}) }}
                    onMouseEnter={() => setIsButtonHovered(true)}
                    onMouseLeave={() => setIsButtonHovered(false)}
                    onClick={handleAddOrEditProject}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Project;
