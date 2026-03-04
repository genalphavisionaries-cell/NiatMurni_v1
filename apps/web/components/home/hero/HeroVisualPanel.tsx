import HeroHeader from "./HeroHeader";
import HeroSlider from "./HeroSlider";

type HeroVisualPanelProps = {
  siteName?: string;
};

export default function HeroVisualPanel({ siteName }: HeroVisualPanelProps) {
  return (
    <div className="relative h-full min-h-0 w-full">
      <HeroHeader siteName={siteName} />
      <HeroSlider />
    </div>
  );
}
