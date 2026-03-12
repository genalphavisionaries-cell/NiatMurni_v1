import { TutorStudentsTableClient, type TutorStudentRow } from "./TutorStudentsTableClient";

export const metadata = {
  title: "Students | Tutor | Niat Murni",
};

export default function TutorStudentsPage() {
  const data: TutorStudentRow[] = []; // TODO: from Go API

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
        <p className="mt-1 text-sm text-gray-500">Students in your classes (data from Go API)</p>
      </div>
      <TutorStudentsTableClient data={data} />
    </div>
  );
}
