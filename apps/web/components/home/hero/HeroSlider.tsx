"use client";

import { useState, useEffect } from "react";

const SLIDES = [
  { src: "/images/banner1.jpg", alt: "Training" },
  { src: "/images/banner2.jpg", alt: "Certification" },
  { src: "/images/banner3.jpg", alt: "Class" },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative h-full w-full">
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-[600ms] ease-in-out"
          style={{
            opacity: i === index ? 1 : 0,
            zIndex: i === index ? 1 : 0,
          }}
        >
          <div
            className="h-full w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundColor: "#0f172a" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.alt}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4))",
            }}
          />
        </div>
      ))}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-200 focus:outline focus:outline-2 focus:outline-white focus:outline-offset-2 ${
              i === index ? "w-6 bg-white" : "w-2 bg-white/50"
            }`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
