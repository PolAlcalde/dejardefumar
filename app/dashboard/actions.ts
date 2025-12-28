"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { todayInMadrid } from "@/lib/logic/time";
import { getActiveSeason } from "@/lib/queries";

const checkinSchema = z.object({
  smokedToday: z.enum(["true", "false"]),
  intensity: z.enum(["none", "puff", "half", "one", "many"]).optional(),
  mood: z.enum(["chill", "ansioso", "estresado", "social", "random"]).optional(),
  missionDone: z.enum(["true", "false"]).optional(),
  note: z.string().max(140).optional()
});

export async function submitCheckin(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Necesitas iniciar sesión." };
  }

  const season = await getActiveSeason();
  if (!season) {
    return { error: "No hay temporada activa." };
  }

  const parsed = checkinSchema.safeParse({
    smokedToday: formData.get("smokedToday"),
    intensity: formData.get("intensity") || "none",
    mood: formData.get("mood") || undefined,
    missionDone: formData.get("missionDone") ?? "false",
    note: formData.get("note") || undefined
  });

  if (!parsed.success) {
    return { error: "Datos inválidos en el check-in." };
  }

  if (parsed.data.smokedToday === "true" && parsed.data.intensity === "none") {
    return { error: "Selecciona la intensidad si has fumado." };
  }

  const today = todayInMadrid();

  const { data: existing } = await supabase
    .from("checkins")
    .select("id")
    .eq("user_id", user.id)
    .eq("season_id", season.id)
    .eq("date", today)
    .maybeSingle();

  if (existing) {
    return { error: "Ya hiciste el check-in de hoy." };
  }

  const payload = {
    user_id: user.id,
    season_id: season.id,
    date: today,
    smoked_today: parsed.data.smokedToday === "true",
    intensity: parsed.data.smokedToday === "true" ? parsed.data.intensity : "none",
    mood: parsed.data.mood ?? null,
    mission_done: parsed.data.missionDone === "true",
    note: parsed.data.note ?? null
  };

  const { error } = await supabase.from("checkins").insert(payload);

  if (error) {
    return { error: "No se pudo guardar el check-in." };
  }

  return { success: true };
}

const profileSchema = z.object({
  displayName: z.string().min(2),
  titlesOptIn: z.enum(["true", "false"])
});

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Necesitas iniciar sesión." };
  }

  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    titlesOptIn: formData.get("titlesOptIn") ?? "false"
  });

  if (!parsed.success) {
    return { error: "Nombre inválido." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      titles_opt_in: parsed.data.titlesOptIn === "true"
    })
    .eq("id", user.id);

  if (error) {
    return { error: "No se pudo actualizar el perfil." };
  }

  return { success: true };
}
