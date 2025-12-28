import { requireUser } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await requireUser();
  redirect(user ? "/dashboard" : "/login");
}
