"use client";

import { useEffect, type RefObject } from "react";
import { useEditor, EditorContent, Node, mergeAttributes, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Undo,
  Redo,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  Type,
} from "lucide-react";

import { cx } from "@/lib/utils";

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

interface BlockEditorProps {
  content: string;
  onChange: (html: string) => void;
  onOpenMediaPicker: () => void;
  onOpenVideoPicker: () => void;
  placeholder?: string;
  editorRef?: RefObject<Editor | null>;
}

// ─── Custom YouTube embed node ───────────────────────────────────────────────

const YoutubeEmbed = Node.create({
  name: "youtubeEmbed",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      width: { default: 640 },
      height: { default: 360 },
    };
  },
  parseHTML() {
    return [
      {
        tag: "div[data-youtube-embed]",
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          return {
            src: el.getAttribute("data-src"),
            width: Number(el.getAttribute("data-width")) || 640,
            height: Number(el.getAttribute("data-height")) || 360,
          };
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-youtube-embed": "",
        "data-src": HTMLAttributes.src,
        "data-width": String(HTMLAttributes.width),
        "data-height": String(HTMLAttributes.height),
        class: "my-4 aspect-video w-full overflow-hidden rounded-xl",
      }),
      [
        "iframe",
        {
          src: HTMLAttributes.src,
          width: "100%",
          height: "100%",
          frameborder: "0",
          allowfullscreen: "",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          class: "aspect-video w-full rounded-xl",
        },
      ],
    ];
  },
  addNodeView() {
    return ({ node }) => {
      const div = document.createElement("div");
      div.className = "my-4 aspect-video w-full overflow-hidden rounded-xl";
      const iframe = document.createElement("iframe");
      iframe.src = node.attrs.src as string;
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.frameBorder = "0";
      iframe.allowFullscreen = true;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.className = "aspect-video w-full rounded-xl";
      div.appendChild(iframe);
      return { dom: div };
    };
  },
});

// ─── Custom Video node (for uploaded videos) ─────────────────────────────────

