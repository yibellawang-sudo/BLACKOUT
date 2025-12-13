// app/api/comets/lock/route.ts
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { comet_id, title, description } = await req.json();

    if (!comet_id || !title || !description) {
      return new Response(
        JSON.stringify({ error: "Missing comet_id, title, or description" }),
        { status: 400 }
      );
    }

    // Call the RPC to lock the comet and create an event
    const { data: event_id, error: rpcError } = await supabase.rpc("lock_comet", {
      p_comet_id: comet_id,
      p_title: title,
      p_description: description,
    });

    if (rpcError) {
      return new Response(JSON.stringify({ error: rpcError.message }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({ status: "locked", event_id }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Unknown error" }),
      { status: 500 }
    );
  }
}

/*
expected resposne from frontend call:
{
  "status": "locked",
  "event_id": "c1f8b6d0-1234-4abc-8def-abcdef123456"
}
*/
