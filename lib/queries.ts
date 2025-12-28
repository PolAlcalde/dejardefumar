import { createClient } from "@/lib/supabase/server";
import { todayInMadrid } from "@/lib/logic/time";

export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function getActiveSeason() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getUserProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getTodayCheckin(userId: string, seasonId: string) {
  const supabase = createClient();
  const today = todayInMadrid();
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", userId)
    .eq("season_id", seasonId)
    .eq("date", today)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserCheckins(userId: string, seasonId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("checkins")
    .select("date, smoked_today, intensity, mission_done, mood")
    .eq("user_id", userId)
    .eq("season_id", seasonId)
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getSeasonCheckins(seasonId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("checkins")
    .select("user_id, date, smoked_today, intensity, mission_done")
    .eq("season_id", seasonId)
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAllProfiles() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, titles_opt_in")
    .order("display_name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAllSeasons() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
