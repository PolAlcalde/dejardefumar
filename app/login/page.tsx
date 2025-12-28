import { AuthForms } from "@/components/AuthForms";
import { requireUser } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await requireUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto mt-24 grid w-full max-w-4xl gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Bienvenido a RachaRank</h1>
        <p className="text-slate-400">
          Compite con tu grupo para dejar de fumar. Suma LP, sube de rango y
          mantén la racha.
        </p>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>✔ Check-in diario de 1 minuto.</li>
          <li>✔ Ranking en tiempo real.</li>
          <li>✔ Stats y motes divertidos opcionales.</li>
        </ul>
      </div>
      <AuthForms />
    </div>
  );
}
