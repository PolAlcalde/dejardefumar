"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const seasonSchema = z.object({
  name: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  prizeText: z.string().optional()
});

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return false;
  return user.email === process.env.ADMIN_EMAIL;
}

export async function createSeasonAction(formData: FormData) {
  if (!(await requireAdmin())) {
    return { error: "No autorizado." };
  }

  const parsed = seasonSchema.safeParse({
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    prizeText: formData.get("prizeText") || undefined
  });

  if (!parsed.success) {
    return { error: "Datos inválidos." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("seasons").insert({
    name: parsed.data.name,
    start_date: parsed.data.startDate,
    end_date: parsed.data.endDate,
    prize_text: parsed.data.prizeText ?? null,
    is_active: false
  });

  if (error) {
    return { error: "No se pudo crear la temporada." };
  }

  return { success: true };
}

export async function activateSeasonAction(formData: FormData) {
  if (!(await requireAdmin())) {
    return { error: "No autorizado." };
  }

  const seasonId = formData.get("seasonId");
  if (!seasonId || typeof seasonId !== "string") {
    return { error: "Temporada inválida." };
  }

  const admin = createAdminClient();
  await admin.from("seasons").update({ is_active: false }).eq("is_active", true);
  const { error } = await admin
    .from("seasons")
    .update({ is_active: true })
    .eq("id", seasonId);

  if (error) {
    return { error: "No se pudo activar la temporada." };
  }

  return { success: true };
}

export async function closeSeasonAction(formData: FormData) {
  if (!(await requireAdmin())) {
    return { error: "No autorizado." };
  }

  const seasonId = formData.get("seasonId");
  if (!seasonId || typeof seasonId !== "string") {
    return { error: "Temporada inválida." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("seasons")
    .update({ is_active: false })
    .eq("id", seasonId);

  if (error) {
    return { error: "No se pudo cerrar la temporada." };
  }

  return { success: true };
}

export async function updatePrizeAction(formData: FormData) {
  if (!(await requireAdmin())) {
    return { error: "No autorizado." };
  }

  const seasonId = formData.get("seasonId");
  const prizeText = formData.get("prizeText");
  if (!seasonId || typeof seasonId !== "string") {
    return { error: "Temporada inválida." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("seasons")
    .update({ prize_text: typeof prizeText === "string" ? prizeText : null })
    .eq("id", seasonId);

  if (error) {
    return { error: "No se pudo actualizar el premio." };
  }

  return { success: true };
}

export async function resetSeasonsAction() {
  if (!(await requireAdmin())) {
    return { error: "No autorizado." };
  }

  const admin = createAdminClient();
  const { data: active } = await admin
    .from("seasons")
    .select("id")
    .eq("is_active", true)
    .limit(1);

  if (active && active.length > 0) {
    return { error: "No puedes resetear con temporada activa." };
  }

  await admin.from("checkins").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("seasons").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  return { success: true };
}
