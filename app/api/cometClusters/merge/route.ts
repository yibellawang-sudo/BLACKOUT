import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { threshold } = await req.json();

  const { error } = await supabase.rpc("merge_close_comets", { similarity_threshold: threshold ?? 3.0 });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ status: "merged" });
}
