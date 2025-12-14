"use client";

import { useState, useEffect } from "react";
import IdeaModal from "./components/IdeaModal";

type View = "network" | "personal";
import { MEMES } from "@/lib/memes";

import Image from "next/image";

const MEME_LOOKUP = MEMES.reduce((acc, meme) => {
  acc[meme.id] = meme;
  return acc;
}, {} as Record<string, { id: string; label: string; image: string }>);

export default function Home() {
  const [view, setView] = useState<View>("network");
  const [showModal, setShowModal] = useState(false);
  const [networkIdeas, setNetworkIdeas] = useState<any[]>([]);
  const [personalIdeas, setPersonalIdeas] = useState<any[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [editText, setEditText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch all ideas for network view
  useEffect(() => {
    if (view === "network") {
      fetchNetworkIdeas();
    }
  }, [view]);

  // Fetch user's ideas
  useEffect(() => {
    if (view === "personal") {
      fetchPersonalIdeas();
    }
  }, [view]);

  async function fetchNetworkIdeas() {
    try {
      const res = await fetch("/api/ideas");
      const data = await res.json();
      setNetworkIdeas(data.data || []);
    } catch (err) {
      console.error("Failed to fetch network ideas:", err);
    }
  }

  async function fetchPersonalIdeas() {
    try {
      const res = await fetch("/api/ideas/personal");
      const data = await res.json();
      setPersonalIdeas(data.data || []);
    } catch (err) {
      console.error("Failed to fetch personal ideas:", err);
    }
  }

  function handleIdeaSubmitted(data: any) {
    if (data?.data) {
      setPersonalIdeas((prev) => [data.data, ...prev]);
      if (view === "network") {
        setNetworkIdeas((prev) => [data.data, ...prev]);
      }
    }
    setShowModal(false);
  }

  function openDetail(idea: any) {
    setSelectedIdea(idea);
    setEditText(idea.text);
    setIsEditing(false);
  }

  function closeDetail() {
    setSelectedIdea(null);
    setIsEditing(false);
  }

  function startEdit() {
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditText(selectedIdea.text);
  }

  async function saveEdit() {
    try {
      const res = await fetch(`/api/ideas/${selectedIdea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText }),
      });

      const data = await res.json();
      if (data.data) {
        setPersonalIdeas((prev) =>
          prev.map((idea) => (idea.id === selectedIdea.id ? data.data : idea))
        );
        setSelectedIdea(data.data);
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update idea:", err);
    }
  }

  async function deleteIdea() {
    if (!confirm("Delete this idea?")) return;

    try {
      await fetch(`/api/ideas/${selectedIdea.id}`, { method: "DELETE" });
      setPersonalIdeas((prev) => prev.filter((idea) => idea.id !== selectedIdea.id));
      closeDetail();
    } catch (err) {
      console.error("Failed to delete idea:", err);
    }
  }

  const currentIdeas = view === "network" ? networkIdeas : personalIdeas;
  const isPersonalView = view === "personal";

  return (
    <>
      {/* Image tag */}
      <img
        src="/cometDog.png"
        alt="Comet Dog Logo" 
        width={280} 
        height={280} 
        style={{ 
          position: 'fixed', 
          bottom: '0.5rem',
          left: '1rem',
          zIndex: 1000,
          transform: 'rotate(-15deg)',
          animation: 'float 4s ease-in-out infinite'
        }} 
      />
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: rotate(-15deg) translateY(5px);
        }
        50% {
          transform: rotate(3deg) translateY(-20px);
        }
      }
      `}</style>
      <div style={{ minHeight: "100vh", background: "rgb(2, 6, 23)", padding: "32px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "300", color: "rgb(248, 250, 252)", letterSpacing: "-0.5px", margin: 0 }}>
            Blackout
          </h1>

          <button 
            onClick={() => setShowModal(true)}
            style={{
              padding: "12px 24px",
              background: "rgb(248, 250, 252)",
              color: "rgb(15, 23, 42)",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background = "rgb(255, 255, 255)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "rgb(248, 250, 252)";
            }}
          >
            + Add Idea
          </button>
        </div>

        {/* View Toggle */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px", padding: "6px", background: "rgba(30, 41, 59, 0.5)", borderRadius: "12px", width: "fit-content" }}>
          <button
            style={{
              padding: "10px 24px",
              border: "none",
              borderRadius: "8px",
              background: view === "network" ? "rgb(248, 250, 252)" : "transparent",
              color: view === "network" ? "rgb(15, 23, 42)" : "rgba(148, 163, 184, 1)",
              fontWeight: "500",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onClick={() => setView("network")}
          >
            Network
          </button>
          <button
            style={{
              padding: "10px 24px",
              border: "none",
              borderRadius: "8px",
              background: view === "personal" ? "rgb(248, 250, 252)" : "transparent",
              color: view === "personal" ? "rgb(15, 23, 42)" : "rgba(148, 163, 184, 1)",
              fontWeight: "500",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onClick={() => setView("personal")}
          >
            My Ideas
          </button>
        </div>

        {/* Ideas Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {currentIdeas.map((idea) => {
            const meme = MEME_LOOKUP[idea.meme_id];
            const title = idea.text.substring(0, 50) + (idea.text.length > 50 ? "..." : "");

            return (
              <div
                key={idea.id}
                onClick={() => openDetail(idea)}
                style={{
                  cursor: "pointer",
                  background: "rgb(30, 41, 59)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Meme Image */}
                <div style={{ position: "relative", height: "160px", overflow: "hidden", background: "rgb(51, 65, 85)" }}>
                  {meme && (
                    <img
                      src={meme.image}
                      alt={meme.label}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: "0.75",
                        transition: "all 0.3s ease"
                      }}
                    />
                  )}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgb(30, 41, 59), rgba(30, 41, 59, 0.2), transparent)"
                  }}></div>
                </div>

                {/* Card Content */}
                <div style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                    <span style={{
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: "rgba(148, 163, 184, 1)",
                      fontWeight: "500"
                    }}>
                      {meme?.label || idea.meme_id}
                    </span>
                    {view === "network" && idea.author_email && (
                      <span style={{ fontSize: "10px", color: "rgba(100, 116, 139, 1)" }}>
                        {idea.author_email.split("@")[0]}
                      </span>
                    )}
                  </div>

                  <p style={{
                    color: "rgba(226, 232, 240, 1)",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    {title}
                  </p>

                  {idea.created_at && (
                    <div style={{ marginTop: "12px", fontSize: "10px", color: "rgba(100, 116, 139, 1)" }}>
                      {new Date(idea.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {currentIdeas.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: "80px", paddingBottom: "80px" }}>
            <p style={{ color: "rgba(148, 163, 184, 1)", fontSize: "14px" }}>
              {view === "network"
                ? "No ideas in the network yet. Be the first!"
                : "You haven't added any ideas yet."}
            </p>
          </div>
        )}

        {/* Detail Modal */}
        {selectedIdea && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.92)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "16px"
            }}
            onClick={closeDetail}
          >
            <div
              style={{
                background: "rgb(30, 41, 59)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "24px",
                maxWidth: "672px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 24px 48px rgba(0, 0, 0, 0.4)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Meme Header */}
              <div style={{ position: "relative", height: "256px", overflow: "hidden", background: "rgb(51, 65, 85)" }}>
                {MEME_LOOKUP[selectedIdea.meme_id] && (
                  <img
                    src={MEME_LOOKUP[selectedIdea.meme_id].image}
                    alt={MEME_LOOKUP[selectedIdea.meme_id].label}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: "0.8" }}
                  />
                )}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgb(30, 41, 59), rgba(30, 41, 59, 0.5), transparent)"
                }}></div>
                
                {/* Close Button */}
                <button
                  onClick={closeDetail}
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    width: "40px",
                    height: "40px",
                    background: "rgba(30, 41, 59, 0.8)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "50%",
                    color: "rgba(163, 163, 163, 1)",
                    fontSize: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(51, 65, 85, 1)";
                    e.currentTarget.style.color = "rgba(226, 232, 240, 1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(30, 41, 59, 0.8)";
                    e.currentTarget.style.color = "rgba(163, 163, 163, 1)";
                  }}
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <span style={{
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "rgba(148, 163, 184, 1)",
                    fontWeight: "500"
                  }}>
                    {MEME_LOOKUP[selectedIdea.meme_id]?.label || selectedIdea.meme_id}
                  </span>
                  {view === "network" && selectedIdea.author_email && (
                    <span style={{ fontSize: "12px", color: "rgba(100, 116, 139, 1)" }}>
                      by {selectedIdea.author_email}
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "16px",
                      background: "rgba(15, 23, 42, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      color: "rgba(226, 232, 240, 1)",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      resize: "none",
                      minHeight: "128px",
                      fontFamily: "inherit"
                    }}
                    autoFocus
                  />
                ) : (
                  <p style={{
                    color: "rgba(226, 232, 240, 1)",
                    fontSize: "16px",
                    lineHeight: "1.6",
                    marginBottom: "24px"
                  }}>
                    {selectedIdea.text}
                  </p>
                )}

                {selectedIdea.created_at && (
                  <div style={{
                    fontSize: "12px",
                    color: "rgba(100, 116, 139, 1)",
                    marginBottom: "24px"
                  }}>
                    Created {new Date(selectedIdea.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </div>
                )}

                {/* Actions */}
                {isPersonalView && (
                  <div style={{ display: "flex", gap: "12px" }}>
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveEdit}
                          style={{
                            flex: 1,
                            padding: "12px 16px",
                            background: "rgb(248, 250, 252)",
                            color: "rgb(15, 23, 42)",
                            borderRadius: "12px",
                            fontWeight: "600",
                            fontSize: "14px",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgb(255, 255, 255)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgb(248, 250, 252)";
                          }}
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            padding: "12px 16px",
                            background: "rgb(51, 65, 85)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "rgba(203, 213, 225, 1)",
                            borderRadius: "12px",
                            fontWeight: "500",
                            fontSize: "14px",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={startEdit}
                          style={{
                            flex: 1,
                            padding: "12px 16px",
                            background: "rgb(51, 65, 85)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "rgba(226, 232, 240, 1)",
                            borderRadius: "12px",
                            fontWeight: "500",
                            fontSize: "14px",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={deleteIdea}
                          style={{
                            padding: "12px 16px",
                            background: "rgb(51, 65, 85)",
                            border: "1px solid rgba(159, 18, 57, 0.5)",
                            color: "rgba(251, 113, 133, 1)",
                            borderRadius: "12px",
                            fontWeight: "500",
                            fontSize: "14px",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(76, 5, 25, 0.5)";
                            e.currentTarget.style.borderColor = "rgba(159, 18, 57, 0.8)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgb(51, 65, 85)";
                            e.currentTarget.style.borderColor = "rgba(159, 18, 57, 0.5)";
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Idea Modal */}
        {showModal && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(12px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 50
          }}>
            <div style={{
              position: "relative",
              background: "rgb(30, 41, 59)",
              padding: "48px",
              borderRadius: "24px",
              maxWidth: "780px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.4)"
            }}>
              <IdeaModal
                onClose={() => setShowModal(false)}
                onIdeaSubmitted={handleIdeaSubmitted}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}