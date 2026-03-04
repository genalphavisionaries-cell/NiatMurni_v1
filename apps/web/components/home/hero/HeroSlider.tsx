"use client";

export default function HeroSlider() {
  return (
    <div
      className="hero-slider absolute inset-0 h-full w-full"
    >
      <img
        src="/images/food-handling-hero.jpg"
        alt=""
        className="h-full w-full object-cover"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}
