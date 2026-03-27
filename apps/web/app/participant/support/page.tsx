"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyParticipantSupportRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/user/support");
  }, [router]);

  return null;
}
