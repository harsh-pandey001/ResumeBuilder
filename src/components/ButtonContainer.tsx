import React, { useState } from "react";
import { FaBriefcase, FaGraduationCap } from "react-icons/fa";

interface ButtonContainerProps {
  // Controlled from the resume store's `sections` — a prefilled resume (e.g.
  // hydrated from CareerNext) starts with sections already on, so this
  // component must not assume everything starts hidden.
  experience: boolean;
  education: boolean;
  onStateChange: (state: { experience: boolean; education: boolean }) => void;
}

const ButtonContainer: React.FC<ButtonContainerProps> = ({ experience, education, onStateChange }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonHovered2, setIsButtonHovered2] = useState(false);
  const [isContianerHovered, setIsContianerHovered] = useState(false);

  const styles: Record<string, React.CSSProperties> = {
    buttonContainer: {
      display: "flex",
      backgroundColor: "rgba(0, 73, 144)",
      width: "40px",
      height: "100px",
      alignItems: "center",
      justifyContent: "space-around",
      borderRadius: "10px",
      boxShadow:
        "rgba(0, 0, 0, 0.35) 0px 5px 15px, rgba(0, 73, 144, 0.5) 5px 10px 15px",
      transition: "all 0.5s",
      flexDirection: "column",
    },
    button: {
      outline: "0",
      border: "0",
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      backgroundColor: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      transition: "all ease-in-out 0.3s",
      cursor: "pointer",
    },
    buttonHover: { transform: "translateY(-3px)" },
    buttonContainerHover: { height: "125px", transition: "all 0.5s" },
    icon: { fontSize: "20px" },
  };

  const handleClick = (type: "experience" | "education") => {
    if (type === "experience") {
      onStateChange({ experience: !experience, education });
    } else {
      onStateChange({ experience, education: !education });
    }
  };

  return (
    <div
      style={{ ...styles.buttonContainer, ...(isContianerHovered ? styles.buttonContainerHover : {}) }}
      onMouseEnter={() => setIsContianerHovered(true)}
      onMouseLeave={() => setIsContianerHovered(false)}
    >
      <button
        style={{
          ...styles.button,
          ...(isButtonHovered ? styles.buttonHover : {}),
          color: experience ? "rgba(245, 73, 144)" : "#fff",
        }}
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
        onClick={() => handleClick("experience")}
      >
        <FaBriefcase style={styles.icon} />
      </button>

      <button
        style={{
          ...styles.button,
          ...(isButtonHovered2 ? styles.buttonHover : {}),
          color: education ? "rgba(245, 73, 144)" : "#fff",
        }}
        onMouseEnter={() => setIsButtonHovered2(true)}
        onMouseLeave={() => setIsButtonHovered2(false)}
        onClick={() => handleClick("education")}
      >
        <FaGraduationCap style={styles.icon} />
      </button>
    </div>
  );
};

export default ButtonContainer;
