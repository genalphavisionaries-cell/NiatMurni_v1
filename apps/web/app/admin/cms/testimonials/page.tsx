"use client";

import { useEffect, useState } from "react";
import { FormLabel, TextInput, Textarea } from "@/components/dashboard";
import { adminApi } from "@/lib/admin-api";
import type { CmsTestimonial } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import { CmsImageUploadField } from "@/components/admin/cms/CmsImageUploadField";

export default function AdminCmsTestimonialsPage() {
  const [items, setItems] = useState<CmsTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<CmsTestimonial> | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = () => {
    adminApi
      .getCmsTestimonials()
      .then((res) => setItems(res.data))
      .catch(() => setMessage({ type: "error", text: "Failed to load testimonials." }))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setMessage(null);
    try {
      if (editing.id) {
        const res = await adminApi.updateCmsTestimonial(editing.id, editing);
        setItems((prev) => prev.map((t) => (t.id === res.data.id ? res.data : t)));
      } else {
        const res = await adminApi.createCmsTestimonial({
          name: editing.name ?? "",
          image_url: editing.image_url ?? null,
          rating: editing.rating ?? 5,
          content: editing.content ?? "",
          is_active: editing.is_active ?? true,
          sort_order: editing.sort_order ?? 0,
        });
        setItems((prev) => [...prev, res.data]);
      }
      setEditing(null);
      setMessage({ type: "success", text: "Testimonial saved." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await adminApi.deleteCmsTestimonial(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
      setMessage({ type: "success", text: "Testimonial deleted." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Delete failed." });
    }
  };

  if (loading) return <div className="py-12 text-center text-sm text-gray-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Testimonials</h1>
          <p className="mt-1 text-sm text-gray-500">Manage customer testimonials shown on the homepage.</p>
        </div>
        <button
          onClick={() => setEditing({ name: "", content: "", rating: 5, is_active: true, sort_order: items.length })}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          + Add
        </button>
      </div>

      {message && (
        <div className={cn("rounded-lg px-4 py-3 text-sm", message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800")}>
          {message.text}
        </div>
      )}

      {/* Editor modal */}
      {editing && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">{editing.id ? "Edit" : "New"} Testimonial</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FormLabel>Name</FormLabel>
              <TextInput value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <FormLabel>Rating (1-5)</FormLabel>
              <TextInput type="number" min={1} max={5} value={editing.rating ?? 5} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} className="mt-1" />
            </div>
          </div>
          <div>
            <FormLabel>Content</FormLabel>
            <Textarea value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={3} className="mt-1" />
          </div>
          <CmsImageUploadField
            label="Photo"
            url={editing.image_url ?? ""}
            alt=""
            showAlt={false}
            onUrlChange={(v) => setEditing({ ...editing, image_url: v || null })}
            onAltChange={() => {}}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FormLabel>Sort order</FormLabel>
              <TextInput type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} className="mt-1" />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                Active
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setEditing(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Rating</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Active</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Order</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No testimonials yet.</td></tr>
            )}
            {items.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                <td className="px-4 py-3">{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</td>
                <td className="px-4 py-3">{t.is_active ? <span className="text-green-600">Yes</span> : <span className="text-gray-400">No</span>}</td>
                <td className="px-4 py-3 text-gray-500">{t.sort_order}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => setEditing(t)} className="text-slate-700 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
