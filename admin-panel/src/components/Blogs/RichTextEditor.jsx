import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import UnderlineExtension from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import {
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Link as LinkIcon,
  Unlink as UnlinkIcon,
  Image as ImageIcon,
  RemoveFormatting,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Table as TableIcon,
  Plus,
  Trash2,
  Split,
  ChevronDown,
  Grid,
  Code as CodeIcon,
  Sparkles,
  Eye
} from 'lucide-react';

/* ── Smart Converter: Converts Markdown / Text with Links & Tables to Clean HTML ── */
export function convertTextOrMarkdownToHtml(rawText) {
  if (!rawText || !rawText.trim()) return '';

  let text = rawText.trim();

  // If already rich multi-element HTML (with tags and structure) and NOT markdown
  if (/^<[a-z1-6]+[\s\S]*<\/[a-z1-6]+>$/i.test(text) && text.includes('<h') && text.includes('<p') && !text.includes('##') && !text.includes('| --- |')) {
    return text;
  }

  // Remove top metadata banner if user copied everything from the txt file
  if (text.includes('BLOG CONTENT') || text.includes('====================')) {
    const splitIndex = text.indexOf('BLOG CONTENT');
    if (splitIndex !== -1) {
      text = text.substring(splitIndex).replace(/BLOG CONTENT[^\n]*\n[=\s]*/i, '').trim();
    } else {
      text = text.replace(/^(Title|Slug|Meta Title|Meta Description|Author|Published Date|Last updated|URL):[^\n]*\n?/gim, '').trim();
      text = text.replace(/^={3,}[^\n]*\n?/gm, '').trim();
    }
  }

  // Pre-process markdown links: [Text](URL) -> <a href="URL" target="_blank" rel="noopener noreferrer">Text</a>
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Pre-process bold & italic
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  const rawLines = text.split(/\r?\n/);
  const outputHtmlParts = [];

  let i = 0;
  while (i < rawLines.length) {
    let line = rawLines[i].trim();

    // Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // Divider line
    if (/^={3,}$/.test(line) || /^-{3,}$/.test(line) || line === '***') {
      outputHtmlParts.push('<hr />');
      i++;
      continue;
    }

    // 1. Table Detection
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith('|') && rawLines[i].trim().endsWith('|')) {
        tableLines.push(rawLines[i].trim());
        i++;
      }

      if (tableLines.length >= 2 && tableLines.some((l) => l.includes('---'))) {
        const parseRow = (rowLine) => rowLine.slice(1, -1).split('|').map((c) => c.trim());
        const headerCells = parseRow(tableLines[0]);
        const dataRows = tableLines.slice(1).filter((l) => !l.includes('---'));

        const theadHtml = `<thead><tr>${headerCells.map((c) => `<th>${c}</th>`).join('')}</tr></thead>`;
        const tbodyHtml = `<tbody>${dataRows.map((r) => `<tr>${parseRow(r).map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`;

        outputHtmlParts.push(`<table class="blog-content-table">${theadHtml}${tbodyHtml}</table>`);
        continue;
      } else {
        outputHtmlParts.push(`<p>${tableLines.join('<br />')}</p>`);
        continue;
      }
    }

    // 2. FAQ Questions (e.g. "### Q1: ...", "Q1: ...")
    const faqMatch = line.match(/^(###?\s*)?(Q\d+[:\.\-]\s*|\d+[\.\)]\s+)(.*)/i);
    if (faqMatch && /^(Q\d+|Is |Can |Do |How |What )/i.test(faqMatch[2] + faqMatch[3])) {
      const qText = (faqMatch[2] + faqMatch[3]).trim();
      i++;
      const ansLines = [];
      while (
        i < rawLines.length && 
        rawLines[i].trim() && 
        !/^###?\s*(Q\d+|##|\d+[\.\)])/i.test(rawLines[i].trim()) &&
        !rawLines[i].trim().startsWith('|')
      ) {
        ansLines.push(rawLines[i].trim());
        i++;
      }
      const ansHtml = ansLines.length ? `<p>${ansLines.join(' ')}</p>` : '';
      outputHtmlParts.push(`<h3>${qText}</h3>${ansHtml}`);
      continue;
    }

    // 3. Markdown Headings (e.g. # Heading, ## Heading, ### Heading)
    if (/^#{1,6}\s+/.test(line)) {
      const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
      if (headingMatch) {
        const level = headingMatch[1].length === 1 ? 'h1' : headingMatch[1].length === 2 ? 'h2' : 'h3';
        outputHtmlParts.push(`<${level}>${headingMatch[2].trim()}</${level}>`);
        i++;
        continue;
      }
    }

    // 4. Known Standalone Section Headings
    const standaloneHeadingMatch =
      line.length < 80 &&
      !line.endsWith('.') &&
      !line.endsWith(',') &&
      !line.endsWith(':') &&
      /^(quick answer|why is|should you|full stack vs|common mistakes|career opportunities|salary expectations|is full stack|frequently asked|final thoughts|ready to start|skills employers|the learning journey|is it right)/i.test(line);

    if (standaloneHeadingMatch) {
      outputHtmlParts.push(`<h2>${line}</h2>`);
      i++;
      continue;
    }

    // 5. Blockquotes / Key Takeaways / Quotes
    const takeawayMatch = line.match(/^([>💡\s]*)?(key takeaway|takeaway|summary|pro tip|important|note|highlights|conclusion)[:\-]?\s*(.*)/i);
    if (takeawayMatch) {
      const takeawayText = takeawayMatch[3] ? `<strong>Key Takeaway:</strong> ${takeawayMatch[3]}` : line.replace(/^[>💡\s]+/, '');
      outputHtmlParts.push(`<blockquote>💡 ${takeawayText}</blockquote>`);
      i++;
      continue;
    }

    if (line.startsWith('> ')) {
      const quoteText = line.replace(/^>\s*/, '').trim();
      outputHtmlParts.push(`<blockquote>${quoteText}</blockquote>`);
      i++;
      continue;
    }

    // 6. Bullet Lists (•, -, *, ->)
    const bulletRegex = /^([•\-\*]|->)\s+/;
    if (bulletRegex.test(line)) {
      const listItems = [];
      while (i < rawLines.length && bulletRegex.test(rawLines[i].trim())) {
        listItems.push(`<li>${rawLines[i].trim().replace(bulletRegex, '')}</li>`);
        i++;
      }
      outputHtmlParts.push(`<ul>${listItems.join('')}</ul>`);
      continue;
    }

    // 7. Numbered Lists (1., 2., etc.)
    const numRegex = /^\d+[\.\)]\s+/;
    if (numRegex.test(line)) {
      const listItems = [];
      while (i < rawLines.length && numRegex.test(rawLines[i].trim())) {
        listItems.push(`<li>${rawLines[i].trim().replace(numRegex, '')}</li>`);
        i++;
      }
      outputHtmlParts.push(`<ol>${listItems.join('')}</ol>`);
      continue;
    }

    // 8. Callout links / CTA lines with 👉
    if (line.startsWith('👉')) {
      outputHtmlParts.push(`<p>${line}</p>`);
      i++;
      continue;
    }

    // 9. Standard Paragraphs
    const pLines = [line];
    i++;
    while (
      i < rawLines.length &&
      rawLines[i].trim() &&
      !/^#{1,6}\s+/.test(rawLines[i].trim()) &&
      !bulletRegex.test(rawLines[i].trim()) &&
      !numRegex.test(rawLines[i].trim()) &&
      !rawLines[i].trim().startsWith('|') &&
      !rawLines[i].trim().startsWith('>') &&
      !rawLines[i].trim().startsWith('👉') &&
      !/^(key takeaway|💡)/i.test(rawLines[i].trim())
    ) {
      pLines.push(rawLines[i].trim());
      i++;
    }

    outputHtmlParts.push(`<p>${pLines.join(' ')}</p>`);
  }

  return outputHtmlParts.join('\n');
}

const RichTextEditor = ({ value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlSource, setHtmlSource] = useState(value || '');
  const [customRows, setCustomRows] = useState(3);
  const [customCols, setCustomCols] = useState(3);
  const fileInputRef = useRef(null);
  const tableMenuRef = useRef(null);
  const editorRef = useRef(null);

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
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'blog-content-table'
        }
      }),
      TableRow,
      TableHeader,
      TableCell
    ],
    content: value || '',
    editorProps: {
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        if (!text || !text.trim()) return false;

        // Detect if pasted text has Markdown, HTML, Headings, Tables, Lists or Links
        const hasMarkdownOrHtml = 
          /<[a-z][\s\S]*>/i.test(text) ||
          text.includes('| --- |') ||
          text.includes('| ---') ||
          /\[.+\]\(.+\)/.test(text) ||
          /^(#{1,6}|•|-|\*|\d+\.)\s+/m.test(text) ||
          /key takeaway/i.test(text) ||
          text.includes('Quick Answer') ||
          text.includes('## ');

        if (hasMarkdownOrHtml) {
          event.preventDefault();
          const parsedHtml = convertTextOrMarkdownToHtml(text);

          if (editorRef.current) {
            editorRef.current.commands.setContent(parsedHtml, false);
          } else {
            view.dispatch(view.state.tr.scrollIntoView());
          }
          return true;
        }
        return false;
      }
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlSource(html);
      if (onChange) {
        onChange(html);
      }
    }
  });

  // Keep editorRef updated
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Sync external value changes
  useEffect(() => {
    if (value !== undefined) {
      setHtmlSource(value || '');
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value || '', false);
      }
    }
  }, [value, editor]);

  // Handle switching HTML Source Mode
  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      // Switching from HTML to Visual
      if (editor) {
        editor.commands.setContent(htmlSource || '', false);
      }
      if (onChange) {
        onChange(htmlSource);
      }
      setIsHtmlMode(false);
    } else {
      // Switching from Visual to HTML
      if (editor) {
        setHtmlSource(editor.getHTML());
      }
      setIsHtmlMode(true);
    }
  };

  const handleHtmlSourceChange = (e) => {
    const newHtml = e.target.value;
    setHtmlSource(newHtml);
    if (onChange) {
      onChange(newHtml);
    }
  };

  // Magic Format current content
  const handleAutoFormat = () => {
    const currentText = isHtmlMode ? htmlSource : (editor?.getHTML() || '');
    const formatted = convertTextOrMarkdownToHtml(currentText);
    setHtmlSource(formatted);
    if (editor) {
      editor.commands.setContent(formatted, false);
    }
    if (onChange) {
      onChange(formatted);
    }
  };

  // Close table dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableMenuRef.current && !tableMenuRef.current.contains(event.target)) {
        setIsTableMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!editor) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>Loading Editor...</div>;
  }

  const isTableActive = editor.isActive('table');

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

  const insertTable = (rows = 3, cols = 3) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setIsTableMenuOpen(false);
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
        border: isFocused ? '2px solid #7143FE' : '1px solid #D1D5DB',
        borderRadius: '12px',
        overflow: 'visible',
        background: '#FFFFFF',
        boxShadow: isFocused ? '0 0 0 4px rgba(113, 67, 254, 0.12)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.15s ease',
        position: 'relative'
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

      {/* Main Toolbar */}
      <div className="editor-toolbar" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        background: '#F9FAFB',
        borderBottom: '1px solid #E5E7EB',
        borderTopLeftRadius: '11px',
        borderTopRightRadius: '11px'
      }}>
        
        {/* Heading Dropdown */}
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
          <option value="p">Normal Text</option>
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

        {/* Table Menu Dropdown Trigger */}
        <div style={{ position: 'relative' }} ref={tableMenuRef}>
          <button
            type="button"
            onClick={() => setIsTableMenuOpen((prev) => !prev)}
            style={{
              ...buttonStyle(isTableActive || isTableMenuOpen),
              width: 'auto',
              padding: '0 8px',
              gap: '4px',
              fontWeight: '600',
              fontSize: '13px',
              background: isTableActive ? '#EDE9FE' : isTableMenuOpen ? '#F3F4F6' : 'transparent',
              color: isTableActive ? '#7143FE' : '#374151',
              border: isTableActive ? '1px solid #C4B5FD' : '1px solid transparent'
            }}
            title="Insert or Manage Table"
          >
            <TableIcon size={16} />
            <span>Table</span>
            <ChevronDown size={12} style={{ opacity: 0.7 }} />
          </button>

          {/* Table Popover Menu */}
          {isTableMenuOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 100,
              background: '#FFFFFF',
              borderRadius: '10px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E2E8F0',
              padding: '14px',
              minWidth: '260px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              
              {/* Table Insertion Section */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Insert New Table
                </div>
                
                {/* Preset quick buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
                  {[
                    { r: 2, c: 2, label: '2 × 2' },
                    { r: 3, c: 3, label: '3 × 3' },
                    { r: 4, c: 4, label: '4 × 4' }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => insertTable(preset.r, preset.c)}
                      style={{
                        padding: '6px 8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#475569',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#EDE9FE';
                        e.currentTarget.style.color = '#7143FE';
                        e.currentTarget.style.borderColor = '#C4B5FD';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F8FAFC';
                        e.currentTarget.style.color = '#475569';
                        e.currentTarget.style.borderColor = '#E2E8F0';
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom rows/cols input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>Rows:</span>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={customRows}
                      onChange={(e) => setCustomRows(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        fontSize: '12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                  <span style={{ color: '#94A3B8', fontWeight: 'bold' }}>×</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>Cols:</span>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={customCols}
                      onChange={(e) => setCustomCols(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        fontSize: '12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => insertTable(customRows, customCols)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    background: 'linear-gradient(135deg, #7143FE 0%, #8B5CF6 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={14} /> Insert Table ({customRows}×{customCols})
                </button>
              </div>

              {/* Inside-table operations (when a table is active) */}
              {isTableActive && (
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Active Table Operations
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().addRowBefore().run()}
                      style={tableMenuItemStyle}
                    >
                      <Plus size={13} style={{ color: '#10B981' }} /> Add Row Above
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().addRowAfter().run()}
                      style={tableMenuItemStyle}
                    >
                      <Plus size={13} style={{ color: '#10B981' }} /> Add Row Below
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().deleteRow().run()}
                      style={tableMenuItemStyle}
                    >
                      <Trash2 size={13} style={{ color: '#F43F5E' }} /> Delete Current Row
                    </button>

                    <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().addColumnBefore().run()}
                      style={tableMenuItemStyle}
                    >
                      <Plus size={13} style={{ color: '#3B82F6' }} /> Add Column Left
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().addColumnAfter().run()}
                      style={tableMenuItemStyle}
                    >
                      <Plus size={13} style={{ color: '#3B82F6' }} /> Add Column Right
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().deleteColumn().run()}
                      style={tableMenuItemStyle}
                    >
                      <Trash2 size={13} style={{ color: '#F43F5E' }} /> Delete Current Column
                    </button>

                    <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().mergeOrSplit().run()}
                      style={tableMenuItemStyle}
                    >
                      <Split size={13} style={{ color: '#7143FE' }} /> Merge / Split Selected Cells
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                      style={tableMenuItemStyle}
                    >
                      <Grid size={13} style={{ color: '#6366F1' }} /> Toggle Header Row
                    </button>

                    <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />

                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().deleteTable().run();
                        setIsTableMenuOpen(false);
                      }}
                      style={{
                        ...tableMenuItemStyle,
                        color: '#EF4444',
                        background: '#FEF2F2'
                      }}
                    >
                      <Trash2 size={13} /> Delete Entire Table
                    </button>
                  </div>
                </div>
              )}

              {/* Paste helper note */}
              <div style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.4', background: '#F8FAFC', padding: '6px 8px', borderRadius: '6px' }}>
                📋 Tip: You can also copy any table from Excel, Google Sheets, or web and paste it here directly!
              </div>

            </div>
          )}
        </div>

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

        <div style={dividerStyle} />

        {/* Auto Format Magic Button */}
        <button
          type="button"
          onClick={handleAutoFormat}
          style={{
            ...buttonStyle(false),
            width: 'auto',
            padding: '0 10px',
            gap: '5px',
            fontWeight: '600',
            fontSize: '12px',
            color: '#7143FE',
            background: '#F0EBFF',
            borderRadius: '6px'
          }}
          title="Auto-format plain text or markdown to rich headings, tables, links & blockquotes"
        >
          <Sparkles size={14} style={{ color: '#7143FE' }} />
          <span>Auto Format</span>
        </button>

        {/* HTML / Source Code View Toggle Button */}
        <button
          type="button"
          onClick={toggleHtmlMode}
          style={{
            ...buttonStyle(isHtmlMode),
            width: 'auto',
            padding: '0 10px',
            gap: '5px',
            fontWeight: '600',
            fontSize: '12px',
            color: isHtmlMode ? '#FFFFFF' : '#374151',
            background: isHtmlMode ? '#1E293B' : '#E5E7EB',
            borderRadius: '6px'
          }}
          title="Toggle HTML Source Code View"
        >
          {isHtmlMode ? <Eye size={14} /> : <CodeIcon size={14} />}
          <span>{isHtmlMode ? 'Visual Editor' : '</> HTML Source'}</span>
        </button>

      </div>

      {/* HTML Source Code Mode Textarea */}
      {isHtmlMode ? (
        <div style={{ padding: '16px', background: '#0F172A', minHeight: '380px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: '#94A3B8', fontSize: '12px' }}>
            <span>💻 <strong>HTML Source Mode:</strong> Paste your formatted HTML code here directly. Switch back to Visual Editor anytime.</span>
            <button
              type="button"
              onClick={toggleHtmlMode}
              style={{
                background: '#7143FE',
                color: '#FFF',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ✓ Apply & Switch to Visual
            </button>
          </div>
          <textarea
            value={htmlSource}
            onChange={handleHtmlSourceChange}
            placeholder="<h2>Enter HTML content here...</h2>"
            style={{
              width: '100%',
              minHeight: '350px',
              padding: '14px',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '13px',
              lineHeight: '1.6',
              color: '#F8FAFC',
              background: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '8px',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>
      ) : (
        <>
          {/* Contextual Active Table Bar (shown only when cursor is inside a table) */}
          {isTableActive && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#F5F3FF',
              borderBottom: '1px solid #DDD6FE',
              fontSize: '12px'
            }}>
              <span style={{ fontWeight: '700', color: '#6D28D9', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
                <TableIcon size={14} /> Table Tools:
              </span>

              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                style={contextTableBtnStyle}
                title="Add row below"
              >
                <Plus size={12} style={{ color: '#10B981' }} /> Row Below
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                style={contextTableBtnStyle}
                title="Delete current row"
              >
                <Trash2 size={12} style={{ color: '#F43F5E' }} /> Del Row
              </button>

              <div style={{ width: '1px', height: '14px', background: '#DDD6FE', margin: '0 2px' }} />

              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                style={contextTableBtnStyle}
                title="Add column right"
              >
                <Plus size={12} style={{ color: '#3B82F6' }} /> Col Right
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                style={contextTableBtnStyle}
                title="Delete current column"
              >
                <Trash2 size={12} style={{ color: '#F43F5E' }} /> Del Col
              </button>

              <div style={{ width: '1px', height: '14px', background: '#DDD6FE', margin: '0 2px' }} />

              <button
                type="button"
                onClick={() => editor.chain().focus().mergeOrSplit().run()}
                style={contextTableBtnStyle}
                title="Merge or Split cells"
              >
                <Split size={12} style={{ color: '#7143FE' }} /> Merge/Split
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                style={contextTableBtnStyle}
                title="Toggle header row"
              >
                <Grid size={12} style={{ color: '#6366F1' }} /> Header
              </button>

              <div style={{ width: '1px', height: '14px', background: '#DDD6FE', margin: '0 2px' }} />

              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                style={{
                  ...contextTableBtnStyle,
                  color: '#DC2626',
                  background: '#FEE2E2',
                  borderColor: '#FECACA'
                }}
                title="Delete entire table"
              >
                <Trash2 size={12} /> Delete Table
              </button>
            </div>
          )}

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
            border-left: 4px solid #7143FE;
            background: #F5F3FF;
            padding: 14px 20px;
            border-radius: 8px;
            margin: 1.5rem 0;
            color: #4C1D95;
            font-weight: 500;
          }
          .tiptap a {
            color: #7143FE;
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

          /* TipTap Table Styles */
          .tiptap table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
            margin: 1.5rem 0;
            overflow: hidden;
            border-radius: 8px;
            border: 1px solid #CBD5E1;
            background: #FFFFFF;
          }
          .tiptap table td,
          .tiptap table th {
            min-width: 80px;
            border: 1px solid #CBD5E1;
            padding: 10px 14px;
            vertical-align: top;
            box-sizing: border-box;
            position: relative;
            font-size: 14px;
            line-height: 1.5;
          }
          .tiptap table th {
            font-weight: 700;
            text-align: left;
            background-color: #F8FAFC;
            color: #0F172A;
            border-bottom: 2px solid #CBD5E1;
          }
          .tiptap table tr:nth-child(even) td {
            background-color: #FDFDFE;
          }
          .tiptap table tr:hover td {
            background-color: #F8FAFC;
          }
          .tiptap table .selectedCell:after {
            z-index: 2;
            position: absolute;
            content: "";
            left: 0; right: 0; top: 0; bottom: 0;
            background: rgba(113, 67, 254, 0.12);
            pointer-events: none;
            border: 1.5px solid #7143FE;
          }
          .tiptap table .column-resize-handle {
            position: absolute;
            right: -2px;
            top: 0;
            bottom: -2px;
            width: 4px;
            background-color: #7143FE;
            pointer-events: none;
          }
          .tiptap table p {
            margin: 0;
          }
          .tiptap.resize-cursor {
            cursor: ew-resize;
            cursor: col-resize;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </>
  )}

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
        fontWeight: '500',
        borderBottomLeftRadius: '11px',
        borderBottomRightRadius: '11px'
      }}>
        <span>📊 Insert tables via toolbar or paste directly from Excel/Sheets. Click image icon to select local photos.</span>
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
  justifyContent: 'center',
  transition: 'all 0.15s ease'
});

const dividerStyle = {
  width: '1px',
  height: '18px',
  background: '#E5E7EB',
  margin: '0 4px'
};

const tableMenuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 8px',
  fontSize: '12px',
  fontWeight: '500',
  color: '#334155',
  background: 'transparent',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
  transition: 'background 0.12s'
};

const contextTableBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  fontSize: '11px',
  fontWeight: '600',
  color: '#4C1D95',
  background: '#FFFFFF',
  border: '1px solid #DDD6FE',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};

export default RichTextEditor;
