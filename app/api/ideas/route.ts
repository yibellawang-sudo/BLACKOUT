import { supabase } from "@/lib/supabase";

/* =========================
   GET — fetch all ideas
========================= */
export async function GET() {
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json({ data });
}

export async function POST(req: Request) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, text, meme } = body;

  const { data, error } = await supabase
    .from("ideas")
    .insert({
      title,
      text,
      meme_id: meme,
      author_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}
