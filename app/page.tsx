"use client";

import { useState } from "react";
import { MEMES } from "@/lib/memes";

export default function Home() {
  const [text, setText] = useState("");
  const [meme, setMeme] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const submitIdea = async () => {
    if (!text || !meme) return;
    setLoading(true);

    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, meme_id: meme }),
    });

    setResponse(await res.json());
    setLoading(false);
  };

  const [pipelineOutput, setPipelineOutput] = useState<any>(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);

  async function runTestPipeline() {
    setPipelineLoading(true);
    try {
        const res = await fetch("/api/testPipeline", { method: "POST" });
        const json = await res.json();
        console.log("Pipeline output:", json);
        setPipelineOutput(json);
    } catch (err) {
        console.error("Pipeline error:", err);
        setPipelineOutput({ error: err });
    } finally {
        setPipelineLoading(false);
    }
}

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Blackout</h1>

      <textarea
        className="border p-2 w-full mb-4"
        placeholder="Add an idea..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <h2 className="font-semibold mb-2">Choose a meme</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {MEMES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMeme(m.id)}
            className={`border rounded p-1 transition ${
              meme === m.id ? "border-black" : "opacity-70"
            }`}
          >
            <img
              src={m.image}
              alt={m.label}
              className="w-full h-32 object-cover"
            />
            <p className="text-sm mt-1 text-center">{m.label}</p>
          </button>
        ))}
      </div>

      <button
        onClick={submitIdea}
        disabled={loading || !meme}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50 mr-2"
      >
        {loading ? "Submitting…" : "Submit Idea"}
      </button>
      
      <button className="btn">Test Button</button>

      <button
        onClick={runTestPipeline}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Run Blackout Test Pipeline
      </button>
      {pipelineOutput && (
        <pre className="mt-4 bg-gray-100 p-3 rounded text-xs">
            {JSON.stringify(pipelineOutput, null, 2)}
        </pre>
    )}
    </main>
  );
}
