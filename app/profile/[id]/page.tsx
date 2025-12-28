import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { buildStats } from "@/lib/logic/stats";
import { dateLabel } from "@/lib/logic/time";
import { getActiveSeason, getUserCheckins, getUserProfile, requireUser } from "@/lib/queries";
import { updateProfile } from "@/app/dashboard/actions";

interface ProfilePageProps {
  params: { id: string };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const season = await getActiveSeason();
  if (!season) {
    return (
      <div>
        <NavBar email={user.email} />
        <p className="rounded-2xl border border-slate-900 bg-slate-950/70 p-6 text-slate-300">
          Esperando nueva temporada.
        </p>
      </div>
    );
  }

  const profileId = params.id === "me" ? user.id : params.id;
  const profile = await getUserProfile(profileId);
  const checkins = await getUserCheckins(profileId, season.id);
  const stats = buildStats(checkins, profile?.titles_opt_in ?? true);

  return (
    <div>
      <NavBar email={user.email} />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.6fr]">
        <section className="rounded-2xl border border-slate-900 bg-slate-950/70 p-6">
          <h1 className="text-2xl font-semibold">Perfil</h1>
          <div className="mt-4 grid gap-3 text-sm text-slate-300">
            <p>Jugador: {profile?.display_name ?? "Sin nombre"}</p>
            <p>Rango: {stats.rank}</p>
            <p>LP: {stats.lp}</p>
            <p>Racha actual: {stats.currentStreak} días</p>
          </div>
          <div className="mt-6">
            <p className="text-sm font-semibold">Gráfico rápido (7 días)</p>
            <div className="mt-2 flex items-end gap-2">
              {stats.last7Days.map((day) => (
                <div key={day.date} className="flex flex-col items-center gap-1">
                  <div
                    className={`h-12 w-3 rounded-full ${
                      day.smoked === null
                        ? "bg-slate-800"
                        : day.smoked
                          ? "bg-red-500/70"
                          : "bg-emerald-500/70"
                    }`}
                  />
                  <span className="text-[10px] text-slate-500">{dateLabel(day.date)}</span>
                </div>
              ))}
            </div>
          </div>
          <h2 className="mt-6 text-lg font-semibold">Historial</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            {checkins.slice().reverse().map((checkin) => (
              <div
                key={checkin.date}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2"
              >
                <span>{dateLabel(checkin.date)}</span>
                <span>{checkin.smoked_today ? "Fumé" : "Libre"}</span>
              </div>
            ))}
          </div>
        </section>
        <aside className="rounded-2xl border border-slate-900 bg-slate-950/70 p-6">
          <h2 className="text-lg font-semibold">Ajustes</h2>
          {profileId === user.id ? (
            <form action={updateProfile} className="mt-4 space-y-4">
              <div>
                <label className="text-sm">Nombre visible</label>
                <input
                  name="displayName"
                  defaultValue={profile?.display_name ?? ""}
                  className="mt-1 w-full"
                  required
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input type="hidden" name="titlesOptIn" value="false" />
                <input
                  type="checkbox"
                  name="titlesOptIn"
                  value="true"
                  defaultChecked={profile?.titles_opt_in ?? true}
                />
                <span>Mostrar motes divertidos</span>
              </div>
              <button className="w-full rounded-lg bg-brand-500 py-2 text-sm font-semibold">
                Guardar cambios
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              Solo puedes editar tu propio perfil.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