const VideoNode = Node.create({
  name: "videoNode",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
      controls: { default: true },
    };
  },
  parseHTML() {
    return [
      {
        tag: "video[data-video-node]",
        getAttrs: (dom) => {
          const el = dom as HTMLVideoElement;
          return {
            src: el.getAttribute("src"),
            poster: el.getAttribute("poster"),
            controls: el.hasAttribute("controls"),
          };
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, {
        "data-video-node": "",
        controls: "",
        class: "my-4 w-full rounded-xl max-h-[500px]",
      }),
    ];
  },
  addNodeView() {
    return ({ node }) => {
      const video = document.createElement("video");
      video.src = node.attrs.src as string;
      video.controls = true;
      video.className = "my-4 w-full rounded-xl max-h-[500px]";
      if (node.attrs.poster) video.poster = node.attrs.poster as string;
      return { dom: video };
    };
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getYoutubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  return null;
}

const FONT_SIZES = [
  { label: "Pequeño", value: "0.85em" },
  { label: "Normal", value: "1em" },
  { label: "Grande", value: "1.25em" },
  { label: "Muy grande", value: "1.5em" },
  { label: "Extra grande", value: "2em" },
];

// ─── Toolbar components ──────────────────────────────────────────────────────

function ToolbarButton(props: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      title={props.title}
      className={cx(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors",
        "hover:bg-surface-subtle hover:text-text-primary",
        props.isActive && "bg-brand-primary/10 text-brand-primary",
        props.disabled && "opacity-40 cursor-not-allowed",
      )}
    >
      {props.children}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="mx-1 h-5 w-px bg-border-soft" />;
}

// ─── Main component ──────────────────────────────────────────────────────────

export function BlockEditor({ content, onChange, onOpenMediaPicker, onOpenVideoPicker, placeholder, editorRef }: BlockEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        protocols: ["http", "https", "mailto"],
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          class: "underline text-brand-primary hover:text-brand-primaryHover",
        },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full h-auto" },
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Escribe el contenido del post...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      YoutubeEmbed,
      VideoNode,
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose max-w-none min-h-[300px] px-4 py-3 focus:outline-none prose-a:underline prose-a:text-brand-primary prose-img:cursor-nwse-resize prose-img:hover:outline prose-img:hover:outline-2 prose-img:hover:outline-brand-primary/50 prose-img:hover:outline-offset-2",
      },
    },
  });

  // Expose editor instance to parent
  useEffect(() => {
    if (editorRef && editor) {
      (editorRef as React.MutableRefObject<Editor | null>).current = editor;
    }
    return () => {
      if (editorRef) {
        (editorRef as React.MutableRefObject<Editor | null>).current = null;
      }
    };
  }, [editor, editorRef]);

  if (!editor) return null;

  // ─── Handlers ────────────────────────────────────────────────────────────

  function handleAddLink() {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del enlace (incluye https://):", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const finalUrl = /^(https?|mailto):\/\//.test(url) ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: finalUrl }).run();
  }

  function handleUnlink() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  }

  function handleAddYoutube() {
    const url = window.prompt("URL del video de YouTube:");
    if (!url) return;
    const embedUrl = getYoutubeEmbedUrl(url);
    if (!embedUrl) {
      window.alert("URL de YouTube no válida.");
      return;
    }
    editor.chain().focus().insertContent({ type: "youtubeEmbed", attrs: { src: embedUrl } }).run();
  }

  function handleFontSize(size: string) {
    editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
  }

  function handleHorizontalRule() {
    editor.chain().focus().setHorizontalRule().run();
  }

  function handleImageResize(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      const startWidth = target.offsetWidth;
      const startX = e.clientX;

      function onMouseMove(ev: MouseEvent) {
        const newWidth = Math.max(100, startWidth + (ev.clientX - startX));
        target.style.width = `${newWidth}px`;
        target.style.maxWidth = "100%";
        // Update the editor content to persist the change
        onChange(editor.getHTML());
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="overflow-hidden rounded-xl border border-border-soft bg-surface-canvas">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border-soft bg-surface-subtle px-3 py-2">
        {/* Text style */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Negrita"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Cursiva"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Subrayado"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Font size */}
        <select
          onChange={(e) => handleFontSize(e.target.value)}
          className="h-8 rounded-md border border-border-soft bg-surface-canvas px-2 text-caption text-text-secondary"
          title="Tamaño de texto"
        >
          <option value="">Tamaño</option>
          {FONT_SIZES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <ToolbarSeparator />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Lista"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Lista ordenada"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Cita"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Código"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Alinear izquierda"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Centrar"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Alinear derecha"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          isActive={editor.isActive({ textAlign: "justify" })}
          title="Justificar"
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Links */}
        <ToolbarButton
          onClick={handleAddLink}
          isActive={editor.isActive("link")}
          title="Enlace"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleUnlink}
          disabled={!editor.isActive("link")}
          title="Quitar enlace"
        >
          <Unlink className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Media */}
        <ToolbarButton onClick={onOpenMediaPicker} title="Insertar imagen">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={onOpenVideoPicker} title="Insertar video">
          <Video className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={handleAddYoutube} title="Video de YouTube">
          <YoutubeIcon className="h-4 w-4 text-red-600" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton onClick={handleHorizontalRule} title="Línea horizontal">
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Deshacer"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Rehacer"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor with resize CSS */}
      <style>{`
        .ProseMirror img { cursor: nwse-resize; transition: outline 0.15s; }
        .ProseMirror img:hover { outline: 2px solid rgba(var(--color-brand-primary-rgb, 11 93 30), 0.5); outline-offset: 2px; }
        .ProseMirror img::after { content: ''; position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; background: linear-gradient(135deg, transparent 50%, currentColor 50%); opacity: 0.4; }
      `}</style>
      <div onMouseDown={handleImageResize}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export function insertImageToEditor(editor: Editor | null, url: string) {
  if (editor && url) {
    editor.chain().focus().setImage({ src: url }).run();
  }
}

export function insertVideoToEditor(editor: Editor | null, url: string, poster?: string) {
  if (editor && url) {
    editor.chain().focus().insertContent({
      type: "videoNode",
      attrs: { src: url, poster: poster ?? null },
    }).run();
  }
}
