"use client";

import { useState } from "react";
import { submitCheckin } from "@/app/dashboard/actions";

export function CheckinModal({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await submitCheckin(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setOpen(false);
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-700"
      >
        Hice check-in
      </button>
      {success ? (
        <p className="mt-2 text-sm text-emerald-400">
          Check-in guardado. ¡Buen trabajo!
        </p>
      ) : null}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Check-in rápido</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-slate-400"
              >
                Cerrar
              </button>
            </div>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">¿Has fumado hoy?</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="smokedToday" value="false" required />
                    No
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="smokedToday" value="true" />
                    Sí
                  </label>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Intensidad</label>
                  <select name="intensity" className="mt-1 w-full">
                    <option value="none">Sin humo</option>
                    <option value="puff">Solo una calada</option>
                    <option value="half">Medio</option>
                    <option value="one">Uno</option>
                    <option value="many">Varios</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Ánimo</label>
                  <select name="mood" className="mt-1 w-full">
                    <option value="">-</option>
                    <option value="chill">Chill</option>
                    <option value="ansioso">Ansioso</option>
                    <option value="estresado">Estresado</option>
                    <option value="social">Social</option>
                    <option value="random">Random</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="missionDone" value="true" />
                <span>Misión diaria completada</span>
              </div>
              <div>
                <label className="text-sm font-medium">Nota (opcional)</label>
                <textarea
                  name="note"
                  maxLength={140}
                  rows={3}
                  className="mt-1 w-full"
                  placeholder="¿Cómo te ha ido hoy?"
                />
              </div>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              <button className="w-full rounded-lg bg-brand-500 py-2 text-sm font-semibold">
                Guardar check-in
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
