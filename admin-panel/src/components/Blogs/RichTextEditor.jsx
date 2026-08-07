import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import UnderlineExtension from '@tiptap/extension-underline';
import {
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Link as LinkIcon,
  Unlink as UnlinkIcon,
  Image as ImageIcon,
  RemoveFormatting,
  Undo as UndoIcon,
  Redo as RedoIcon
} from 'lucide-react';

const RichTextEditor = ({ value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      ImageExtension.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'blog-inline-image'
        }
      })
    ],
    content: value || '',
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
    }
  });

  // Sync external value changes (e.g., when editing loaded blog data)
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  if (!editor) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>Loading Editor...</div>;
  }

  // Heading dropdown value calculation
  const getHeadingValue = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    if (editor.isActive('blockquote')) return 'blockquote';
    return 'p';
  };

  const handleHeadingChange = (e) => {
    const val = e.target.value;
    if (val === 'p') {
      editor.chain().focus().setParagraph().run();
    } else if (val === 'h1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (val === 'h2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (val === 'h3') {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    } else if (val === 'blockquote') {
      editor.chain().focus().toggleBlockquote().run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter Hyperlink URL:', previousUrl || 'https://');

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  // Trigger local computer file selection
  const handleImageButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process selected local image file
  const handleLocalImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result;
        if (src) {
          editor.chain().focus().setImage({ src }).run();
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset file input value so same file can be selected again if needed
    e.target.value = '';
  };

  const clearFormatting = () => {
    editor.chain().focus().unsetAllMarks().clearNodes().run();
  };

  // Word & Character counter
  const textContent = editor.getText();
  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const charCount = textContent.length;

  return (
    <div 
      className="rich-text-editor-container" 
      style={{
        border: isFocused ? '2px solid #3B82F6' : '1px solid #D1D5DB',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#FFFFFF',
        boxShadow: isFocused ? '0 0 0 4px rgba(59, 130, 246, 0.12)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.15s ease'
      }}
    >
      {/* Hidden local image file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLocalImageSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Sleek Minimal Toolbar matching reference screenshot */}
      <div className="editor-toolbar" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        background: '#F9FAFB',
        borderBottom: '1px solid #E5E7EB'
      }}>
        
        {/* Heading Dropdown (Normal, Heading 1, Heading 2, Heading 3, Blockquote) */}
        <select
          value={getHeadingValue()}
          onChange={handleHeadingChange}
          style={{
            padding: '4px 28px 4px 10px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            background: '#FFFFFF',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            cursor: 'pointer',
            outline: 'none',
            height: '32px'
          }}
        >
          <option value="p">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="blockquote">Quote Callout</option>
        </select>

        <div style={dividerStyle} />

        {/* Text Styling: B, I, U */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={buttonStyle(editor.isActive('bold'))}
          title="Bold (Ctrl+B)"
        >
          <span style={{ fontWeight: '800', fontSize: '15px', fontFamily: 'serif' }}>B</span>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={buttonStyle(editor.isActive('italic'))}
          title="Italic (Ctrl+I)"
        >
          <span style={{ fontStyle: 'italic', fontWeight: '700', fontSize: '15px', fontFamily: 'serif' }}>I</span>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          style={buttonStyle(editor.isActive('underline'))}
          title="Underline (Ctrl+U)"
        >
          <span style={{ textDecoration: 'underline', fontWeight: '700', fontSize: '15px', fontFamily: 'serif' }}>U</span>
        </button>

        {/* Link Button */}
        <button
          type="button"
          onClick={setLink}
          style={buttonStyle(editor.isActive('link'))}
          title="Insert Hyperlink"
        >
          <LinkIcon size={16} />
        </button>

        {editor.isActive('link') && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            style={buttonStyle(false)}
            title="Remove Hyperlink"
          >
            <UnlinkIcon size={16} style={{ color: '#EF4444' }} />
          </button>
        )}

        <div style={dividerStyle} />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={buttonStyle(editor.isActive('bulletList'))}
          title="Bullet List"
        >
          <ListIcon size={17} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={buttonStyle(editor.isActive('orderedList'))}
          title="Numbered List"
        >
          <ListOrderedIcon size={17} />
        </button>

        {/* Local Computer Image Selection */}
        <button
          type="button"
          onClick={handleImageButtonClick}
          style={buttonStyle(false)}
          title="Select Image from Computer"
        >
          <ImageIcon size={17} />
        </button>

        <div style={dividerStyle} />

        {/* Clear Formatting Tx */}
        <button
          type="button"
          onClick={clearFormatting}
          style={buttonStyle(false)}
          title="Clear Formatting (Tx)"
        >
          <RemoveFormatting size={16} />
        </button>

        <div style={dividerStyle} />

        {/* Undo & Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          style={buttonStyle(false, !editor.can().undo())}
          title="Undo (Ctrl+Z)"
        >
          <UndoIcon size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          style={buttonStyle(false, !editor.can().redo())}
          title="Redo (Ctrl+Y)"
        >
          <RedoIcon size={16} />
        </button>

      </div>

      {/* Editor Content Area */}
      <div 
        style={{ padding: '20px 24px', minHeight: '380px', cursor: 'text' }} 
        onClick={() => editor.chain().focus().run()}
      >
        <style>{`
          .tiptap {
            outline: none;
            min-height: 350px;
            font-size: 16px;
            line-height: 1.7;
            color: #374151;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          .tiptap p {
            margin-bottom: 1.125rem;
          }
          .tiptap h1 {
            font-size: 2rem;
            font-weight: 800;
            color: #111827;
            margin-top: 2rem;
            margin-bottom: 1rem;
            line-height: 1.25;
          }
          .tiptap h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #111827;
            margin-top: 1.75rem;
            margin-bottom: 0.875rem;
            line-height: 1.3;
          }
          .tiptap h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: #111827;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            line-height: 1.35;
          }
          .tiptap ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin-bottom: 1.25rem;
          }
          .tiptap ol {
            list-style-type: decimal;
            padding-left: 1.5rem;
            margin-bottom: 1.25rem;
          }
          .tiptap li {
            margin-bottom: 0.375rem;
          }
          .tiptap blockquote {
            border-left: 4px solid #3B82F6;
            background: #EFF6FF;
            padding: 14px 20px;
            border-radius: 8px;
            margin: 1.5rem 0;
            color: #1F2937;
            font-weight: 500;
          }
          .tiptap a {
            color: #2563EB;
            text-decoration: underline;
            font-weight: 500;
          }
          .tiptap img {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            margin: 1.5rem 0;
            display: block;
          }
          .tiptap p.is-editor-empty:first-child::before {
            color: #9CA3AF;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>

      {/* Footer Word Count */}
      <div style={{
        padding: '8px 16px',
        background: '#F9FAFB',
        borderTop: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        fontSize: '12px',
        color: '#6B7280',
        fontWeight: '500'
      }}>
        <span>📁 Click image icon to select & insert any image from your computer.</span>
        <span>
          {wordCount} words · {charCount} characters
        </span>
      </div>
    </div>
  );
};

// Sleek Button Style matching screenshot
const buttonStyle = (isActive, isDisabled = false) => ({
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  border: 'none',
  background: isActive ? '#E5E7EB' : 'transparent',
  color: isActive ? '#111827' : isDisabled ? '#D1D5DB' : '#4B5563',
  cursor: isDisabled ? 'not-allowed' : 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justify: 'center',
  transition: 'all 0.15s ease'
});

const dividerStyle = {
  width: '1px',
  height: '18px',
  background: '#E5E7EB',
  margin: '0 4px'
};

export default RichTextEditor;
