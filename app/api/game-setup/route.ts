import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { PayloadGame } from "@/container/Pages/SelectTeam";

export async function POST(req: Request) {
  try {
    const body: PayloadGame = await req.json();
    const { userId, yourTeam, opponentTeam, overs, maxPlayer, target, status, started_at } = body;

    if (!userId || !yourTeam || !opponentTeam || !overs || !maxPlayer) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const { data: activeGame } = await supabase
      .from("game-setup")
      .select("id")
      .eq("userId", userId)
      .in("status", ["PENDING", "IN_PROGRESS"])
      .maybeSingle();

    if (activeGame) {
      return NextResponse.json({ success: false, message: "Complete your current game first" }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("game-setup")
      .insert([
        {
          userId,
          yourTeam,
          opponentTeam,
          overs,
          maxPlayer,
          target,
          status,
          started_at,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "userId is required" }, { status: 400 });
    }

    const { data, error } = await supabase.from("game-setup").select("*").eq("userId", userId).order("created_at", { ascending: false }).limit(1); // <--- only the latest

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    const latestGame = data?.[0] || null;

    return NextResponse.json({ success: true, data: latestGame });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) return NextResponse.json({ success: false, message: "Game id is required" }, { status: 400 });

    const { error } = await supabase.from("game-setup").delete().eq("id", id);

    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 500 });
  }
}
