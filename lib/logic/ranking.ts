import type { CheckinRow } from "./stats";
import { buildStats } from "./stats";

interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  titles_opt_in: boolean | null;
}

interface CheckinRowWithUser extends CheckinRow {
  user_id: string;
}

export interface RankingRow {
  id: string;
  displayName: string;
  lp: number;
  rank: string;
  currentStreak: number;
  daysSmokeFree: number;
  relapsesCount: number;
}

export function buildRanking(
  profiles: ProfileRow[],
  checkins: CheckinRowWithUser[]
): RankingRow[] {
  const grouped = new Map<string, CheckinRow[]>();

  for (const checkin of checkins) {
    const list = grouped.get(checkin.user_id) ?? [];
    list.push(checkin);
    grouped.set(checkin.user_id, list);
  }

  const rows = profiles.map((profile) => {
    const stats = buildStats(grouped.get(profile.id) ?? [], profile.titles_opt_in ?? true);
    return {
      id: profile.id,
      displayName: profile.display_name ?? "Jugador",
      lp: stats.lp,
      rank: stats.rank,
      currentStreak: stats.currentStreak,
      daysSmokeFree: stats.daysSmokeFree,
      relapsesCount: stats.relapsesCount
    };
  });

  return rows.sort((a, b) => {
    if (b.lp !== a.lp) return b.lp - a.lp;
    if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
    return a.relapsesCount - b.relapsesCount;
  });
}
