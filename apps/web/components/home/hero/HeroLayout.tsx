import QuickClassPanel from "./QuickClassPanel";
import HeroVisualPanel from "./HeroVisualPanel";

type HeroLayoutProps = {
  siteName?: string;
};

export default function HeroLayout({ siteName }: HeroLayoutProps) {
  return (
    <section
      className="grid h-screen w-full grid-cols-[440px_1fr] overflow-hidden max-lg:grid-cols-1 max-lg:grid-rows-[auto_1fr]"
      aria-label="Hero"
    >
      <aside className="h-full shrink-0 overflow-y-auto max-lg:max-h-[70vh]">
        <QuickClassPanel />
      </aside>
      <div className="relative h-full min-h-0">
        <HeroVisualPanel siteName={siteName} />
      </div>
    </section>
  );
}
