import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Magic links land here. Supabase sends either a PKCE `code` or a
// `token_hash`+`type` pair depending on the email template.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") || "/account";

  const failed = (reason: string) =>
    NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(reason)}`,
    );

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch {
    return failed("Login isn't configured yet");
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return failed(error.message);
    return NextResponse.redirect(`${origin}${next}`);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "magiclink" | "email" | "signup" | "recovery" | "invite",
      token_hash: tokenHash,
    });
    if (error) return failed(error.message);
    return NextResponse.redirect(`${origin}${next}`);
  }

  return failed("That sign-in link is missing its token.");
}
