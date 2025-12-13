import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { idea_id, embedding } = await req.json();

  const { data, error } = await supabase
    .rpc("assign_to_comet", {
      p_idea_id: idea_id,
      p_embedding: embedding,
    });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({
    status: "ok",
    comet_id: data,
  }), { status: 200 });
}
