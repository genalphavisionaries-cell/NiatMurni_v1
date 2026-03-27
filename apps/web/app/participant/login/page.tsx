"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyParticipantLoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/user/login");
  }, [router]);

  return null;
}
