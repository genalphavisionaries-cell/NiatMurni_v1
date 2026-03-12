import { ParticipantsTableClient, type ParticipantRow } from "./ParticipantsTableClient";

export const metadata = {
  title: "Participants | Admin | Niat Murni",
};

export default function AdminParticipantsPage() {
  const data: ParticipantRow[] = []; // TODO: fetch from Go API

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Participants</h1>
        <p className="mt-1 text-sm text-gray-500">Registered participants (data from Go API)</p>
      </div>
      <ParticipantsTableClient data={data} />
    </div>
  );
}
