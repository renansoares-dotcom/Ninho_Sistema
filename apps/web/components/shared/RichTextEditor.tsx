"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  Link2,
  Quote,
  Code,
  Heading2,
} from "lucide-react";

function BotaoToolbar({
  ativo,
  onClick,
  title,
  children,
}: {
  ativo?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
        ativo ? "bg-[#eaf1fb] text-primary" : "text-[#767c88] hover:bg-[#f5f6f8]"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    // Evita erro de hidratação do Next.js — o editor só monta no cliente.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2] } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline underline-offset-2" },
      }),
      Placeholder.configure({ placeholder: placeholder || "Detalhes, contexto, critérios de conclusão..." }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose-editor min-h-[110px] max-h-[320px] overflow-y-auto text-[13px] text-[#16181d] outline-none px-3 py-2.5",
      },
    },
  });

  if (!editor) {
    return <div className="min-h-[110px] border border-[#e4e6ea] rounded-lg animate-pulse bg-[#f7f8fa]" />;
  }

  function definirLink() {
    const urlAnterior = editor?.getAttributes("link").href;
    const url = window.prompt("Link (cole a URL):", urlAnterior || "https://");
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().unsetLink().run();
      return;
    }
    editor?.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className="border border-[#e4e6ea] rounded-lg overflow-hidden focus-within:border-primary transition-colors">
      <div className="flex items-center gap-0.5 px-1.5 py-1 border-b border-[#eef0f2] bg-[#fafbfc] flex-wrap">
        <BotaoToolbar title="Negrito" ativo={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={13} />
        </BotaoToolbar>
        <BotaoToolbar title="Itálico" ativo={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={13} />
        </BotaoToolbar>
        <BotaoToolbar title="Tachado" ativo={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={13} />
        </BotaoToolbar>
        <div className="w-px h-4 bg-[#e4e6ea] mx-1" />
        <BotaoToolbar title="Título" ativo={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={13} />
        </BotaoToolbar>
        <BotaoToolbar title="Lista" ativo={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={13} />
        </BotaoToolbar>
        <BotaoToolbar title="Lista numerada" ativo={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={13} />
        </BotaoToolbar>
        <BotaoToolbar title="Checklist" ativo={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
          <CheckSquare size={13} />
        </BotaoToolbar>
        <div className="w-px h-4 bg-[#e4e6ea] mx-1" />
        <BotaoToolbar title="Citação" ativo={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={13} />
        </BotaoToolbar>
        <BotaoToolbar title="Código" ativo={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code size={13} />
        </BotaoToolbar>
        <BotaoToolbar title="Link" ativo={editor.isActive("link")} onClick={definirLink}>
          <Link2 size={13} />
        </BotaoToolbar>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
