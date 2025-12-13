import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    const { comet_id, user_id } = await req.json();

    const { error: insertError } = await supabase
        .from("comet_votes")
        .insert({
            comet_id,
            user_id,
        });
    if (insertError) {
        return Response.json(
            { error: insertError.message },
            { status: 500 }
        );
    }

    const { error: rpcError } = await supabase.rpc(
        "maybe_activate_comet",
        {
            p_comet_id: comet_id,
        }
    );

    if (rpcError) {
        return Response.json(
            { error: rpcError.message },
            { status: 500 },
        );
    }
    return Response.json({ status: "ok" });
}

/* 
calling in frontend:
fetch("/api/comets/vote", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    comet_id: "COMET_UUID",
    user_id: "USER_UUID"
  })
})
.then(res => res.json())
.then(console.log);
*/