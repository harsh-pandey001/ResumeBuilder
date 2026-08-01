import React, { useState } from "react";
import ContentEditable from "react-contenteditable";
import { FaUser, FaTools, FaPlus, FaTimes } from "react-icons/fa";
import { useResumeStore } from "../store/resumeStore";
import { stripTags } from "../utils/sanitize";

/**
 * Identity + About + Skills. Reads/writes the shared resume store (was: local
 * `useState` copies that never synced back to the app).
 */
const Header: React.FC = () => {
  const name = useResumeStore((s) => s.resume.candidate.name);
  const role = useResumeStore((s) => s.resume.candidate.role);
  const about = useResumeStore((s) => s.resume.summary);
  const skills = useResumeStore((s) => s.resume.skills);
  const setCandidate = useResumeStore((s) => s.setCandidate);
  const setSummary = useResumeStore((s) => s.setSummary);
  const addToList = useResumeStore((s) => s.addToList);
  const updateInList = useResumeStore((s) => s.updateInList);
  const removeFromList = useResumeStore((s) => s.removeFromList);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonHovered2, setIsButtonHovered2] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = () => {
    const value = newSkill.trim();
    if (!value) {
      alert("Enter the Skill Please");
      return;
    }
    if (!skills.includes(value)) {
      addToList("skills", value);
    }
    setNewSkill("");
    setIsModalOpen(false);
  };

  const styles: Record<string, React.CSSProperties> = {
    header: { textAlign: "center", paddingBottom: "10px", marginBottom: "20px" },
    h1: { margin: "0", fontSize: "24px", textAlign: "center" },
    p: { margin: "5px 0", fontSize: "14px", color: "#555" },
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
    icon: {
      fontSize: "0.9rem",
      verticalAlign: "middle",
      marginRight: "5px",
      paddingBottom: "5px",
    },
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
    modal: {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "#fff",
      borderRadius: "20px",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      zIndex: 1000,
      minWidth: "275px",
    },
    card: {
      height: "250px",
      width: "300px",
      padding: "0 35px",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "15px",
      background: "#fff",
      borderRadius: "20px",
    },
    card__title: { fontSize: "23px", fontWeight: "900", color: "#333" },
    card__form: { display: "flex", flexDirection: "column", gap: "25px" },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.5)",
      zIndex: 999,
    },
    list: {
      fontSize: "14px",
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      padding: "0 1rem",
      margin: 0,
      listStyleType: "disc",
    },
    listItem: { margin: 0 },
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
    input: {
      marginTop: "10px",
      outline: "0",
      background: "rgb(255, 255, 255)",
      boxShadow: "transparent 0px 0px 0px 1px inset",
      padding: "0.9em 0.6em",
      minWidth: "280px",
      borderRadius: "5px",
      border: "1px solid #333",
      color: "black",
    },
    removeIcon: { color: "#000", cursor: "pointer", fontSize: "14px" },
    closeButton: {
      position: "absolute",
      top: "10px",
      right: "10px",
      background: "transparent",
      border: "none",
      fontSize: "25px",
      fontWeight: "900",
      cursor: "pointer",
      color: "#333",
    },
  };

  return (
    <>
      <div style={styles.header}>
        <ContentEditable
          html={name}
          tagName="h1"
          onChange={(e) => setCandidate({ name: stripTags(e.target.value) })}
          style={styles.h1}
        />
        <ContentEditable
          html={role}
          tagName="p"
          onChange={(e) => setCandidate({ role: stripTags(e.target.value) })}
          style={styles.p}
        />
      </div>

      {/* About Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <FaUser style={styles.icon} />
          About Me
        </h2>
        <ContentEditable
          html={about}
          tagName="p"
          onChange={(e) => setSummary(stripTags(e.target.value))}
          style={styles.p}
        />
      </div>

      {/* Skills Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <FaTools style={styles.icon} /> Skills
          <div style={styles.addIcon} onClick={() => setIsModalOpen(true)}>
            <FaPlus className="no-print" />
          </div>
        </h2>

        <ul style={styles.list}>
          {skills.map((skill, index) => (
            <li key={index} style={styles.listItem}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <ContentEditable
                  html={skill}
                  onChange={(e) => updateInList("skills", index, stripTags(e.target.value))}
                  style={{ padding: "5px", borderRadius: "5px" }}
                />
                <FaTimes
                  className="no-print"
                  style={styles.removeIcon}
                  onClick={() => removeFromList("skills", index)}
                  title="Remove skill"
                />
              </div>
            </li>
          ))}
        </ul>

        {/* Add skill box */}
        {isModalOpen && (
          <>
            <div style={styles.overlay} onClick={() => setIsModalOpen(false)} />
            <div style={styles.modal}>
              <div style={styles.card}>
                <button style={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                  &times;
                </button>
                <span style={styles.card__title}>Add New Skill</span>
                <div style={styles.card__form}>
                  <input
                    type="text"
                    style={styles.input}
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Enter skill name"
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
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
                      onClick={handleAddSkill}
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
    </>
  );
};

export default Header;
