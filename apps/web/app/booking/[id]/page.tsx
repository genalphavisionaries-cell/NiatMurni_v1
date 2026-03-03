import BookingClient from "./BookingClient";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default async function BookingPage({ params }: Props) {
  const { id } = await params;
  return <BookingClient id={id} />;
}
