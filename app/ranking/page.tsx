import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { RankingTable } from "@/components/RankingTable";
import { RankingLive } from "@/components/RankingLive";
import { buildRanking } from "@/lib/logic/ranking";
import { getActiveSeason, getAllProfiles, getSeasonCheckins, requireUser } from "@/lib/queries";

export default async function RankingPage() {
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

  const [profiles, checkins] = await Promise.all([
    getAllProfiles(),
    getSeasonCheckins(season.id)
  ]);

  const ranking = buildRanking(profiles, checkins);

  return (
    <div>
      <NavBar email={user.email} />
      <RankingLive seasonId={season.id} />
      <div className="rounded-2xl border border-slate-900 bg-slate-950/70 p-6">
        <h1 className="text-2xl font-semibold">Ranking de temporada</h1>
        <p className="text-sm text-slate-400">Premio: {season.prize_text ?? "Por definir"}</p>
        <RankingTable rows={ranking} />
      </div>
    </div>
  );
}
