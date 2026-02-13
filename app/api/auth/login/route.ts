import { NextResponse } from "next/server";
import { setCookie } from "cookies-next";
import { generateToken } from "@/utils/helper-functions/helper-functions";
import { signInUser } from "@/utils/services/auth-services";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;
  const result = await signInUser(email, password);

  if (!result.success) {
    return NextResponse.json({ success: false, message: result.message }, { status: 400 });
  }

  const token = generateToken();
  const response = NextResponse.json({ success: true, data: result.data });
  setCookie("TOKEN", token, { res: response, maxAge: 60 * 60 * 24 });

  return response;
}
