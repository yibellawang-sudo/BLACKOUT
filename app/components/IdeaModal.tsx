"use client";
import { useState } from "react";
import { MEMES } from "@/lib/memes";

export type Idea = {
  id: string;
  title: string;
  text: string;
  meme_id: string;
  created_at?: string;
  author_name?: string;
};

interface IdeaModalProps {
  onClose: () => void;
  onIdeaSubmitted: (idea: { title: string; text: string; meme: string }) => void;
  idea?: Idea;
}

export default function IdeaModal({ onClose, onIdeaSubmitted, idea }: IdeaModalProps) {
  const isViewMode = !!idea;

  const [title, setTitle] = useState(idea?.title || "");
  const [text, setText] = useState(idea?.text || "");
  const [meme, setMeme] = useState<string>(idea?.meme_id || "");
  const [submitted, setSubmitted] = useState(false);

  const selectedMeme = MEMES.find((m) => m.id === meme);

  const handleSubmit = async () => {
    if (!title || !text || !meme) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, text, meme }),
      });

      const json = await res.json();

      if (json?.data) {
        setSubmitted(true);
        setTimeout(() => {
          onIdeaSubmitted({ title, text, meme });
          onClose();
        }, 1500);
      } else {
        alert("Error: " + (json.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to submit idea:", err);
      alert("Network error: " + err);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: "1rem",
      }}
    >
      <div
        style={{
          position: "relative",
          backgroundColor: "#1a1d2e",
          borderRadius: "1rem",
          maxWidth: "32rem",
          width: "100%",
          padding: "2rem",
          border: "1px solid rgba(255,255,255,0.1)",
          fontFamily: "'Ningrat', sans-serif",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            width: "2rem",
            height: "2rem",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontSize: "1.5rem",
          }}
        >
          ×
        </button>

        {isViewMode ? (
          // VIEW MODE
          <div style={{ textAlign: "center" }}>
            <h2 style={{ 
              color: "#fff", 
              marginBottom: "1rem",
              fontFamily: "'Chopsic', sans-serif"
            }}>
              {idea?.title}
            </h2>
            {MEMES.find((m) => m.id === idea?.meme_id) && (
              <img
                src={MEMES.find((m) => m.id === idea?.meme_id)?.image}
                alt={MEMES.find((m) => m.id === idea?.meme_id)?.label}
                style={{
                  width: "100%",
                  maxWidth: "250px",
                  height: "auto",
                  borderRadius: "0.5rem",
                  marginBottom: "1rem",
                }}
              />
            )}
            <p style={{ color: "#a3a3a3", marginBottom: "0.5rem" }}>{idea?.text}</p>
            {idea?.created_at && (
              <p style={{ fontSize: "0.8rem", color: "#737373" }}>
                Author: {idea?.author_name ?? "Unknown"} •{" "}
                {new Date(idea.created_at).toLocaleDateString()}
              </p>
            )}
            <button
              style={{
                marginTop: "1rem",
                padding: "0.75rem",
                width: "100%",
                backgroundColor: "rgba(252, 211, 77, 0.15)",
                border: "1px solid rgba(252, 211, 77, 0.3)",
                borderRadius: "0.5rem",
                color: "#fff",
                cursor: "pointer",
                fontFamily: "'Ningrat', sans-serif",
              }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : !submitted ? (
          // CREATE MODE
          <>
            <h2 style={{ 
              color: "#fff", 
              marginBottom: "1.5rem", 
              fontSize: "1.5rem",
              fontFamily: "'Chopsic', sans-serif"
            }}>
              Start typing your idea...
            </h2>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#a3a3a3", marginBottom: "0.5rem" }}>
                Idea Title
              </label>
              <input
                type="text"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.5rem",
                  color: "#fff",
                  fontFamily: "'Ningrat', sans-serif",
                }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#a3a3a3", marginBottom: "0.5rem" }}>
                Idea Description
              </label>
              <textarea
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.5rem",
                  color: "#fff",
                  minHeight: "5rem",
                  fontFamily: "'Ningrat', sans-serif",
                }}
                placeholder="Type your idea here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", color: "#a3a3a3", marginBottom: "0.5rem" }}>
                Choose a Meme
              </label>
              <select
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.5rem",
                  color: "#fff",
                  fontFamily: "'Ningrat', sans-serif",
                  cursor: "pointer",
                }}
                value={meme}
                onChange={(e) => setMeme(e.target.value)}
              >
                <option value="">Select a meme...</option>
                {MEMES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>

              {selectedMeme && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(252, 211, 77, 0.2)",
                  }}
                >
                  <img
                    src={selectedMeme.image}
                    alt={selectedMeme.label}
                    style={{
                      width: "100%",
                      maxWidth: "250px",
                      height: "auto",
                      borderRadius: "0.5rem",
                      display: "block",
                      margin: "0 auto",
                    }}
                  />
                </div>
              )}
            </div>

            <button
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "rgba(252, 211, 77, 0.15)",
                border: "1px solid rgba(252, 211, 77, 0.3)",
                borderRadius: "0.5rem",
                color: "#fff",
                cursor: !title || !text || !meme ? "not-allowed" : "pointer",
                opacity: !title || !text || !meme ? 0.4 : 1,
                fontFamily: "'Ningrat', sans-serif",
              }}
              onClick={handleSubmit}
              disabled={!title || !text || !meme}
            >
              Save Idea
            </button>
          </>
        ) : (
          // SUBMITTED MESSAGE
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
            <h3 style={{ 
              color: "#fff", 
              marginBottom: "0.5rem",
              fontFamily: "'Chopsic', sans-serif"
            }}>
              Idea Submitted
            </h3>
            <p style={{ color: "#737373", marginBottom: "1.5rem" }}>
              Your idea has been added to the constellation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}