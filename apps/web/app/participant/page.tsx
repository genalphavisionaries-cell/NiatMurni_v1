"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyParticipantRootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/user");
  }, [router]);

  return null;
}
