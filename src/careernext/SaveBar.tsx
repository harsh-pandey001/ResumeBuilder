import React from "react";
import { CAREERNEXT_WEB_URL } from "./api";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface SaveBarProps {
  userName: string;
  saveState: SaveState;
  errorMessage: string | null;
  returnUrl: string | null;
  onSave: () => void;
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "10px 20px",
    backgroundColor: "rgba(0, 73, 144)",
    color: "#fff",
    boxShadow: "rgba(0, 0, 0, 0.25) 0px 2px 8px",
  },
  brand: { fontWeight: 700, fontSize: "15px" },
  status: { fontSize: "13px", opacity: 0.9 },
  actions: { display: "flex", alignItems: "center", gap: "10px" },
  save: {
    backgroundColor: "#20ddc0",
    color: "#00344d",
    border: "none",
    borderRadius: "6px",
    padding: "8px 18px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  back: {
    color: "#fff",
    fontSize: "13px",
    textDecoration: "underline",
    cursor: "pointer",
  },
};

const SaveBar: React.FC<SaveBarProps> = ({ userName, saveState, errorMessage, returnUrl, onSave }) => {
  const backHref = returnUrl ?? `${CAREERNEXT_WEB_URL}/resume`;
  const status =
    saveState === "saving"
      ? "Saving…"
      : saveState === "saved"
        ? "Saved to CareerNext"
        : saveState === "error"
          ? (errorMessage ?? "Save failed.")
          : "";

  return (
    <div className="no-print" style={styles.bar}>
      <span style={styles.brand}>CareerNext Resume Builder · {userName}</span>
      <div style={styles.actions}>
        <span style={{ ...styles.status, ...(saveState === "error" ? { color: "#ffb4a2" } : {}) }}>
          {status}
        </span>
        <button style={styles.save} onClick={onSave} disabled={saveState === "saving"}>
          {saveState === "saving" ? "Saving…" : "Save"}
        </button>
        <a style={styles.back} href={backHref}>
          Back to CareerNext
        </a>
      </div>
    </div>
  );
};

export default SaveBar;
