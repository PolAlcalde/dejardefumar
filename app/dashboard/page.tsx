import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { CheckinModal } from "@/components/CheckinModal";
import { buildStats } from "@/lib/logic/stats";
import { dateLabel } from "@/lib/logic/time";
import { ranks } from "@/lib/logic/lp";
import {
  getActiveSeason,
  getTodayCheckin,
  getUserCheckins,
  getUserProfile,
  requireUser
} from "@/lib/queries";

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const season = await getActiveSeason();
  const profile = await getUserProfile(user.id);

  if (!season) {
    return (
      <div>
        <NavBar email={user.email} />
        <div className="rounded-2xl border border-slate-900 bg-slate-950/70 p-6">
          <h1 className="text-2xl font-semibold">Esperando nueva temporada</h1>
          <p className="mt-2 text-slate-400">
            Aún no hay temporada activa. El check-in está deshabilitado.
          </p>
        </div>
      </div>
    );
  }

  const [todayCheckin, checkins] = await Promise.all([
    getTodayCheckin(user.id, season.id),
    getUserCheckins(user.id, season.id)
  ]);

  const stats = buildStats(checkins, profile?.titles_opt_in ?? true);
  const rank = ranks.find((item) => item.name === stats.rank) ?? ranks[0];
  const nextRank = ranks.find((item) => item.min > rank.min);
  const progress = nextRank
    ? Math.min(100, Math.round(((stats.lp - rank.min) / (nextRank.min - rank.min)) * 100))
    : 100;

  return (
    <div>
      <NavBar email={user.email} />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6 rounded-2xl border border-slate-900 bg-slate-950/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Hola, {profile?.display_name ?? "fumador"}</h1>
              <p className="text-sm text-slate-400">Temporada: {season.name}</p>
            </div>
            <CheckinModal disabled={Boolean(todayCheckin)} />
          </div>
          {todayCheckin ? (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              Ya hiciste el check-in de hoy. ¡Sigue así!
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs uppercase text-slate-400">LP</p>
              <p className="mt-2 text-2xl font-semibold">{stats.lp}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs uppercase text-slate-400">Rango</p>
              <p className="mt-2 text-2xl font-semibold">{stats.rank}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs uppercase text-slate-400">Racha actual</p>
              <p className="mt-2 text-2xl font-semibold">{stats.currentStreak} días</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs uppercase text-slate-400">Días sin fumar</p>
              <p className="mt-2 text-2xl font-semibold">{stats.daysSmokeFree}</p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Progreso al siguiente rango</span>
              <span>{nextRank ? nextRank.name : "Top"}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full bg-brand-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Últimos 7 días</p>
            <div className="mt-3 grid grid-cols-7 gap-2 text-center text-xs">
              {stats.last7Days.map((day) => (
                <div
                  key={day.date}
                  className={`rounded-lg border px-2 py-3 ${
                    day.smoked === null
                      ? "border-slate-800 text-slate-500"
                      : day.smoked
                        ? "border-red-500/40 bg-red-500/10 text-red-300"
                        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  }`}
                >
                  <div>{dateLabel(day.date)}</div>
                  <div className="mt-1 text-[10px]">
                    {day.smoked === null ? "-" : day.smoked ? "Fumé" : "Libre"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-900 bg-slate-950/70 p-6">
            <h2 className="text-lg font-semibold">Stats divertidas</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>Racha más larga: {stats.longestStreak} días</p>
              <p>Recaídas: {stats.relapsesCount}</p>
              {stats.title ? <p>Mote del mes: {stats.title}</p> : null}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-900 bg-slate-950/70 p-6">
            <h2 className="text-lg font-semibold">Estado de hoy</h2>
            <p className="mt-2 text-sm text-slate-400">
              {todayCheckin
                ? todayCheckin.smoked_today
                  ? "Hoy has fumado. Mañana puedes resetear la racha."
                  : "Hoy vas limpio."
                : "Aún no tienes check-in de hoy."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
