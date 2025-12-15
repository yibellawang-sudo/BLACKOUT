"use client";

import { useEffect, useState, useRef } from "react";
import IdeaModal from "./components/IdeaModal";
import { MEMES } from "@/lib/memes";
import { supabase } from "@/lib/supabase";


type Idea = {
  id: string;
  title: string;
  text: string;
  meme_id: string;
  created_at?: string;
  author_id?: string;
  newlyCreated?: boolean;
  comet_id?: string;
  x?: number;
  y?: number;
};

type IdeaLink = {
  idea1: Idea;
  idea2: Idea;
};

const MEME_LOOKUP = Object.fromEntries(MEMES.map((m) => [m.id, m]));

function normalizeIdea(raw: any): Idea {
  return {
    id: raw.id,
    title: raw.title ?? raw.text?.substring(0, 50) ?? "Untitled",
    text: raw.text ?? "",
    meme_id: raw.meme_id,
    created_at: raw.created_at,
    author_id: raw.author_id,
    comet_id: raw.comet_id,
  };
}

export default function Home() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [suggestedLink, setSuggestedLink] = useState<{idea1: Idea; idea2: Idea} | null>(null);
  const [linkedIdeas, setLinkedIdeas] = useState<IdeaLink[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const ideaRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    checkUser();
    fetchIdeas();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login";
    } else {
      setCurrentUserId(user.id);
    }
  }

  async function fetchIdeas() {
    const res = await fetch("/api/ideas");
    const json = await res.json();
    setIdeas((json.data ?? []).map(normalizeIdea));
  }

  async function handleIdeaSubmitted(raw: { text: string; meme: string; title: string }) {
    const res = await fetch("/api/ideas");
    const json = await res.json();
    const allIdeas = (json.data ?? []).map(normalizeIdea);
    
    if (allIdeas.length > 0) {
      const newIdea = allIdeas[0];
      newIdea.newlyCreated = true;
      
      try {
        const embedding = generateSimpleEmbedding(newIdea.text);
        
        const assignRes = await fetch("/api/cometClusters/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea_id: newIdea.id,
            embedding: embedding,
          }),
        });
        
        const assignData = await assignRes.json();
        console.log("Assigned to comet:", assignData);
        
        if (allIdeas.length > 1) {
          checkForCollaboration(newIdea, assignData.comet_id);
        }
      } catch (err) {
        console.error("Failed to assign to comet:", err);
      }
    }
    
    setIdeas(allIdeas);
    setShowModal(false);
    
    setTimeout(() => {
      setIdeas(prev => prev.map(i => ({ ...i, newlyCreated: false })));
    }, 2000);
  }

  function generateSimpleEmbedding(text: string): number[] {
    const embedding = new Array(384).fill(0);
    for (let i = 0; i < text.length && i < 384; i++) {
      embedding[i] = text.charCodeAt(i) / 255;
    }
    return embedding;
  }

  async function checkForCollaboration(newIdea: Idea, comet_id: string) {
    const otherIdeas = ideas.filter((i) => i.id !== newIdea.id);
    if (otherIdeas.length === 0) return;

    const potential = otherIdeas[Math.floor(Math.random() * otherIdeas.length)];
    setSuggestedLink({ idea1: newIdea, idea2: potential });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function handleVoteLink(accepted: boolean) {
    if (!suggestedLink) return;
    const { idea1, idea2 } = suggestedLink;

    if (accepted) {
      await fetch("/api/cometClusters/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comet_id: idea1.id, user_id: currentUserId }),
      });
      await fetch("/api/cometClusters/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comet_id: idea2.id, user_id: currentUserId }),
      });

      try {
        await fetch("/api/cometClusters/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ threshold: 3.0 }),
        });
        console.log("Comets merged in database");
      } catch (err) {
        console.error("Failed to merge comets:", err);
      }

      setLinkedIdeas((prev) => [...prev, { idea1, idea2 }]);
      
      setIdeas(prev => prev.map(i => {
        if (i.id === idea1.id) return { ...i, comet_id: idea1.id };
        if (i.id === idea2.id) return { ...i, comet_id: idea1.id };
        return i;
      }));
    }

    setSuggestedLink(null);
  }

  const getOrbPosition = (idea: Idea) => {
    const el = ideaRefs.current[idea.id];
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  return (
    <div
      style={{
        margin: 0,
        height: "100vh",
        background: "linear-gradient(135deg, #0a1628 0%, #0c1e3a 30%, #0f2744 60%, #1a1f3a 100%)",
        color: "white",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Ningrat', sans-serif",
      }}
    >
      {/* Ambient light effects */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 25% 25%, rgba(96, 165, 250, 0.25) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(251, 191, 36, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Light shimmer effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(90deg, transparent, transparent 150px, rgba(255, 255, 255, 0.02) 150px, rgba(255, 255, 255, 0.02) 152px)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle dot pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(96, 165, 250, 0.15) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "32px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          zIndex: 10,
          backdropFilter: "blur(20px) brightness(1.2)",
          background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02))",
          borderBottom: "1px solid rgba(96, 165, 250, 0.2)",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 40%, #fbbf24 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: 0,
            letterSpacing: "-0.02em",
            filter: "drop-shadow(0 0 20px rgba(147, 197, 253, 0.5))",
            fontFamily: "'Chopsic', sans-serif",
          }}
        >
          Blackout
        </h1>
        
        <div style={{ display: "flex", gap: "1rem", marginLeft: "auto" }}>
          <button
            onClick={() => window.location.href = "/myIdeas"}
            style={{
              padding: "14px 28px",
              borderRadius: 12,
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(191, 219, 254, 0.9))",
              color: "#0c1e3a",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.95rem",
              fontFamily: "'Ningrat', sans-serif",
            }}
          >
            My Ideas
          </button>

          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "14px 28px",
              borderRadius: 12,
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(191, 219, 254, 0.9))",
              color: "#0c1e3a",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.95rem",
              boxShadow: "0 4px 20px rgba(96, 165, 250, 0.4), 0 2px 10px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              fontFamily: "'Ningrat', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(96, 165, 250, 0.6), 0 4px 15px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(255, 255, 255, 1)";
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(224, 242, 254, 0.95))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(96, 165, 250, 0.4), 0 2px 10px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)";
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(191, 219, 254, 0.9))";
            }}
          >
            Add Idea
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: "14px 28px",
              borderRadius: 12,
              background: "rgba(255, 59, 48, 0.2)",
              color: "#fff",
              border: "1px solid rgba(255, 59, 48, 0.3)",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.95rem",
              fontFamily: "'Ningrat', sans-serif",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Ideas constellation */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          paddingTop: "120px",
        }}
      >
        {/* Draw lines between linked ideas */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            width: "100%",
            height: "100%",
          }}
        >
          {linkedIdeas.map(({ idea1, idea2 }, idx) => {
            const pos1 = getOrbPosition(idea1);
            const pos2 = getOrbPosition(idea2);
            return (
              <line
                key={idx}
                x1={pos1.x}
                y1={pos1.y}
                x2={pos2.x}
                y2={pos2.y}
                stroke="rgba(251,191,36,0.7)"
                strokeWidth={3}
              />
            );
          })}
        </svg>

        {ideas.map((idea, index) => {
          const x = 10 + Math.random() * 80;
          const y = 10 + Math.random() * 70;
          
          const isUser = idea.author_id === currentUserId || idea.author_id === "00000000-0000-0000-0000-000000000000";
          const isNewlyCreated = idea.newlyCreated;
          
          const baseSize = isNewlyCreated ? 80 : (30 + Math.random() * 20);
          
          const glowColor = isUser ? `rgba(96, 165, 250, 0.9)` : `rgba(251, 191, 36, 0.9)`;

          return (
            <div
              key={idea.id}
              ref={el => { ideaRefs.current[idea.id] = el; }}
              onClick={() => setSelectedIdea(idea)}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: baseSize,
                height: baseSize,
                background: isUser
                  ? `radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(96,165,250,0.9) 40%, rgba(37,99,235,0.6) 100%)`
                  : `radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(251,191,36,0.9) 40%, rgba(245,158,11,0.6) 100%)`,
                borderRadius: "50%",
                boxShadow: isNewlyCreated 
                  ? `0 0 60px ${glowColor}, 0 0 120px ${glowColor}, 0 0 180px rgba(255,255,255,0.4)`
                  : `0 0 30px ${glowColor}, 0 0 60px ${glowColor}, 0 0 90px rgba(255,255,255,0.2)`,
                cursor: "pointer",
                transition: "all 2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          );
        })}
      </div>

      {/* Comet Dog */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          zIndex: 10,
          animation: "float 4s ease-in-out infinite",
        }}
      >
        <img
          src="/cometDog.png"
          alt="Comet Dog"
          style={{
            width: "250px",
            height: "auto",
            filter: "drop-shadow(0 0 20px rgba(96, 165, 250, 0.4))",
          }}
        />
      </div>

      {/* Empty state */}
      {ideas.length === 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <p
            style={{
              fontSize: "1.2rem",
              color: "rgba(191, 219, 254, 0.7)",
              margin: 0,
              fontWeight: 500,
            }}
          >
            Your constell-ideation awaits
          </p>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <IdeaModal onClose={() => setShowModal(false)} onIdeaSubmitted={handleIdeaSubmitted} />
      )}

      {selectedIdea && (
        <IdeaModal
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
          onIdeaSubmitted={handleIdeaSubmitted}
        />
      )}

      {/* Collaboration popup */}
      {suggestedLink && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(0,0,0,0.75)",
            zIndex: 20,
          }}
        >
          <div
            style={{
              background: "#1a1d2e",
              padding: "2rem",
              borderRadius: "1rem",
              border: "1px solid rgba(255,255,255,0.1)",
              textAlign: "center",
              width: "300px",
              fontFamily: "'Ningrat', sans-serif",
            }}
          >
            <p style={{ marginBottom: "1rem", color: "#fff" }}>
              {suggestedLink.idea1.title} could collaborate with {suggestedLink.idea2.title}!
            </p>
            <button
              style={{
                marginRight: 8,
                padding: "0.75rem 1.5rem",
                cursor: "pointer",
                background: "rgba(96, 165, 250, 0.2)",
                border: "1px solid rgba(96, 165, 250, 0.4)",
                borderRadius: "0.5rem",
                color: "#fff",
                fontFamily: "'Ningrat', sans-serif",
              }}
              onClick={() => handleVoteLink(true)}
            >
              Yes
            </button>
            <button
              style={{
                padding: "0.75rem 1.5rem",
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "0.5rem",
                color: "#a3a3a3",
                fontFamily: "'Ningrat', sans-serif",
              }}
              onClick={() => handleVoteLink(false)}
            >
              No
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: rotate(-15deg) translateY(0px);
            }
            50% {
              transform: rotate(3deg) translateY(-12px);
            }
          }
        `}
      </style>
    </div>
  );
}