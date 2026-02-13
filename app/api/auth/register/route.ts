import { NextResponse } from "next/server";
import { setCookie } from "cookies-next";
import { signUpUser } from "@/utils/services/auth-services";
import { generateToken } from "@/utils/helper-functions/helper-functions";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, username } = body;
  const result = await signUpUser(email, password, username);

  if (!result.success) {
    return NextResponse.json({ success: false, message: result.message }, { status: 400 });
  }

  const token = generateToken();
  const response = NextResponse.json({ success: true, data: result.data });
  setCookie("TOKEN", token, { res: response, maxAge: 60 * 60 * 24 });
  return response;
}
