import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { INITIAL_BUSINESSES } from "@/lib/mock-data";

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [user, domain] = parts;
  if (user.length <= 2) {
    return `${user[0]}***@${domain}`;
  }
  const start = user.slice(0, 2);
  const end = user.slice(-1);
  return `${start}***${end}@${domain}`;
}

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json(
        { success: false, message: "Informe seu e-mail, WhatsApp ou nome da sua loja." },
        { status: 400 }
      );
    }

    const cleanInput = identifier.trim();
    const origin = request.nextUrl.origin || "https://feira-digital-xi.vercel.app";
    const redirectTo = `${origin}/redefinir-senha`;

    // 1. Mapeamento de usuários amigáveis de teste/demo
    const USERNAME_MAP: Record<string, string> = {
      "disruptive": "rafa.busy@gmail.com",
      "disruptive1": "rafa.busy+1@gmail.com",
      "disruptive2": "rafa.busy+2@gmail.com",
      "disruptive3": "rafa.busy+3@gmail.com",
    };

    const lowerInput = cleanInput.toLowerCase();
    if (USERNAME_MAP[lowerInput]) {
      const mappedEmail = USERNAME_MAP[lowerInput];
      if (isSupabaseConfigured()) {
        const supabase = await createClient();
        await supabase.auth.resetPasswordForEmail(mappedEmail, { redirectTo });
      }
      return NextResponse.json({
        success: true,
        type: "email_sent",
        maskedEmail: maskEmail(mappedEmail),
        message: `Identificamos o usuário "${cleanInput}"! O link de recuperação de acesso foi enviado com segurança para o e-mail ${maskEmail(mappedEmail)}.`,
      });
    }

    // 2. Se for um e-mail válido direto
    if (cleanInput.includes("@")) {
      if (isSupabaseConfigured()) {
        const supabase = await createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(cleanInput.toLowerCase(), {
          redirectTo,
        });

        if (error) {
          return NextResponse.json(
            { success: false, message: error.message || "Erro ao solicitar recuperação de senha." },
            { status: 400 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        type: "email_sent",
        maskedEmail: maskEmail(cleanInput),
        message: `Link de recuperação enviado com sucesso para ${maskEmail(cleanInput)}! Verifique sua caixa de entrada e pasta de spam.`,
      });
    }

    // 3. Se for WhatsApp ou Nome/Slug da Loja
    const digitsOnly = cleanInput.replace(/\D/g, "");
    let foundBusiness: {
      id: string;
      name: string;
      slug: string;
      whatsapp: string;
      email?: string | null;
      user_id?: string;
    } | null = null;

    if (!isSupabaseConfigured()) {
      // Busca no mock data
      const mock = INITIAL_BUSINESSES.find(
        (b) =>
          (digitsOnly.length >= 8 && b.whatsapp.includes(digitsOnly)) ||
          b.slug.toLowerCase() === lowerInput ||
          b.name.toLowerCase().includes(lowerInput)
      );
      if (mock) {
        foundBusiness = {
          id: mock.id,
          name: mock.name,
          slug: mock.slug,
          whatsapp: mock.whatsapp,
          email: mock.email,
          user_id: mock.user_id,
        };
      }
    } else {
      const supabase = await createClient();

      // 3.1. Busca por WhatsApp
      if (digitsOnly.length >= 8) {
        const { data: byPhone } = await supabase
          .from("businesses")
          .select("id, name, slug, whatsapp, email, user_id")
          .or(`whatsapp.eq.${digitsOnly},whatsapp.eq.55${digitsOnly},whatsapp.ilike.%${digitsOnly}%`)
          .limit(1)
          .maybeSingle();

        if (byPhone) foundBusiness = byPhone;
      }

      // 3.2. Busca por Slug ou Nome
      if (!foundBusiness) {
        const { data: bySlug } = await supabase
          .from("businesses")
          .select("id, name, slug, whatsapp, email, user_id")
          .or(`slug.eq.${lowerInput},name.ilike.%${cleanInput}%`)
          .limit(1)
          .maybeSingle();

        if (bySlug) foundBusiness = bySlug;
      }
    }

    // Se encontrou a loja
    if (foundBusiness) {
      let storeEmail = foundBusiness.email;

      // Se não tiver o email na tabela businesses, tenta consultar em auth.users
      if (!storeEmail && foundBusiness.user_id && isSupabaseConfigured()) {
        try {
          const adminSupabase = getAdminSupabaseClient();
          const { data: userData } = await adminSupabase.auth.admin.getUserById(
            foundBusiness.user_id
          );
          if (userData?.user?.email) {
            storeEmail = userData.user.email;
            // Salva de forma persistente para as próximas consultas
            await adminSupabase
              .from("businesses")
              .update({ email: storeEmail })
              .eq("id", foundBusiness.id);
          }
        } catch {
          // prossegue
        }
      }

      if (storeEmail) {
        if (isSupabaseConfigured()) {
          const supabase = await createClient();
          await supabase.auth.resetPasswordForEmail(storeEmail, { redirectTo });
        }

        return NextResponse.json({
          success: true,
          type: "store_found_and_sent",
          storeName: foundBusiness.name,
          maskedEmail: maskEmail(storeEmail),
          message: `Localizamos sua vitrine "${foundBusiness.name}"! O e-mail de login cadastrado é ${maskEmail(storeEmail)}, e acabamos de enviar o link de redefinição para ele.`,
        });
      }

      // Loja encontrada mas sem e-mail recuperável automaticamente
      return NextResponse.json({
        success: false,
        type: "store_needs_support",
        storeName: foundBusiness.name,
        whatsapp: foundBusiness.whatsapp,
        message: `Localizamos sua vitrine "${foundBusiness.name}", mas o e-mail não pôde ser recuperado automaticamente. Clique no botão abaixo para chamar o suporte no WhatsApp.`,
      });
    }

    return NextResponse.json(
      {
        success: false,
        type: "not_found",
        message:
          "Não encontramos nenhuma vitrine ou conta com esses dados. Tente informar o seu WhatsApp cadastrado, o link da sua vitrine ou o e-mail.",
      },
      { status: 404 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Erro ao processar solicitação de recuperação." },
      { status: 500 }
    );
  }
}
