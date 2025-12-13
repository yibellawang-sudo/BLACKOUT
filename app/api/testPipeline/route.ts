import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST() {
  const { data, error } = await supabaseAdmin.rpc("full_test_pipeline");

  if (error) {
    console.error("Supabase RPC error:", error);
    console.log("Service role key:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ status: "ok", data }), { status: 200 });
}
