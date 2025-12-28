"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface ActionState {
  error?: string | null;
}

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function loginAction(_prevState: ActionState, formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { error: "Email o contraseña inválidos." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "No pudimos iniciar sesión. Revisa tus datos." };
  }

  redirect("/dashboard");
}

export async function registerAction(_prevState: ActionState, formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { error: "Email o contraseña inválidos." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/dashboard`
    }
  });

  if (error) {
    return { error: "No pudimos registrarte. Inténtalo otra vez." };
  }

  redirect("/dashboard");
}
