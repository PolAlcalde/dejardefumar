"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction, registerAction, type ActionState } from "@/app/login/actions";

const initialState: ActionState = { error: null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="w-full bg-brand-500 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-700"
      disabled={pending}
    >
      {pending ? "Enviando..." : label}
    </button>
  );
}

export function AuthForms() {
  const [loginState, loginFormAction] = useFormState(loginAction, initialState);
  const [registerState, registerFormAction] = useFormState(registerAction, initialState);

  return (
    <div className="space-y-6 rounded-2xl border border-slate-900 bg-slate-950/70 p-6">
      <form action={loginFormAction} className="space-y-4">
        <h2 className="text-lg font-semibold">Inicia sesión</h2>
        <input name="email" type="email" placeholder="tu@email.com" required />
        <input name="password" type="password" placeholder="Contraseña" required />
        {loginState.error ? (
          <p className="text-sm text-red-400">{loginState.error}</p>
        ) : null}
        <SubmitButton label="Entrar" />
      </form>
      <div className="border-t border-slate-900 pt-4">
        <form action={registerFormAction} className="space-y-4">
          <h2 className="text-lg font-semibold">Crea tu cuenta</h2>
          <input name="email" type="email" placeholder="tu@email.com" required />
          <input name="password" type="password" placeholder="Contraseña" required />
          {registerState.error ? (
            <p className="text-sm text-red-400">{registerState.error}</p>
          ) : null}
          <button className="w-full border border-brand-500 py-2 text-sm font-semibold text-brand-200">
            Registrarme
          </button>
        </form>
      </div>
    </div>
  );
}
