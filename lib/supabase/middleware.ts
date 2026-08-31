import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseKey, supabaseUrl } from "./config";

const PROTECTED_PREFIXES = ["/account"];
const CALLBACK_PATH = "/auth/callback";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!supabaseUrl || !supabaseKey) return supabaseResponse;

  // Supabase redirects sign-in links to the project's Site URL, which won't
  // be the callback route. Hand the code off so the session gets exchanged.
  const code = request.nextUrl.searchParams.get("code");
  if (code && request.nextUrl.pathname !== CALLBACK_PATH) {
    const callback = request.nextUrl.clone();
    callback.pathname = CALLBACK_PATH;
    return NextResponse.redirect(callback);
  }

  let user = null;
  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set on both the request and a fresh response, or refreshed
          // sessions get dropped.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    // Keep getUser() immediately after the client: it revalidates the token
    // and drives the cookie refresh above.
    ({
      data: { user },
    } = await supabase.auth.getUser());
  } catch {
    // A Supabase outage shouldn't 500 the public pages; treat as signed out.
    return supabaseResponse;
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );
  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/signin";
    const redirect = NextResponse.redirect(redirectUrl);
    // Carry over anything the refresh just wrote.
    supabaseResponse.cookies
      .getAll()
      .forEach((c) => redirect.cookies.set(c.name, c.value, c));
    return redirect;
  }

  return supabaseResponse;
}
