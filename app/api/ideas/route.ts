import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { text, meme_id } = await req.json();
    if (!text || !meme_id) {
      return NextResponse.json({ error: "Missing text or meme_id" }, { status: 400 });
    }

    // Fake author_id for testing
    const author_id = crypto.randomUUID();

    // Fake embedding
    const embeddingVector = Array(1536).fill(Math.random() * 0.5);

    console.log("Inserting new idea...", { text, meme_id, author_id });

    // Insert idea
    const { data: newIdea, error: insertError } = await supabase
      .from("ideas")
      .insert({ text, meme_id, author_id, embedding: embeddingVector })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log("Inserted:", newIdea);

    // Call RPC
    const { data: suggestions, error: rpcError } = await supabase
      .rpc("top_similar_ideas", { input: embeddingVector });

    if (rpcError) {
      console.error("RPC error:", rpcError);
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    console.log("Suggestions:", suggestions);

    return NextResponse.json({ status: "ok", newIdea, suggestions });

  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
