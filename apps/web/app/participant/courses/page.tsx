"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyParticipantCoursesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/user/courses");
  }, [router]);

  return null;
}
