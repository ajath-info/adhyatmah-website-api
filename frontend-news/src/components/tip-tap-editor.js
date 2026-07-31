'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatQuote,
  MdCode,
  MdLink,
  MdLinkOff,
  MdOutlineIntegrationInstructions
} from 'react-icons/md';
import { AiOutlineStrikethrough } from 'react-icons/ai';

export default function TiptapEditor({ value, onChange }) {
  const [htmlDialogOpen, setHtmlDialogOpen] = React.useState(false);
  const [htmlInput, setHtmlInput] = React.useState('');

  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit,
      Underline,                         
      Placeholder.configure({
        placeholder: 'Description'
      }),
      Table.configure({
        resizable: false,
        HTMLAttributes: {
          style: 'width: 100%; border-collapse: collapse; margin-bottom: 10px;'
        }
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          style: 'background-color: #f5a623; color: #ffffff; padding: 10px 14px; text-align: left; font-size: 14px;'
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          style: 'padding: 8px 14px; font-size: 14px; border-bottom: 1px solid #e0e0e0; color: #333;'
        }
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          style: 'color: #f5a623; text-decoration: underline;'
        }
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link')?.href || '';
    const url = window.prompt('Enter URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
  };

  const openHtmlDialog = () => {
    setHtmlInput('');
    setHtmlDialogOpen(true);
  };

  const closeHtmlDialog = () => {
    setHtmlDialogOpen(false);
    setHtmlInput('');
  };

  const insertHtml = () => {
    if (!editor || !htmlInput.trim()) {
      closeHtmlDialog();
      return;
    }
    // Replaces the full article with the pasted HTML, parsed into real
    // headings/paragraphs/lists instead of showing raw tags as text.
    editor.commands.setContent(htmlInput);
    onChange(editor.getHTML());
    closeHtmlDialog();
  };

  const getCurrentFormat = () => {
    if (!editor) return 'paragraph';
    for (let level = 1; level <= 6; level += 1) {
      if (editor.isActive('heading', { level })) return `h${level}`;
    }
    return 'paragraph';
  };

  const applyFormat = (val) => {
    if (!editor) return;
    if (val === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(val.replace('h', ''), 10);
      editor.chain().focus().setHeading({ level }).run();
    }
  };

  const renderButton = (label, Icon, isActive, onClick) => (
    <Tooltip title={label} key={label}>
      <IconButton onClick={onClick} color={isActive ? 'primary' : 'default'} size="small">
        <Icon size={18} />
      </IconButton>
    </Tooltip>
  );

  return (
    <Box
      sx={{
        '& .ProseMirror': {
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: '0 0 8px 8px',
          padding: 2,
          minHeight: 320,
          overflow: 'auto',
          outline: 'none',
          transition: 'border-color 0.3s',
          '&:hover, &:focus-within': {
            borderColor: (theme) => theme.palette.primary.main
          },
          '& a': {
            color: '#f5a623',
            textDecoration: 'underline',
            cursor: 'pointer'
          },
          // ✅ Table styles — editor ke andar dikhne ke liye
          '& table': {
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '10px',
          },
          '& th': {
            backgroundColor: '#f5a623',
            color: '#ffffff',
            padding: '10px 14px',
            textAlign: 'left',
            fontSize: '14px',
          },
          '& td': {
            padding: '8px 14px',
            fontSize: '14px',
            borderBottom: '1px solid #e0e0e0',
            color: '#333',
          },
          '& tr:nth-of-type(even) td': {
            backgroundColor: '#fdf6ec',
          },
          '& h1': { fontSize: '28px', fontWeight: 700, margin: '20px 0 10px', lineHeight: 1.3 },
          '& h2': { fontSize: '24px', fontWeight: 700, margin: '18px 0 10px', lineHeight: 1.3 },
          '& h3': { fontSize: '20px', fontWeight: 700, margin: '16px 0 8px', lineHeight: 1.35 },
          '& h4': { fontSize: '18px', fontWeight: 600, margin: '14px 0 8px', lineHeight: 1.35 },
          '& h5': { fontSize: '16px', fontWeight: 600, margin: '12px 0 6px', lineHeight: 1.4 },
          '& h6': { fontSize: '14px', fontWeight: 600, margin: '10px 0 6px', lineHeight: 1.4 },
          '& p': { fontSize: '15px', margin: '0 0 12px 0', lineHeight: 1.6 },
        },
        '& .tiptap-toolbar': {
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderBottom: 'none',
          borderRadius: '8px 8px 0 0',
          padding: 1
        }
      }}
    >
      <Box className="tiptap-toolbar">
        {editor && (
          <>
            {renderButton('Bold', MdFormatBold, editor.isActive('bold'), () =>
              editor.chain().focus().toggleBold().run()
            )}
            {renderButton('Italic', MdFormatItalic, editor.isActive('italic'), () =>
              editor.chain().focus().toggleItalic().run()
            )}
            {renderButton('Underline', MdFormatUnderlined, editor.isActive('underline'), () =>
              editor.chain().focus().toggleUnderline().run()
            )}
            {renderButton('Strikethrough', AiOutlineStrikethrough, editor.isActive('strike'), () =>
              editor.chain().focus().toggleStrike().run()
            )}
            {renderButton('Bullet List', MdFormatListBulleted, editor.isActive('bulletList'), () =>
              editor.chain().focus().toggleBulletList().run()
            )}
            {renderButton('Numbered List', MdFormatListNumbered, editor.isActive('orderedList'), () =>
              editor.chain().focus().toggleOrderedList().run()
            )}
            {renderButton('Block Quote', MdFormatQuote, editor.isActive('blockquote'), () =>
              editor.chain().focus().toggleBlockquote().run()
            )}
            {renderButton('Code Block', MdCode, editor.isActive('codeBlock'), () =>
              editor.chain().focus().toggleCodeBlock().run()
            )}
            <Select
              size="small"
              value={getCurrentFormat()}
              onChange={(e) => applyFormat(e.target.value)}
              sx={{ minWidth: 130, height: 32, mx: 0.5, fontSize: 14 }}
            >
              <MenuItem value="paragraph">Paragraph</MenuItem>
              <MenuItem value="h1">Heading 1</MenuItem>
              <MenuItem value="h2">Heading 2</MenuItem>
              <MenuItem value="h3">Heading 3</MenuItem>
              <MenuItem value="h4">Heading 4</MenuItem>
              <MenuItem value="h5">Heading 5</MenuItem>
              <MenuItem value="h6">Heading 6</MenuItem>
            </Select>
            {renderButton('Link', MdLink, editor.isActive('link'), setLink)}
            {renderButton('Remove Link', MdLinkOff, false, () =>
              editor.chain().focus().extendMarkRange('link').unsetLink().run()
            )}
            {renderButton('Import HTML', MdOutlineIntegrationInstructions, false, openHtmlDialog)}
          </>
        )}
      </Box>

      <EditorContent editor={editor} />

      <Dialog open={htmlDialogOpen} onClose={closeHtmlDialog} maxWidth="md" fullWidth>
        <DialogTitle>Import HTML</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            minRows={12}
            fullWidth
            placeholder="Paste your raw HTML article here (e.g. <h1>...</h1><p>...</p>)"
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            sx={{ mt: 1, '& textarea': { fontFamily: 'monospace', fontSize: 13 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeHtmlDialog}>Cancel</Button>
          <Button onClick={insertHtml} variant="contained">
            Insert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}