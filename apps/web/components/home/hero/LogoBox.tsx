"use client";

import Link from "next/link";

type LogoBoxProps = {
  logoUrl?: string | null;
  alt?: string;
};

const DEFAULT_LOGO = "/logo-placeholder.png";

export default function LogoBox({ logoUrl = null, alt = "Niat Murni Academy" }: LogoBoxProps) {
  const src = logoUrl || DEFAULT_LOGO;
  return (
    <div className="logo-box flex h-9 items-center" style={{ marginRight: 16 }}>
      <Link href="/" className="flex items-center focus:outline focus:outline-2 focus:outline-white focus:outline-offset-2">
        <img
          src={src}
          alt={alt}
          className="h-9 w-auto object-contain"
          style={{ height: 36, width: "auto", objectFit: "contain" }}
          loading="eager"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = "none";
            const fallback = target.parentElement?.querySelector(".logo-fallback") as HTMLElement | null;
            if (fallback) fallback.style.display = "inline";
          }}
        />
        <span className="logo-fallback hidden text-lg font-semibold text-white drop-shadow-md" style={{ display: "none" }}>
          {alt}
        </span>
      </Link>
    </div>
  );
}
