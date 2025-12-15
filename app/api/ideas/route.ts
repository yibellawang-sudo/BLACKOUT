import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, text, meme } = body;

  const { data, error } = await supabase
    .from("ideas")
    .insert({
      title,
      text,
      meme_id: meme,
      author_id: "00000000-0000-0000-0000-000000000000",
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}