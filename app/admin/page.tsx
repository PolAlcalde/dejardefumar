import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { getAllSeasons, requireUser } from "@/lib/queries";
import {
  activateSeasonAction,
  closeSeasonAction,
  createSeasonAction,
  resetSeasonsAction,
  updatePrizeAction
} from "./actions";

export default async function AdminPage() {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  if (user.email !== process.env.ADMIN_EMAIL) {
    return (
      <div>
        <NavBar email={user.email} />
        <p className="rounded-2xl border border-slate-900 bg-slate-950/70 p-6 text-slate-300">
          No tienes permisos para ver este panel.
        </p>
      </div>
    );
  }

  const seasons = await getAllSeasons();

  return (
    <div>
      <NavBar email={user.email} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-900 bg-slate-950/70 p-6">
          <h1 className="text-2xl font-semibold">Admin de temporadas</h1>
          <form action={createSeasonAction} className="mt-4 space-y-3">
            <input name="name" placeholder="Nombre" required />
            <input name="startDate" type="date" required />
            <input name="endDate" type="date" required />
            <input name="prizeText" placeholder="Premio" />
            <button className="w-full rounded-lg bg-brand-500 py-2 text-sm font-semibold">
              Crear temporada
            </button>
          </form>
          <form action={resetSeasonsAction} className="mt-4">
            <button className="w-full rounded-lg border border-red-500 px-3 py-2 text-sm text-red-300">
              Resetear temporadas (solo sin activa)
            </button>
          </form>
        </section>
        <section className="rounded-2xl border border-slate-900 bg-slate-950/70 p-6">
          <h2 className="text-lg font-semibold">Temporadas</h2>
          <div className="mt-4 space-y-4 text-sm">
            {seasons.map((season) => (
              <div
                key={season.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
              >
                <p className="font-semibold">{season.name}</p>
                <p className="text-slate-400">
                  {season.start_date} → {season.end_date}
                </p>
                <p className="text-slate-400">Premio: {season.prize_text ?? "-"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={activateSeasonAction}>
                    <input type="hidden" name="seasonId" value={season.id} />
                    <button className="rounded-md border border-brand-500 px-3 py-1 text-xs text-brand-200">
                      Activar
                    </button>
                  </form>
                  <form action={closeSeasonAction}>
                    <input type="hidden" name="seasonId" value={season.id} />
                    <button className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300">
                      Cerrar
                    </button>
                  </form>
                  <form action={updatePrizeAction} className="flex gap-2">
                    <input type="hidden" name="seasonId" value={season.id} />
                    <input name="prizeText" placeholder="Nuevo premio" />
                    <button className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300">
                      Actualizar premio
                    </button>
                  </form>
                </div>
                {season.is_active ? (
                  <p className="mt-2 text-xs text-emerald-400">Activa</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
