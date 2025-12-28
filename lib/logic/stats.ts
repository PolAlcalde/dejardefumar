import { applyDailyLp, getRank, type Intensity } from "./lp";
import { todayInMadrid } from "./time";

export interface CheckinRow {
  date: string;
  smoked_today: boolean;
  intensity: Intensity | null;
  mission_done: boolean;
  mood: string | null;
}

export interface UserStats {
  lp: number;
  rank: string;
  currentStreak: number;
  longestStreak: number;
  daysSmokeFree: number;
  relapsesCount: number;
  last7Days: { date: string; smoked: boolean | null }[];
  title: string | null;
}

export function buildStats(
  checkins: CheckinRow[],
  titlesOptIn: boolean
): UserStats {
  let lp = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let daysSmokeFree = 0;
  let relapsesCount = 0;

  const sorted = [...checkins].sort((a, b) => a.date.localeCompare(b.date));

  for (const checkin of sorted) {
    const result = applyDailyLp(lp, currentStreak, checkin);
    lp = result.lp;
    currentStreak = result.streak;
    if (!checkin.smoked_today) {
      daysSmokeFree += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      relapsesCount += 1;
    }
  }

  const last7Days = buildLast7Days(sorted);
  const title = titlesOptIn ? deriveTitle(sorted) : null;

  return {
    lp,
    rank: getRank(lp).name,
    currentStreak,
    longestStreak,
    daysSmokeFree,
    relapsesCount,
    last7Days,
    title
  };
}

function buildLast7Days(checkins: CheckinRow[]) {
  const today = todayInMadrid();
  const todayDate = new Date(today + "T00:00:00");
  const last7: { date: string; smoked: boolean | null }[] = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(todayDate);
    date.setDate(todayDate.getDate() - i);
    const key = date.toLocaleDateString("en-CA", { timeZone: "Europe/Madrid" });
    const found = checkins.find((item) => item.date === key);
    last7.push({ date: key, smoked: found ? found.smoked_today : null });
  }

  return last7;
}

function deriveTitle(checkins: CheckinRow[]) {
  const today = new Date(todayInMadrid() + "T00:00:00");
  const monthAgo = new Date(today);
  monthAgo.setDate(today.getDate() - 30);

  const recent = checkins.filter((checkin) => {
    const date = new Date(checkin.date + "T00:00:00");
    return date >= monthAgo && date <= today;
  });

  const relapses = recent.filter((checkin) => checkin.smoked_today);
  const relapsesCount = relapses.length;
  const manyIntensities = relapses.filter(
    (checkin) => checkin.intensity === "many"
  );

  const smokeFree30 = checkins
    .slice(-30)
    .every((checkin) => !checkin.smoked_today);

  if (smokeFree30 && relapsesCount === 0) {
    return "Modo leyenda";
  }

  if (relapsesCount <= 2 && manyIntensities.length === 0) {
    return "Fumador social";
  }

  if (relapsesCount >= 6 || manyIntensities.length >= 2) {
    return "Yonki del humo";
  }

  if (relapsesCount >= 4) {
    return "Fumador abusivo";
  }

  return null;
}
