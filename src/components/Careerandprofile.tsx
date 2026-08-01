import React, { useState } from "react";
import { FaRegListAlt, FaPlus, FaTimes, FaEdit } from "react-icons/fa";
import ContentEditable from "react-contenteditable";
import { useResumeStore } from "../store/resumeStore";
import { stripTags } from "../utils/sanitize";

/** Career Summary bullet list — backed by `resume.careerHighlights` in the store. */
const Careerandprofile: React.FC = () => {
  const careerPoints = useResumeStore((s) => s.resume.careerHighlights);
  const addToList = useResumeStore((s) => s.addToList);
  const updateInList = useResumeStore((s) => s.updateInList);
  const removeFromList = useResumeStore((s) => s.removeFromList);

  // Section heading is a display label, not resume data — kept local.
  const [name, setName] = useState("Career Summary");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPoint, setCurrentPoint] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
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
    headInput: { paddingTop: "5px" },
    icon: { fontSize: "0.9rem", verticalAlign: "middle", marginRight: "5px" },
    list: { fontSize: "14px" },
    listItem: { marginBottom: "10px", whiteSpace: "pre-wrap", wordWrap: "break-word" },
    actionIcons: { marginLeft: "10px", cursor: "pointer", fontSize: "1rem", color: "#007bff" },
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
      minWidth: "300px",
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.5)",
      zIndex: 999,
    },
    card: {
      height: "400px",
      maxWidth: "800px",
      padding: "0 50px",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "12px",
      background: "#fff",
      borderRadius: "20px",
    },
    card__title: { fontSize: "27px", fontWeight: "900", color: "#333" },
    card__form: { display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" },
    button: {
      border: "0",
      background: "#111",
      color: "#fff",
      padding: "0.68em",
      borderRadius: "5px",
      fontWeight: "bold",
      flexBasis: "50%",
      fontSize: "18px",
      cursor: "pointer",
    },
    buttonHover: { opacity: "0.9" },
    textarea: {
      marginTop: "10px",
      minWidth: "35rem",
      outline: "0",
      background: "rgb(255, 255, 255)",
      boxShadow: "transparent 0px 0px 0px 1px inset",
      padding: "0.6em",
      borderRadius: "5px",
      border: "1px solid #333",
      color: "black",
      resize: "none",
    },
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

  const handleAddOrEditPoint = () => {
    const trimmed = currentPoint.trim();
    if (!trimmed) {
      alert("All fields are required.");
      return;
    }
    if (editingIndex !== null) {
      updateInList("careerHighlights", editingIndex, currentPoint);
    } else {
      addToList("careerHighlights", currentPoint);
    }
    setCurrentPoint("");
    setEditingIndex(null);
    setIsModalOpen(false);
  };

  const handleEdit = (index: number) => {
    setCurrentPoint(careerPoints[index] ?? "");
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  return (
    <>
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <FaRegListAlt style={styles.icon} />
          <ContentEditable
            html={name}
            onChange={(e) => setName(stripTags(e.target.value))}
            style={styles.headInput}
          />
          <div
            className="no-print"
            style={styles.addIcon}
            onClick={() => {
              setCurrentPoint("");
              setEditingIndex(null);
              setIsModalOpen(true);
            }}
          >
            <FaPlus />
          </div>
        </h2>
        <ul style={styles.list}>
          {careerPoints.map((point, index) => (
            <li key={index} style={styles.listItem}>
              {point}
              <FaEdit
                className="no-print"
                style={styles.actionIcons}
                onClick={() => handleEdit(index)}
                title="Edit point"
              />
              <FaTimes
                className="no-print"
                style={{ ...styles.actionIcons, color: "#ff4d4d" }}
                onClick={() => removeFromList("careerHighlights", index)}
                title="Delete point"
              />
            </li>
          ))}
        </ul>

        {/* Add / edit point modal */}
        {isModalOpen && (
          <>
            <div className="no-print" style={styles.overlay} onClick={() => setIsModalOpen(false)} />
            <div className="no-print" style={styles.modal}>
              <div style={styles.card}>
                <button style={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                  &times;
                </button>
                <span style={styles.card__title}>
                  {editingIndex !== null ? "Edit Point" : "Add New Point"}
                </span>
                <div style={styles.card__form}>
                  <textarea
                    style={styles.textarea}
                    value={currentPoint}
                    onChange={(e) => setCurrentPoint(e.target.value)}
                    placeholder="Enter career point"
                    rows={10}
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
                      onClick={handleAddOrEditPoint}
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

export default Careerandprofile;
