import React, { useEffect } from "react";
import { FaGraduationCap, FaBook } from "react-icons/fa";
import ContentEditable from "react-contenteditable";
import { useResumeStore } from "../store/resumeStore";
import { stripTags } from "../utils/sanitize";

interface EducationAndOtherProps {
  includeInterests: boolean;
}

const DEFAULT_INSTITUTION = "Your Degree Name, College Name";
const DEFAULT_YEAR = "Time period | Place";
const DEFAULT_INTERESTS = "Cycling | Reading | Automating Stuff with Code";

/**
 * Education + Interests. Education keeps the original app's single-entry
 * behavior (multi-entry CRUD is a P1 template concern) but now backs it with
 * `resume.education[0]` in the store instead of local-only state. Interests
 * was static, unsaved placeholder text before — now a real, editable,
 * store-backed field.
 */
const EducationAndOther: React.FC<EducationAndOtherProps> = ({ includeInterests }) => {
  const education = useResumeStore((s) => s.resume.education);
  const addEducation = useResumeStore((s) => s.addEducation);
  const updateEducation = useResumeStore((s) => s.updateEducation);
  const interests = useResumeStore((s) => s.resume.interests);
  const patch = useResumeStore((s) => s.patch);

  useEffect(() => {
    if (education.length === 0) {
      addEducation({ institution: DEFAULT_INSTITUTION, year: DEFAULT_YEAR });
    }
    // Seed once on mount only — this component always shows entry [0].
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entry = education[0];
  const interestsText = interests[0] ?? DEFAULT_INTERESTS;

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
    educationContent: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
    eduDegree: { fontWeight: "bold", marginBottom: "5px" },
    eduYear: { color: "#666", fontSize: "0.9rem" },
  };

  if (!entry) return null;

  return (
    <>
      {/* Education Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <FaGraduationCap style={styles.icon} /> Education
        </h2>
        <div style={styles.educationContent}>
          <div>
            <p style={styles.eduDegree}>
              <ContentEditable
                html={entry.institution}
                onChange={(e) => updateEducation(entry.id, { institution: stripTags(e.target.value) })}
                style={{ padding: "5px" }}
              />
            </p>
          </div>
          <p style={styles.eduYear}>
            <ContentEditable
              html={entry.year}
              onChange={(e) => updateEducation(entry.id, { year: stripTags(e.target.value) })}
              style={{ padding: "5px" }}
            />
          </p>
        </div>
      </div>

      {/* Interests Section */}
      {includeInterests && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <FaBook style={styles.icon} /> Interests
          </h2>
          <ContentEditable
            html={interestsText}
            onChange={(e) => patch({ interests: [stripTags(e.target.value)] })}
            style={{ fontSize: "14px", padding: "5px" }}
          />
        </div>
      )}
    </>
  );
};

export default EducationAndOther;
