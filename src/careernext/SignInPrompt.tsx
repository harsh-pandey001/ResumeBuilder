import React from "react";
import { CAREERNEXT_WEB_URL } from "./api";

interface SignInPromptProps {
  onContinueStandalone: () => void;
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { textAlign: "center", padding: "80px 20px", maxWidth: "460px", margin: "0 auto" },
  title: { fontSize: "22px", fontWeight: 700, marginBottom: "10px" },
  text: { fontSize: "14px", color: "#555", marginBottom: "24px" },
  signIn: {
    display: "inline-block",
    backgroundColor: "#3366cc",
    color: "#fff",
    borderRadius: "6px",
    padding: "10px 22px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
  },
  standalone: {
    display: "block",
    marginTop: "18px",
    fontSize: "13px",
    color: "#3366cc",
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
    marginLeft: "auto",
    marginRight: "auto",
  },
};

const SignInPrompt: React.FC<SignInPromptProps> = ({ onContinueStandalone }) => (
  <div style={styles.wrap}>
    <p style={styles.title}>Sign in to CareerNext</p>
    <p style={styles.text}>
      The Resume Builder uses your CareerNext account to prefill your details and save your
      resumes back to your Resume section.
    </p>
    <a style={styles.signIn} href={`${CAREERNEXT_WEB_URL}/login`}>
      Sign in to CareerNext
    </a>
    <button style={styles.standalone} onClick={onContinueStandalone}>
      Continue without CareerNext (nothing will be saved)
    </button>
  </div>
);

export default SignInPrompt;
