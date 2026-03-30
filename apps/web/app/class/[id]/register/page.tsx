import { PublicSiteShell } from "@/components/public";
import RegisterClient from "./RegisterClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RegisterPage({ params }: Props) {
  const { id } = await params;
  return (
    <PublicSiteShell>
      <RegisterClient id={id} />
    </PublicSiteShell>
  );
}
