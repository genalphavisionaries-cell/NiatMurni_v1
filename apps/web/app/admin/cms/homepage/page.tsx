import { getHomepageSettings } from "@/lib/homepage-settings";
import { FormSection, FormLabel, TextInput, Textarea } from "@/components/dashboard";

export const metadata = {
  title: "Homepage | CMS | Admin | Niat Murni",
};

export default async function AdminCmsHomepagePage() {
  let settings: Awaited<ReturnType<typeof getHomepageSettings>> | null = null;
  try {
    settings = await getHomepageSettings();
  } catch {
    // fallback to defaults
  }
  const s = settings ?? undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Homepage</h1>
        <p className="mt-1 text-sm text-gray-500">Edit homepage content (Laravel CMS API)</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <FormSection>
          <div>
            <FormLabel>Site name</FormLabel>
            <TextInput defaultValue={s?.siteName ?? ""} placeholder="Niat Murni Academy" readOnly className="mt-1" />
          </div>
          <div>
            <FormLabel>Hero headline</FormLabel>
            <TextInput defaultValue={s?.hero?.headline ?? ""} placeholder="Headline" readOnly className="mt-1" />
          </div>
          <div>
            <FormLabel>Hero subheadline</FormLabel>
            <Textarea defaultValue={s?.hero?.subheadline ?? ""} placeholder="Subheadline" readOnly rows={2} className="mt-1" />
          </div>
          <p className="text-xs text-gray-500">Save is handled by Laravel admin API (POST /admin/homepage-settings). Wire form submit in client component.</p>
        </FormSection>
      </div>
    </div>
  );
}
