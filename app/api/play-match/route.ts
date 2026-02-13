import { supabase } from "@/lib/supabaseClient";
import { UpdatedData } from "@/utils/services/services";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { gameId, userId, yourTeam, opponentTeam, overs, target, status, wickets, score } = body;

    if (!gameId || !userId || !yourTeam || !opponentTeam || overs === undefined || !target || !status) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("play-match")
      .insert([
        {
          gameId,
          userId,
          yourTeam,
          opponentTeam,
          overs,
          target,
          status,
          score,
          wickets,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body: UpdatedData = await req.json();
    const { overs, status, wickets, score, gameId, userId } = body;

    if (!gameId) {
      return NextResponse.json({ success: false, message: "Match ID required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("play-match")
      .update({
        overs,
        status,
        score,
        wickets,
        updated_at: new Date().toISOString(),
      })
      .eq("gameId", gameId)
      .eq("userId", userId)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
    const gameId = searchParams.get("gameId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "userId is required" }, { status: 400 });
    }

    let query = supabase.from("play-match").select("*").eq("userId", userId);

    if (gameId) {
      query = query.eq("gameId", gameId);
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(1).maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: true, data: null, message: "No match found" }, { status: 200 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Invalid request" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { userId, gameId } = body;

    if (!userId || !gameId) {
      return NextResponse.json({ success: false, message: "userId and gameId are required" }, { status: 400 });
    }

    const { data, error } = await supabase.from("play-match").delete().eq("userId", userId).eq("gameId", gameId);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, message: "No match found to delete" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Match deleted successfully", data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Invalid request" }, { status: 500 });
  }
}
