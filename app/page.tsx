"use client";
import { useState } from "react";
import IdeaModal from "./components/IdeaModal";

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false);

  const handleIdeaSubmitted = (data: any) => {
    console.log("Idea submitted:", data);
    setShowModal(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ color: "white", marginBottom: "1.5rem" }}>Dashboard</h1>
      <button
        style={{
          backgroundColor: '#001233',
          borderColor: 'white',
          borderStyle: 'solid',
          borderWidth: '1px',
          padding: '0.75rem 1.5rem',
          borderRadius: '5px',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 200ms ease-out',
          fontSize: '1rem',
          fontFamily: 'inherit'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = 'drop-shadow(0 0 4px white)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = 'none';
        }}
        onClick={() => setShowModal(true)}
      >
        Open Idea Modal
      </button>

      {showModal && (
        <IdeaModal
          onClose={() => setShowModal(false)}
          onIdeaSubmitted={handleIdeaSubmitted}
        />
      )}
    </div>
  );
}