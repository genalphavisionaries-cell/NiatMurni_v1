import Link from "next/link";
import RegisterClient from "./RegisterClient";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default async function RegisterPage({ params }: Props) {
  const { id } = await params;
  return <RegisterClient id={id} />;
}
