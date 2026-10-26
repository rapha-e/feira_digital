import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "./config";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const isRestrictedRoute =
    pathname.startsWith("/painel") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login");

  const applyRobotsHeader = (res: NextResponse) => {
    if (isRestrictedRoute) {
      res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    }
    return res;
  };

  // Se as credenciais do Supabase ainda não estiverem configuradas, permite carregar a página normalmente
  if (!isSupabaseConfigured()) {
    return applyRobotsHeader(supabaseResponse);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proteger a rota /painel
  if (request.nextUrl.pathname.startsWith("/painel") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return redirectResponse;
  }

  // Redirecionar usuário logado caso acerte a tela de login
  if (request.nextUrl.pathname.startsWith("/login") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/painel";
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return redirectResponse;
  }

  return applyRobotsHeader(supabaseResponse);
}
