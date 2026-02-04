import { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { EditorToolbar } from './EditorToolbar';
import { cn } from '@/shared/utils/cn';

interface JournalEditorProps {
  content: string;
  onChange: (content: string, plainText: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function JournalEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  readOnly = false,
  className,
  autoFocus = false
}: JournalEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      Image.configure({
        inline: false,
        allowBase64: true
      })
    ],
    content,
    editable: !readOnly,
    autofocus: autoFocus ? 'end' : false,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-neutral dark:prose-invert max-w-none',
          'focus:outline-none',
          className
        )
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      onChange(html, text);
    }
  });

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && editor) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          editor.chain().focus().setImage({ src: base64 }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [editor]);

  if (!editor) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded mb-4" />
        <div className="h-48 bg-neutral-100 dark:bg-neutral-800 rounded" />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {!readOnly && (
        <EditorToolbar editor={editor} onImageUpload={handleImageUpload} />
      )}
      <div
        className={cn(
          'flex-1 overflow-y-auto',
          'bg-white dark:bg-neutral-800',
          'rounded-lg border border-neutral-200 dark:border-neutral-700',
          !readOnly && 'border-t-0 rounded-t-none'
        )}
      >
        <EditorContent editor={editor} className="min-h-[200px]" />
      </div>
    </div>
  );
}
