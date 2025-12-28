export type Intensity = "none" | "puff" | "half" | "one" | "many";

export const ranks = [
  { name: "Bronce", min: 0, max: 199 },
  { name: "Plata", min: 200, max: 399 },
  { name: "Oro", min: 400, max: 599 },
  { name: "Platino", min: 600, max: 799 },
  { name: "Esmeralda", min: 800, max: 999 },
  { name: "Diamante", min: 1000, max: 1199 },
  { name: "Master", min: 1200, max: 1399 },
  { name: "Gran Master", min: 1400, max: 1599 },
  { name: "Challenger", min: 1600, max: Infinity }
];

export function getRank(lp: number) {
  return ranks.find((rank) => lp >= rank.min && lp <= rank.max) ?? ranks[0];
}

export interface CheckinInput {
  smoked_today: boolean;
  intensity: Intensity | null;
  mission_done: boolean;
}

export function applyDailyLp(
  lp: number,
  currentStreak: number,
  checkin: CheckinInput
) {
  let nextLp = lp;
  let nextStreak = currentStreak;

  if (!checkin.smoked_today) {
    nextLp += 10;
    nextStreak += 1;

    if (nextStreak === 3) nextLp += 10;
    if (nextStreak === 7) nextLp += 25;
    if (nextStreak === 14) nextLp += 50;
    if (nextStreak === 30) nextLp += 150;

    if (checkin.mission_done) {
      nextLp += 5;
    }
  } else {
    nextStreak = 0;
    if (checkin.intensity === "puff" || checkin.intensity === "half") {
      nextLp -= 40;
    }
    if (checkin.intensity === "one" || checkin.intensity === "many") {
      nextLp -= 80;
    }
  }

  if (nextLp < 0) nextLp = 0;

  return { lp: nextLp, streak: nextStreak };
}
