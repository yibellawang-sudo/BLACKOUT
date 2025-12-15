"use client";

import { useEffect, useState } from "react";
import IdeaModal from "./components/IdeaModal";
import { MEMES } from "@/lib/memes";

type Idea = {
  id: string;
  title: string;
  text: string;
  meme_id: string;
  created_at?: string;
};

const MEME_LOOKUP = Object.fromEntries(MEMES.map((m) => [m.id, m]));

function normalizeIdea(raw: any): Idea {
  return {
    id: raw.id,
    title: raw.title ?? raw.text?.substring(0, 50) ?? "Untitled",
    text: raw.text ?? "",
    meme_id: raw.meme_id,
    created_at: raw.created_at,
  };
}

export default function Home() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const DOG_MESSAGES = [
    "Oh hey, you! Didn’t see you there.",
    "Welcome to The Blackout! You might be wondering why it’s so dark and boring here, huh?",
    "Well no need to worry — that’s why I’m here to lead you to a light.",
    "A light you can create with just a little bit of thinkin’!",
    "Others also seem to be struggling with navigating through this dark realm but with your help, you can create ‘Constell-ideations’ (a constellation of ideas)! That way you and the new friends you meet can share each other's ideas through visuals like sticky notes and newer memes etc!",
    "Lets make your own star on the constellation - your first idea!",
    "Click here to start!",
  ];
  const CLICK_BUTTON_MSG = "Click here to start!";
  const [dogMessageIndex, setDogMessageIndex] = useState(0);
  const [dogMessage, setDogMessage] = useState("");
  const [showDogLabel, setShowDogLabel] = useState(true);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  async function fetchIdeas() {
    const res = await fetch("/api/ideas");
    const json = await res.json();
    setIdeas((json.data ?? []).map(normalizeIdea));
  }

  function handleIdeaSubmitted(raw: { text: string; meme: string; title: string }) {
    const idea = normalizeIdea({
      id: crypto.randomUUID(),
      title: raw.title,
      text: raw.text,
      meme_id: raw.meme,
    });

    setIdeas((prev) => [idea, ...prev]);
    setShowModal(false);
  }

  return (
    
    <div
      style={{
        margin: 0,
        height: "100vh",
        background: "#0a1628",
        color: "white",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Ningrat',sans-serif",
      }}
    >
      {/* light effects */}
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

        <button
          onClick={() => {
            setShowModal(true);
            
            if (dogMessage === CLICK_BUTTON_MSG){
              setDogMessage("");
            }
            if (highlightKey === "addIdea") {
              setHighlightKey(null);
            }
          }}
          style={{
            padding: "14px 28px",
            borderRadius: 12,
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(191, 219, 254, 0.9))",
            color: "#0c1e3a",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.95rem",
            boxShadow: `
              0 4px 20px rgba(96, 165, 250, 0.4),
              0 2px 10px rgba(251, 191, 36, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
              ${highlightKey === "addIdea"
                ? ", 0 0 0 3px rgba(251, 191, 36, 0.9), 0 0 30px rgba(251, 191, 36, 0.8)"
                : ""}
            `,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
          + Add Idea
        </button>
      </header>

      {/* Ideas constellation */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          paddingTop: "120px",
        }}
      >
        {ideas.map((idea, index) => {
          const x = 10 + (Math.random() * 80);
          const y = 10 + (Math.random() * 70);
          const size = 18 + Math.random() * 20;
          
          const isGold = Math.random() > 0.65;
          const glowColor = isGold 
            ? `rgba(251, 191, 36, 0.9)` 
            : `rgba(147, 197, 253, 0.9)`;
          const delay = index * 0.1;

          return (
            <div
              key={idea.id}
              onClick={() => setSelectedIdea(idea)}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                background: isGold
                  ? `radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(251, 191, 36, 0.9) 30%, rgba(245, 158, 11, 0.6) 100%)`
                  : `radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(147, 197, 253, 0.9) 30%, rgba(96, 165, 250, 0.6) 100%)`,
                borderRadius: "50%",
                boxShadow: isGold
                  ? `0 0 30px ${glowColor}, 0 0 60px ${glowColor}, 0 0 90px rgba(251, 191, 36, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.8)`
                  : `0 0 30px ${glowColor}, 0 0 60px ${glowColor}, 0 0 90px rgba(96, 165, 250, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.9)`,
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${delay}s`,
                opacity: 0,
                transform: "scale(0)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
              ref={(el) => {
                if (el) {
                  setTimeout(() => {
                    el.style.opacity = "1";
                    el.style.transform = "scale(1)";
                  }, delay * 100);
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.8)";
                e.currentTarget.style.boxShadow = isGold
                  ? `0 0 40px ${glowColor}, 0 0 80px ${glowColor}, 0 0 120px rgba(251, 191, 36, 0.5), inset 0 0 25px rgba(255, 255, 255, 1)`
                  : `0 0 40px ${glowColor}, 0 0 80px ${glowColor}, 0 0 120px rgba(96, 165, 250, 0.5), inset 0 0 25px rgba(255, 255, 255, 1)`;
                e.currentTarget.style.zIndex = "5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = isGold
                  ? `0 0 30px ${glowColor}, 0 0 60px ${glowColor}, 0 0 90px rgba(251, 191, 36, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.8)`
                  : `0 0 30px ${glowColor}, 0 0 60px ${glowColor}, 0 0 90px rgba(96, 165, 250, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.9)`;
                e.currentTarget.style.zIndex = "1";
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

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-12px);
            }
          }
        `}
      </style>
      <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        zIndex: 50,
      }}
    >
      {showDogLabel && (
        <div
          style={{
            position: "absolute",
            top: -18,
            left: 0,
            right: 0,
            margin: "0 auto",
            width: "fit-content",
            background: "rgba(0,0,0,0.6)",
            filter: "drop-shadow(0 0 20px rgba(147, 197, 253, 0.5))",
            color: "white",
            padding: "6px 10px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          click to talk to me!
        </div>
      )}

      <img
        src="/cometDog.png"
        alt="comet dog"
        onClick={() => {
          setShowDogLabel(false);

          if (dogMessageIndex >= DOG_MESSAGES.length) {
            setDogMessage("");
            setHighlightKey(null);
            return;
          }

          setDogMessage(DOG_MESSAGES[dogMessageIndex]);
          
          if (dogMessageIndex === DOG_MESSAGES.length - 1){
            setHighlightKey("addIdea")
          }

          setDogMessageIndex((prev) => prev + 1);
        }}
        style={{
          width: 180,
          height: 180,
          cursor: "pointer",
        }}
      />
    </div>

    {dogMessage && (
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 180,
          background: "rgba(0,0,0,0.6)",
          filter: "drop-shadow(0 0 20px rgba(147, 197, 253, 0.5))",
          padding: "12px 16px",
          borderRadius: 10,
          color: "white",
          fontSize: "1rem",
          zIndex: 50,
          maxWidth: 320,
        }}
      >
        {dogMessage}
      </div>
    )}


        </div>
  );
}