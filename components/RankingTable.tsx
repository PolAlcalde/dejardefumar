"use client";

import { useMemo, useState } from "react";
import type { RankingRow } from "@/lib/logic/ranking";
import { ranks } from "@/lib/logic/lp";

export function RankingTable({ rows }: { rows: RankingRow[] }) {
  const [query, setQuery] = useState("");
  const [rankFilter, setRankFilter] = useState("all");

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesQuery = row.displayName.toLowerCase().includes(query.toLowerCase());
      const matchesRank = rankFilter === "all" || row.rank === rankFilter;
      return matchesQuery && matchesRank;
    });
  }, [rows, query, rankFilter]);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar jugador"
          className="w-56"
        />
        <select
          value={rankFilter}
          onChange={(event) => setRankFilter(event.target.value)}
        >
          <option value="all">Todos los rangos</option>
          {ranks.map((rank) => (
            <option key={rank.name} value={rank.name}>
              {rank.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-400">
            <tr>
              <th className="py-2">#</th>
              <th className="py-2">Jugador</th>
              <th className="py-2">Rango</th>
              <th className="py-2">LP</th>
              <th className="py-2">Racha</th>
              <th className="py-2">Días sin fumar</th>
              <th className="py-2">Recaídas</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, index) => (
              <tr key={row.id} className="border-t border-slate-900">
                <td className="py-3 text-slate-400">{index + 1}</td>
                <td className="py-3 font-medium text-white">{row.displayName}</td>
                <td className="py-3">{row.rank}</td>
                <td className="py-3">{row.lp}</td>
                <td className="py-3">{row.currentStreak}</td>
                <td className="py-3">{row.daysSmokeFree}</td>
                <td className="py-3">{row.relapsesCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
