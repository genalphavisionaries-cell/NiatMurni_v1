"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";
import { FormLabel } from "@/components/dashboard";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
  error?: string;
};

export function CmsRichTextField({ label, value, onChange, placeholder, minHeight = "140px", disabled, error }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: value || "",
    editable: !disabled,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none px-3 py-2 focus:outline-none",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold"
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (editor.isFocused) return;
    const next = value || "";
    const cur = editor.getHTML();
    if (cur === next || (next === "" && (cur === "<p></p>" || cur === ""))) return;
    editor.commands.setContent(next || "<p></p>", { emitUpdate: false });
  }, [value, editor]);

  if (!editor) {
    return (
      <div>
        <FormLabel>{label}</FormLabel>
        <div className="mt-1 rounded-lg border border-[var(--border)] bg-gray-50 px-3 py-8 text-center text-sm text-gray-500">Loading editor…</div>
      </div>
    );
  }

  return (
    <div>
      <FormLabel>{label}</FormLabel>
      {error ? <p className="mt-0.5 text-xs text-red-600">{error}</p> : null}
      <div className={cn("mt-1 overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-sm", error && "border-red-300")}>
        <div className="flex flex-wrap gap-1 border-b border-gray-100 bg-gray-50 px-2 py-1.5">
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            disabled={disabled}
            label="Bold"
          >
            B
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            disabled={disabled}
            label="Italic"
          >
            <span className="italic">I</span>
          </ToolbarBtn>
          <span className="mx-1 w-px self-stretch bg-gray-200" />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} disabled={disabled} label="H1">
            H1
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} disabled={disabled} label="H2">
            H2
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} disabled={disabled} label="H3">
            H3
          </ToolbarBtn>
          <span className="mx-1 w-px self-stretch bg-gray-200" />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} disabled={disabled} label="Bullet list">
            • List
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} disabled={disabled} label="Numbered list">
            1. List
          </ToolbarBtn>
          <span className="mx-1 w-px self-stretch bg-gray-200" />
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} disabled={disabled} label="Align left">
            Left
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} disabled={disabled} label="Align center">
            Center
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} disabled={disabled} label="Align right">
            Right
          </ToolbarBtn>
        </div>
        <div style={{ minHeight }} className="[&_.ProseMirror]:min-h-[inherit]">
          <EditorContent editor={editor} className="min-h-[inherit]" />
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  active,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "rounded px-2 py-1 text-xs font-medium transition-colors",
        active ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:bg-gray-100",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {children}
    </button>
  );
}
