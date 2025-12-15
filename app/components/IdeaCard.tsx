"use client";

import { MEMES } from "@/lib/memes";

interface IdeaCardProps {
  idea: any;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
  const meme = MEMES.find((m) => m.id === idea.meme_id);

  return (
    <div
      style={{
        background: "rgb(30, 41, 59)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      {/* Meme image */}
      {meme && (
        <div style={{ height: "160px", overflow: "hidden" }}>
          <img
            src={meme.image}
            alt={meme.label}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.8,
            }}
          />
        </div>
      )}

      {/* Text */}
      <div style={{ padding: "16px" }}>
        <div
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "rgba(148,163,184,1)",
            marginBottom: "6px",
          }}
        >
          {meme?.label ?? idea.meme_id}
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "14px",
            lineHeight: "1.6",
            color: "rgb(226,232,240)",
          }}
        >
          {idea.text}
        </p>

        {idea.created_at && (
          <div
            style={{
              marginTop: "10px",
              fontSize: "10px",
              color: "rgba(100,116,139,1)",
            }}
          >
            {new Date(idea.created_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
