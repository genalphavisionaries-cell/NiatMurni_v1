import { PublicSiteShell } from "@/components/public";
import BookingClient from "./BookingClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BookingPage({ params }: Props) {
  const { id } = await params;
  return (
    <PublicSiteShell>
      <BookingClient id={id} />
    </PublicSiteShell>
  );
}
