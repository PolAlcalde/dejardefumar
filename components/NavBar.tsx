import Link from "next/link";

interface NavBarProps {
  email?: string | null;
}

export function NavBar({ email }: NavBarProps) {
  return (
    <nav className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-900 bg-slate-950/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-lg font-bold text-white">
          RR
        </div>
        <div>
          <p className="text-lg font-semibold">RachaRank</p>
          <p className="text-xs text-slate-400">Dejar de fumar en modo competitivo</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/dashboard" className="text-slate-200 hover:text-white">
          Dashboard
        </Link>
        <Link href="/ranking" className="text-slate-200 hover:text-white">
          Ranking
        </Link>
        <Link href="/profile/me" className="text-slate-200 hover:text-white">
          Perfil
        </Link>
        {email ? (
          <span className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-400">
            {email}
          </span>
        ) : null}
      </div>
    </nav>
  );
}
