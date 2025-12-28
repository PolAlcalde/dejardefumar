"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RankingLive({ seasonId }: { seasonId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("ranking-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "checkins", filter: `season_id=eq.${seasonId}` },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, seasonId]);

  return null;
}
