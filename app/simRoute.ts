import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { embedding } = await req.json();

  const { data, error } = await supabase
    .rpc("top_similar_ideas", {
      input_embedding: embedding, 
    });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ status: "ok", data }), { status: 200 });
}
