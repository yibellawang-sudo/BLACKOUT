import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("ideas")
    .select("id, text, meme_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ status: "ok", data }), { status: 200 });
}

export async function POST(req: Request) {
  const { text, meme_id } = await req.json();

  const { data, error } = await supabase
    .from("ideas")
    .insert({ text, meme_id })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ status: "ok", data }), { status: 200 });
}
