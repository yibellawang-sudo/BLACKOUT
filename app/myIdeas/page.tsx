"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import IdeaModal from "../components/IdeaModal";
import IdeaCard from "../components/IdeaCard";

type Idea = {
  id: string;
  title: string;
  text: string;
  meme_id: string;
  created_at?: string;
  author_id?: string;
  newlyCreated?: boolean;
  x?: number;
  y?: number;
};

type IdeaLink = {
  idea1: Idea;
  idea2: Idea;
};

export default function MyIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [linkedIdeas, setLinkedIdeas] = useState<IdeaLink[]>([]);
  const ideaRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    loadIdeas();
  }, []);

  async function loadIdeas() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data } = await supabase
      .from("ideas")
      .select("*")
      .eq("author_id", userData.user.id)
      .order("created_at", { ascending: false });

    setIdeas((data ?? []).map(normalizeIdea));
  }

  function normalizeIdea(raw: any): Idea {
    return {
      id: raw.id,
      title: raw.title ?? raw.text?.substring(0, 50) ?? "Untitled",
      text: raw.text ?? "",
      meme_id: raw.meme_id ?? "",
      created_at: raw.created_at,
      author_id: raw.author_id,
      newlyCreated: raw.newlyCreated,
      x: raw.x,
      y: raw.y,
    };
  }

  async function handleIdeaSubmitted(ideaInput: { title: string; text: string; meme: string }) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    let insertedIdea;

    if (editingIdea) {
      const { data, error } = await supabase
        .from("ideas")
        .update({
          title: ideaInput.title,
          text: ideaInput.text,
          meme_id: ideaInput.meme,
        })
        .eq("id", editingIdea.id)
        .select()
        .single();

      if (error || !data) {
        console.error("Failed to update idea:", error);
        return;
      }

      insertedIdea = data;
      setIdeas(prev => prev.map(i => (i.id === data.id ? normalizeIdea(data) : i)));
      setEditingIdea(null);
    } else {
      const { data, error } = await supabase
        .from("ideas")
        .insert({
          title: ideaInput.title,
          text: ideaInput.text,
          meme_id: ideaInput.meme,
          author_id: userData.user.id,
        })
        .select()
        .single();

      if (error || !data) {
        console.error("Failed to create idea:", error);
        return;
      }

      insertedIdea = { ...data, newlyCreated: true };
      setIdeas(prev => [normalizeIdea(insertedIdea), ...prev]);
    }

    setShowModal(false);

    // Remove newlyCreated glow after animation
    setTimeout(() => {
      setIdeas(prev =>
        prev.map(i => (i.id === insertedIdea.id ? { ...i, newlyCreated: false } : i))
      );
    }, 2000);
  }

  async function handleDeleteIdea(ideaId: string) {
    const { error } = await supabase.from("ideas").delete().eq("id", ideaId);
    if (error) {
      console.error("Failed to delete idea:", error);
      return;
    }
    setIdeas(prev => prev.filter(i => i.id !== ideaId));
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
      {/* Ambient & shimmer effects */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 25% 25%, rgba(96, 165, 250, 0.25) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(251, 191, 36, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(90deg, transparent, transparent 150px, rgba(255, 255, 255, 0.02) 150px, rgba(255, 255, 255, 0.02) 152px)",
          pointerEvents: "none",
        }}
      />
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
          My Ideas
        </h1>

        <div style={{ display: "flex", gap: "1rem", marginLeft: "auto" }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "14px 28px",
              borderRadius: 12,
              background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(191,219,254,0.9))",
              color: "#0c1e3a",
              border: "1px solid rgba(255,255,255,0.3)",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.95rem",
              fontFamily: "'Ningrat', sans-serif"
            }}
          >
            Add Idea
          </button>
          <button
            onClick={() => window.location.href = "/"}
            style={{
              padding: "14px 28px",
              borderRadius: 12,
              background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(191,219,254,0.9))",
              color: "#0c1e3a",
              border: "1px solid rgba(255,255,255,0.3)",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.95rem",
              fontFamily: "'Ningrat', sans-serif"
            }}
          >
            Back to Main
          </button>
        </div>
      </header>

      {/* Ideas constellation */}
      <div style={{ position: "absolute", inset: 0, paddingTop: "120px" }}>
        {/* Linked lines */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
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

        {/* Idea orbs */}
        {ideas.map((idea) => {
          const x = idea.x ?? 10 + Math.random() * 80;
          const y = idea.y ?? 10 + Math.random() * 70;
          const baseSize = idea.newlyCreated ? 80 : 40 + Math.random() * 30;
          return (
            <div
              key={idea.id}
              ref={el => { ideaRefs.current[idea.id] = el; }}
              onClick={() => { setEditingIdea(idea); 
                setShowModal(true)}}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: baseSize,
                height: baseSize,
                background: `radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(96,165,250,0.9) 40%, rgba(37,99,235,0.6) 100%)`,
                borderRadius: "50%",
                boxShadow: idea.newlyCreated
                  ? "0 0 60px rgba(96,165,250,0.9), 0 0 120px rgba(96,165,250,0.6)"
                  : "0 0 30px rgba(96,165,250,0.9), 0 0 60px rgba(96,165,250,0.6)",
                cursor: "pointer",
                transition: "all 2s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          );
        })}
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
          <p style={{ fontSize: "1.2rem", color: "rgba(191,219,254,0.7)", margin: 0 }}>
            Your constell-ideation awaits
          </p>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <IdeaModal
          idea={editingIdea ?? undefined}
          onClose={() => { setShowModal(false); setEditingIdea(null); }}
          onIdeaSubmitted={handleIdeaSubmitted}
        />
      )}

      <style>
        {`
          @keyframes float {
            0%,100% { transform: rotate(-15deg) translateY(0px); }
            50% { transform: rotate(3deg) translateY(-12px); }
          }
        `}
      </style>
    </div>
  );
}
