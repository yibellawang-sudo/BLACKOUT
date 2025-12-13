import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    //try to feych one from a table, using "ideas" as placeholder rn
    const { data, error } = await supabase.from("ideas").select("*").limit(1);
    if (error) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: "ok", data });
}