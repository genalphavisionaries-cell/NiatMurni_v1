"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyParticipantProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/user/profile");
  }, [router]);

  return null;
}
