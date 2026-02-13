import { NextResponse } from "next/server";
import { deleteCookie } from "cookies-next";

export async function POST(req: Request) {
  const response = NextResponse.json({ success: true });
  deleteCookie("TOKEN", { res: response });
  return response;
}
