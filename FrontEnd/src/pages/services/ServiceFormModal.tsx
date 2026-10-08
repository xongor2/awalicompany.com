import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  Music,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Minus,
  Maximize2,
  Grid,
  Strikethrough,
  Palette,
  ClipboardPaste,
  Eraser,
  HelpCircle,
  Undo2,
  Redo2,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Service } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  serviceToEdit?: Service | null;
}

// Curated high-resolution presets for AW Ali Company core sectors
const PRESET_SERVICE_IMAGES = [
  {
    category: 'Education',
    label: 'University Campus & Global Education',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80'
  },
  {
    category: 'Consulting',
    label: 'Executive Strategic Advisory & Corporate Board',
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1000&auto=format&fit=crop&q=80'
  },
  {
    category: 'Import / Export',
    label: 'International Freight & Container Logistics',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80'
  },
  {
    category: 'Real Estate',
    label: 'High-Value Commercial Real Estate & Asset Portfolio',
    url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1000&auto=format&fit=crop&q=80'
  }
];

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  serviceToEdit,
}) => {
  const { showToast } = useToast();
  const isEdit = Boolean(serviceToEdit);

  // Core fields from screenshots & specification:
  // 1. Service Title (Top input "Add title")
  const [title, setTitle] = useState('');

  // 2. Info / Service Description (Rich text editor inside Settings box)
  const [info, setInfo] = useState('');
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');
  const [headingFormat, setHeadingFormat] = useState('Paragraph');
  const [showToolbarRow2, setShowToolbarRow2] = useState(true);

  // 3. Featured Image (Single main service image from Screenshot 2)
  const [featuredImage, setFeaturedImage] = useState('');

  // Collapsible panels matching screenshot UI
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isFeaturedBoxOpen, setIsFeaturedBoxOpen] = useState(true);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; info?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Media Insertion Modal Dialog ("Add media" button in Screenshot 1)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaUploadType, setMediaUploadType] = useState<'upload' | 'url' | 'preset'>('upload');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaAltInput, setMediaAltInput] = useState('');

  // Drag-and-drop state for featured image
  const [isDraggingFeatured, setIsDraggingFeatured] = useState(false);

  // Textarea & file input references
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const featuredFileInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  // Reset form completely to pristine empty state
  const resetForm = () => {
    setTitle('');
    setInfo('');
    setEditorMode('visual');
    setHeadingFormat('Paragraph');
    setFeaturedImage('');
    setErrors({});
    setGeneralError(null);
    if (featuredFileInputRef.current) featuredFileInputRef.current.value = '';
    if (mediaFileInputRef.current) mediaFileInputRef.current.value = '';
  };

  // Synchronize state on open or when editing a service
  useEffect(() => {
    if (isOpen) {
      if (serviceToEdit) {
        setTitle(serviceToEdit.title || serviceToEdit.name || '');
        setInfo(serviceToEdit.description || '');
        setFeaturedImage(serviceToEdit.image || '');
        setErrors({});
        setGeneralError(null);
      } else {
        // When creating a new service, form is strictly clean and empty
        resetForm();
      }
    }
  }, [isOpen, serviceToEdit]);

  // Handle modal cancellation/closing with reset
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Featured Image Upload via native file input
  const handleFeaturedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      if (dataUrl) {
        setFeaturedImage(dataUrl);
        showToast('Featured image updated.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers for featured image box
  const handleFeaturedDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFeatured(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please drop an image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      if (dataUrl) {
        setFeaturedImage(dataUrl);
        showToast('Featured image updated.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  // Rich Text Editor formatting helper
  const applyFormatting = (before: string, after: string = '', defaultPlaceholder = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = info.substring(start, end) || defaultPlaceholder;
    const replacement = `${before}${selected}${after}`;
    const newContent = info.substring(0, start) + replacement + info.substring(end);

    setInfo(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  // Apply Heading / Paragraph format from dropdown
  const handleHeadingFormatChange = (format: string) => {
    setHeadingFormat(format);
    if (format === 'Heading 1') applyFormatting('<h1>', '</h1>', 'Heading 1');
    else if (format === 'Heading 2') applyFormatting('<h2>', '</h2>', 'Heading 2');
    else if (format === 'Heading 3') applyFormatting('<h3>', '</h3>', 'Heading 3');
    else if (format === 'Heading 4') applyFormatting('<h4>', '</h4>', 'Heading 4');
    else if (format === 'Blockquote') applyFormatting('<blockquote>', '</blockquote>', 'Quote');
    else if (format === 'Paragraph') applyFormatting('<p>', '</p>', 'Paragraph text');
  };

  // Insert media into editor
  const handleInsertMedia = () => {
    if (!mediaUrlInput.trim()) {
      showToast('Please provide an image URL or upload an image.', 'error');
      return;
    }

    const alt = mediaAltInput.trim() || 'Service media asset';
    const mediaTag = `\n<img src="${mediaUrlInput.trim()}" alt="${alt}" class="service-media rounded-lg my-3" />\n`;

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = info.substring(0, start) + mediaTag + info.substring(end);
      setInfo(newContent);
    } else {
      setInfo((prev) => prev + mediaTag);
    }

    setIsMediaModalOpen(false);
    setMediaUrlInput('');
    setMediaAltInput('');
    showToast('Media inserted into Info editor.', 'info');
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: { title?: string; info?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Service Title is required.';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Service Title must be at least 3 characters.';
    }

    if (!info.trim()) {
      newErrors.info = 'Info / Service Description is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) {
      setGeneralError('Please review and resolve the highlighted errors.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Fallback preset if image wasn't set by user
      const defaultImage = PRESET_SERVICE_IMAGES[1].url;

      const resolvedImage = featuredImage.trim() || defaultImage;

      const payload: Partial<Service> = {
        name: title.trim(),
        title: title.trim(),
        category: 'Consulting',
        description: info.trim(),
        image: resolvedImage,
        status: 'Active',
        features: serviceToEdit?.features || [],
      };

      if (isEdit && serviceToEdit) {
        await api.updateService(serviceToEdit.id, payload);
        showToast('Service offering updated successfully.', 'success');
      } else {
        await api.createService(payload);
        showToast('New service published successfully.', 'success');
      }

      // Completely clear form after saving
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      setGeneralError(err.message || 'An error occurred while saving the service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Word & Character count calculations
  const wordCount = info.trim() ? info.trim().split(/\s+/).length : 0;
  const charCount = info.length;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        maxWidth="5xl"
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E4] dark:bg-[#252B5C] flex items-center justify-center text-[#FF7817]">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading text-lg font-bold text-[#151A46] dark:text-white">
                {isEdit ? 'Edit Service Offering' : 'Add New Service'}
              </span>
              <p className="text-[11px] text-[#8A90A2] font-normal">
                AW Ali Company Service Module Specification
              </p>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Error Alert Banner */}
          {generalError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div>
                <p className="font-semibold">{generalError}</p>
                <p className="text-[11px] opacity-85 mt-0.5">Please ensure all required fields are filled properly.</p>
              </div>
            </div>
          )}

          {/* 1. Main Title Input (Matching Screenshot 1 "Add title") */}
          <div>
            <input
              id="service-title-field"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="Add title"
              className={`w-full px-4 py-3 text-lg sm:text-xl font-heading font-medium rounded-md border bg-white dark:bg-[#0B1030] text-[#151A46] dark:text-white placeholder-[#8A90A2] shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF7817]/30 ${
                errors.title
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-[#ccd0d4] dark:border-[#252B5C] focus:border-[#FF7817]'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1.5 pl-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Settings & Info Rich Text Editor (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              {/* 2. Settings Box (Matching Screenshot 1) */}
              <div className="rounded-md border border-[#ccd0d4] dark:border-[#252B5C] bg-white dark:bg-[#151A46] shadow-xs overflow-hidden">
                {/* Settings Header Bar */}
                <div className="px-4 py-2.5 bg-[#F8F9FC] dark:bg-[#0B1030]/80 border-b border-[#ccd0d4] dark:border-[#252B5C] flex items-center justify-between">
                  <span className="font-heading text-sm font-semibold text-[#151A46] dark:text-white">
                    Settings
                  </span>
                  <div className="flex items-center gap-1 text-[#8A90A2]">
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                      className="p-1 hover:text-[#151A46] dark:hover:text-white transition-colors cursor-pointer"
                      title={isSettingsOpen ? 'Collapse Settings' : 'Expand Settings'}
                    >
                      {isSettingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Settings Body */}
                {isSettingsOpen && (
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Top Row: Info label on left, Editor Action Header on right */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                      {/* Left Info Column (Screenshot 1: "Info", "Name: info") */}
                      <div className="sm:col-span-3">
                        <h4 className="font-heading text-sm font-semibold text-[#151A46] dark:text-white">
                          Info
                        </h4>
                        <p className="text-xs text-[#8A90A2] mt-0.5">Name: info</p>
                      </div>

                      {/* Right Editor Controls: Add media & Visual/Code toggle */}
                      <div className="sm:col-span-9 flex items-center justify-between gap-3">
                        {/* Add media button (Screenshot 1: "♫ Add media") */}
                        <button
                          type="button"
                          id="btn-add-media"
                          onClick={() => setIsMediaModalOpen(true)}
                          className="px-3 py-1.5 rounded border border-[#2271b1] dark:border-[#388fe5] bg-white dark:bg-[#0B1030] text-[#2271b1] dark:text-[#68acf7] text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Music className="w-3.5 h-3.5 text-[#2271b1] dark:text-[#68acf7]" />
                          Add media
                        </button>

                        {/* Visual / Code Tabs (Screenshot 1: [Visual] [Code]) */}
                        <div className="flex items-center border border-[#ccd0d4] dark:border-[#252B5C] rounded overflow-hidden text-xs">
                          <button
                            type="button"
                            onClick={() => setEditorMode('visual')}
                            className={`px-3 py-1 font-medium transition-colors cursor-pointer ${
                              editorMode === 'visual'
                                ? 'bg-white dark:bg-[#252B5C] text-[#151A46] dark:text-white font-semibold shadow-2xs'
                                : 'bg-[#F8F9FC] dark:bg-[#0B1030] text-[#8A90A2] hover:text-[#151A46] dark:hover:text-white'
                            }`}
                          >
                            Visual
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditorMode('code')}
                            className={`px-3 py-1 font-medium transition-colors border-l border-[#ccd0d4] dark:border-[#252B5C] cursor-pointer ${
                              editorMode === 'code'
                                ? 'bg-white dark:bg-[#252B5C] text-[#151A46] dark:text-white font-semibold shadow-2xs'
                                : 'bg-[#F8F9FC] dark:bg-[#0B1030] text-[#8A90A2] hover:text-[#151A46] dark:hover:text-white'
                            }`}
                          >
                            Code
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Rich Text Editor Container */}
                    <div className="rounded border border-[#ccd0d4] dark:border-[#252B5C] overflow-hidden bg-white dark:bg-[#0B1030]">
                      {/* Editor Toolbar (Classic TinyMCE style as seen in Screenshot 1) */}
                      {editorMode === 'visual' && (
                        <div className="bg-[#f0f0f1] dark:bg-[#1E255E]/60 border-b border-[#ccd0d4] dark:border-[#252B5C] p-1.5 select-none space-y-1">
                          {/* Row 1 Toolbar */}
                          <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 text-[#444] dark:text-[#D9DDE8]">
                            {/* Paragraph / Heading Dropdown */}
                            <select
                              value={headingFormat}
                              onChange={(e) => handleHeadingFormatChange(e.target.value)}
                              className="text-xs py-1 px-2 rounded border border-[#ccd0d4] dark:border-[#252B5C] bg-white dark:bg-[#151A46] text-[#151A46] dark:text-white focus:outline-none cursor-pointer"
                            >
                              <option value="Paragraph">Paragraph</option>
                              <option value="Heading 1">Heading 1</option>
                              <option value="Heading 2">Heading 2</option>
                              <option value="Heading 3">Heading 3</option>
                              <option value="Heading 4">Heading 4</option>
                              <option value="Blockquote">Blockquote</option>
                            </select>

                            <div className="h-4 w-px bg-[#ccd0d4] dark:bg-[#252B5C] mx-1" />

                            {/* Bold */}
                            <button
                              type="button"
                              onClick={() => applyFormatting('<strong>', '</strong>', 'bold text')}
                              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs font-bold w-7 h-7 flex items-center justify-center cursor-pointer"
                              title="Bold (Ctrl+B)"
                            >
                              <Bold className="w-3.5 h-3.5" />
                            </button>

                            {/* Italic */}
                            <button
                              type="button"
                              onClick={() => applyFormatting('<em>', '</em>', 'italic text')}
                              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs italic w-7 h-7 flex items-center justify-center cursor-pointer"
                              title="Italic (Ctrl+I)"
                            >
                              <Italic className="w-3.5 h-3.5" />
                            </button>

                            {/* Bullets List */}
                            <button
                              type="button"
                              onClick={() => applyFormatting('<ul>\n  <li>', '</li>\n</ul>', 'List item')}
                              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs w-7 h-7 flex items-center justify-center cursor-pointer"
                              title="Bulleted List"
                            >
                              <List className="w-3.5 h-3.5" />
                            </button>

                            {/* Numbered List */}
                            <button
                              type="button"
                              onClick={() => applyFormatting('<ol>\n  <li>', '</li>\n</ol>', 'List item')}
                              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs w-7 h-7 flex items-center justify-center cursor-pointer"
                              title="Numbered List"
                            >
                              <ListOrdered className="w-3.5 h-3.5" />
                            </button>

                            {/* Blockquote */}
                            <button
                              type="button"
                              onClick={() => applyFormatting('<blockquote>', '</blockquote>', 'Quoted text')}
                              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs w-7 h-7 flex items-center justify-center cursor-pointer"
                              title="Blockquote"
                            >
                              <Quote className="w-3.5 h-3.5" />
                            </button>

                            <div className="h-4 w-px bg-[#ccd0d4] dark:bg-[#252B5C] mx-1" />

                            {/* Align Left */}
                            <button
                              type="button"
                              onClick={() => applyFormatting('<p style="text-align: left;">', '</p>', 'Left aligned')}
                              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs w-7 h-7 flex items-center justify-center cursor-pointer"
                              title="Align Left"
                            >
                              <AlignLeft className="w-3.5 h-3.5" />
                            </button>

                            {/* Align Center */}
                            <button
                              type="button"
                              onClick={() => applyFormatting('<p style="text-align: center;">', '</p>', 'Centered text')}
                              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs w-7 h-7 flex items-center justify-center cursor-pointer"
                              title="Align Center"
                            >
                              <AlignCenter className="w-3.5 h-3.5" />
                            </button>

                            {/* Align Right */}
                            <button
                              type="button"
                              onClick={() => applyFormatting('<p style="text-align: right;">', '</p>', 'Right aligned')}
                              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs w-7 h-7 flex items-center justify-center cursor-pointer"
                              title="Align Right"
                            >
                              <AlignRight className="w-3.5 h-3.5" />
                            </button>

                            {/* Insert Link */}
                            <button
                              type="button"
                              onClick={() => {
                                const url = prompt('Enter URL link:', 'https://');
                                if (url) applyFormatting(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, '</a>', 'Link text');
                              }}
                              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs w-7 h-7 flex items-center justify-center cursor-pointer"
                              title="Insert/edit Link"
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                            </button>

                            {/* Horizontal Rule */}
                            <button
                              type="button"
                              onClick={() => applyFormatting('\n<hr />\n', '', '')}
                              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs w-7 h-7 flex items-center justify-center cursor-pointer"
                              title="Insert Horizontal Line"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            {/* Kitchen Sink / Row 2 Toggle */}
                            <button
                              type="button"
                              onClick={() => setShowToolbarRow2(!showToolbarRow2)}
                              className={`p-1 rounded text-xs w-7 h-7 flex items-center justify-center cursor-pointer ${
                                showToolbarRow2 ? 'bg-black/10 dark:bg-white/15' : 'hover:bg-black/5 dark:hover:bg-white/10'
                              }`}
                              title="Toolbar Toggle"
                            >
                              <Grid className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Row 2 Toolbar (Expandable matching Screenshot 1) */}
                          {showToolbarRow2 && (
                            <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 text-[#444] dark:text-[#D9DDE8] pt-1 border-t border-[#ccd0d4]/60 dark:border-[#252B5C]/60">
                              {/* Strikethrough */}
                              <button
                                type="button"
                                onClick={() => applyFormatting('<del>', '</del>', 'struck text')}
                                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs w-7 h-7 flex items-center justify-center cursor-pointer"
                                title="Strikethrough"
                              >
                                <Strikethrough className="w-3.5 h-3.5" />
                              </button>

                              {/* Highlight / Color */}
                              <button
                                type="button"
                                onClick={() => applyFormatting('<span style="color: #FF7817;">', '</span>', 'colored text')}
                                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs w-7 h-7 flex items-center justify-center cursor-pointer"
                                title="AW Orange Accent Text"
                              >
                                <span className="font-bold text-[#FF7817] text-xs">A</span>
                              </button>

                              {/* Paste as text */}
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const text = await navigator.clipboard.readText();
                                    if (text) applyFormatting(text, '', '');
                                  } catch {
                                    showToast('Clipboard read not permitted. Please paste manually.', 'info');
                                  }
                                }}
                                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs w-7 h-7 flex items-center justify-center cursor-pointer"
                                title="Paste as Text"
                              >
                                <ClipboardPaste className="w-3.5 h-3.5" />
                              </button>

                              {/* Clear Formatting */}
                              <button
                                type="button"
                                onClick={() => {
                                  // Strip simple tags
                                  const stripped = info.replace(/<\/?[^>]+(>|$)/g, '');
                                  setInfo(stripped);
                                }}
                                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs w-7 h-7 flex items-center justify-center cursor-pointer"
                                title="Clear Formatting"
                              >
                                <Eraser className="w-3.5 h-3.5" />
                              </button>

                              {/* Special Character */}
                              <button
                                type="button"
                                onClick={() => applyFormatting('• ', '', '')}
                                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs font-serif w-7 h-7 flex items-center justify-center cursor-pointer"
                                title="Insert Special Character (Bullet)"
                              >
                                Ω
                              </button>

                              <div className="h-4 w-px bg-[#ccd0d4] dark:bg-[#252B5C] mx-1" />

                              {/* Undo */}
                              <button
                                type="button"
                                onClick={() => document.execCommand('undo')}
                                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs w-7 h-7 flex items-center justify-center cursor-pointer"
                                title="Undo"
                              >
                                <Undo2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Redo */}
                              <button
                                type="button"
                                onClick={() => document.execCommand('redo')}
                                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs w-7 h-7 flex items-center justify-center cursor-pointer"
                                title="Redo"
                              >
                                <Redo2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Shortcuts Help */}
                              <button
                                type="button"
                                onClick={() => {
                                  showToast('Keyboard shortcuts: Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+Z (Undo)', 'info');
                                }}
                                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-xs w-7 h-7 flex items-center justify-center cursor-pointer"
                                title="Keyboard Shortcuts"
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Textarea for Content */}
                      <div className="relative">
                        <textarea
                          ref={textareaRef}
                          id="service-info-editor"
                          value={info}
                          onChange={(e) => {
                            setInfo(e.target.value);
                            if (errors.info) setErrors((prev) => ({ ...prev, info: undefined }));
                          }}
                          placeholder="Write comprehensive service scope, deliverables, client criteria, and technical methodology..."
                          rows={12}
                          className={`w-full p-4 text-sm bg-white dark:bg-[#0B1030] text-[#151A46] dark:text-[#D9DDE8] focus:outline-none resize-y ${
                            editorMode === 'code' ? 'font-mono text-xs' : 'font-sans leading-relaxed'
                          }`}
                        />
                      </div>

                      {/* Editor Status Bar */}
                      <div className="px-3 py-1.5 bg-[#f8f9fa] dark:bg-[#0B1030] border-t border-[#ccd0d4] dark:border-[#252B5C] flex items-center justify-between text-[11px] text-[#8A90A2]">
                        <span>Path: {editorMode === 'code' ? 'html > source' : 'p'}</span>
                        <div className="flex items-center gap-3">
                          <span>{wordCount} words</span>
                          <span>{charCount} characters</span>
                        </div>
                      </div>
                    </div>

                    {errors.info && (
                      <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.info}
                      </p>
                    )}

                    {/* Rich HTML Preview Box (when user has typed in visual mode) */}
                    {info.trim() && (
                      <div className="mt-4 p-3.5 rounded bg-[#F8F9FC] dark:bg-[#0B1030]/50 border border-[#ccd0d4] dark:border-[#252B5C]">
                        <span className="text-[11px] font-bold text-[#8A90A2] uppercase tracking-wider block mb-1.5">
                          Formatted Live Preview
                        </span>
                        <div
                          className="prose dark:prose-invert max-w-none text-xs text-[#151A46] dark:text-[#D9DDE8] leading-relaxed space-y-2"
                          dangerouslySetInnerHTML={{ __html: info }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR COLUMN: Featured Image & Operational Settings (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              {/* 3. Featured Image Box (Matching Screenshot 2) */}
              <div className="rounded-md border border-[#ccd0d4] dark:border-[#252B5C] bg-white dark:bg-[#151A46] shadow-xs overflow-hidden">
                {/* Header with Title and Chevrons */}
                <div className="px-4 py-2.5 bg-[#F8F9FC] dark:bg-[#0B1030]/80 border-b border-[#ccd0d4] dark:border-[#252B5C] flex items-center justify-between">
                  <span className="font-heading text-sm font-semibold text-[#151A46] dark:text-white">
                    Featured image
                  </span>
                  <div className="flex items-center gap-1 text-[#8A90A2]">
                    <button
                      type="button"
                      onClick={() => setIsFeaturedBoxOpen(!isFeaturedBoxOpen)}
                      className="p-1 hover:text-[#151A46] dark:hover:text-white transition-colors cursor-pointer"
                      title={isFeaturedBoxOpen ? 'Collapse Box' : 'Expand Box'}
                    >
                      {isFeaturedBoxOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Box Content (Screenshot 2: "Set featured image" link or preview) */}
                {isFeaturedBoxOpen && (
                  <div className="p-4 space-y-3">
                    {/* Hidden Native File Input */}
                    <input
                      ref={featuredFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageUpload}
                      className="hidden"
                    />

                    {!featuredImage ? (
                      /* State A: No Image Set - Displays "Set featured image" link matching Screenshot 2 */
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingFeatured(true);
                        }}
                        onDragLeave={() => setIsDraggingFeatured(false)}
                        onDrop={handleFeaturedDrop}
                        className={`p-5 rounded border border-dashed transition-all text-center space-y-2.5 ${
                          isDraggingFeatured
                            ? 'border-[#FF7817] bg-[#FFF0E4] dark:bg-[#252B5C]/50'
                            : 'border-[#ccd0d4] dark:border-[#252B5C] bg-[#F8F9FC]/60 dark:bg-[#0B1030]/40'
                        }`}
                      >
                        <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-[#2271b1] dark:text-[#68acf7]">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <div>
                          {/* Classic Blue Underlined Link from Screenshot 2 */}
                          <button
                            type="button"
                            id="btn-set-featured-image"
                            onClick={() => featuredFileInputRef.current?.click()}
                            className="text-xs font-semibold text-[#2271b1] dark:text-[#68acf7] underline hover:text-[#135e96] dark:hover:text-blue-300 transition-colors cursor-pointer"
                          >
                            Set featured image
                          </button>
                          <p className="text-[11px] text-[#8A90A2] mt-1">
                            Click to upload or drag & drop an image here
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* State B: Image IS Set - Full Preview, Replace & Remove */
                      <div className="space-y-3">
                        <div className="relative rounded-md overflow-hidden aspect-video border border-[#ccd0d4] dark:border-[#252B5C] bg-gray-100 dark:bg-[#0B1030] group">
                          <img
                            src={featuredImage}
                            alt="Featured service"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => featuredFileInputRef.current?.click()}
                              className="px-2.5 py-1 rounded bg-white text-xs font-semibold text-[#151A46] hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              onClick={() => setFeaturedImage('')}
                              className="px-2.5 py-1 rounded bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Text Links under preview */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <button
                            type="button"
                            onClick={() => featuredFileInputRef.current?.click()}
                            className="text-[#2271b1] dark:text-[#68acf7] underline hover:no-underline font-medium cursor-pointer"
                          >
                            Replace image
                          </button>
                          <button
                            type="button"
                            onClick={() => setFeaturedImage('')}
                            className="text-rose-600 dark:text-rose-400 underline hover:no-underline font-medium cursor-pointer"
                          >
                            Remove featured image
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#ccd0d4] dark:border-[#252B5C]">
            <div className="text-xs text-[#8A90A2] hidden sm:block">
              Fields marked with <span className="text-[#FF7817] font-bold">*</span> are required.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Clear Form button */}
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                disabled={isSubmitting}
                leftIcon={<RotateCcw className="w-3.5 h-3.5 text-[#8A90A2]" />}
                title="Wipe all inputs to clean empty state"
              >
                Clear Form
              </Button>

              {/* Cancel button */}
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              {/* Save / Publish button */}
              <Button
                type="submit"
                variant="accent"
                isLoading={isSubmitting}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                {isEdit ? 'Save Service' : 'Publish Service'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Media Insertion Dialog Modal ("Add media" button in Screenshot 1) */}
      <Modal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-[#2271b1]" />
            <span className="font-heading text-base font-bold text-[#151A46] dark:text-white">
              Add Media Asset to Info Editor
            </span>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-[#8A90A2]">
            Select or upload media to embed directly into the service description.
          </p>

          {/* Media source tabs */}
          <div className="flex border-b border-[#ccd0d4] dark:border-[#252B5C] text-xs">
            <button
              type="button"
              onClick={() => setMediaUploadType('upload')}
              className={`pb-2 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
                mediaUploadType === 'upload'
                  ? 'border-[#2271b1] text-[#2271b1] dark:border-[#68acf7] dark:text-[#68acf7]'
                  : 'border-transparent text-[#8A90A2]'
              }`}
            >
              Upload from Computer
            </button>
            <button
              type="button"
              onClick={() => setMediaUploadType('url')}
              className={`pb-2 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
                mediaUploadType === 'url'
                  ? 'border-[#2271b1] text-[#2271b1] dark:border-[#68acf7] dark:text-[#68acf7]'
                  : 'border-transparent text-[#8A90A2]'
              }`}
            >
              Insert via URL
            </button>
            <button
              type="button"
              onClick={() => setMediaUploadType('preset')}
              className={`pb-2 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
                mediaUploadType === 'preset'
                  ? 'border-[#2271b1] text-[#2271b1] dark:border-[#68acf7] dark:text-[#68acf7]'
                  : 'border-transparent text-[#8A90A2]'
              }`}
            >
              Company Library
            </button>
          </div>

          {/* Hidden File Input for Media */}
          <input
            ref={mediaFileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (le) => {
                  setMediaUrlInput((le.target?.result as string) || '');
                  setMediaAltInput(file.name.replace(/\.[^/.]+$/, ''));
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
          />

          {mediaUploadType === 'upload' && (
            <div className="p-6 rounded border-2 border-dashed border-[#ccd0d4] dark:border-[#252B5C] text-center space-y-2">
              <Upload className="w-8 h-8 mx-auto text-[#2271b1] dark:text-[#68acf7]" />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => mediaFileInputRef.current?.click()}
              >
                Select File
              </Button>
              <p className="text-[11px] text-[#8A90A2]">Maximum file size: 10 MB</p>
            </div>
          )}

          {mediaUploadType === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#151A46] dark:text-[#D9DDE8] mb-1">
                  Media Web URL
                </label>
                <input
                  type="url"
                  value={mediaUrlInput}
                  onChange={(e) => setMediaUrlInput(e.target.value)}
                  placeholder="https://example.com/asset.jpg"
                  className="w-full p-2.5 text-xs rounded border border-[#ccd0d4] dark:border-[#252B5C] bg-white dark:bg-[#0B1030] text-[#151A46] dark:text-white"
                />
              </div>
            </div>
          )}

          {mediaUploadType === 'preset' && (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {PRESET_SERVICE_IMAGES.map((preset) => (
                <div
                  key={preset.label}
                  onClick={() => {
                    setMediaUrlInput(preset.url);
                    setMediaAltInput(preset.label);
                  }}
                  className={`p-2 rounded border cursor-pointer flex items-center gap-2 transition-colors ${
                    mediaUrlInput === preset.url
                      ? 'border-[#2271b1] bg-blue-50 dark:bg-blue-950/40'
                      : 'border-[#ccd0d4] dark:border-[#252B5C] hover:bg-gray-50 dark:hover:bg-[#252B5C]'
                  }`}
                >
                  <img src={preset.url} alt="" className="w-10 h-10 rounded object-cover" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-[#151A46] dark:text-white truncate">
                      {preset.category}
                    </p>
                    <p className="text-[10px] text-[#8A90A2] truncate">{preset.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Alt text field */}
          {mediaUrlInput && (
            <div>
              <label className="block text-xs font-semibold text-[#151A46] dark:text-[#D9DDE8] mb-1">
                Alt Text / Caption
              </label>
              <input
                type="text"
                value={mediaAltInput}
                onChange={(e) => setMediaAltInput(e.target.value)}
                placeholder="Description of the media"
                className="w-full p-2 text-xs rounded border border-[#ccd0d4] dark:border-[#252B5C] bg-white dark:bg-[#0B1030] text-[#151A46] dark:text-white"
              />
            </div>
          )}

          {/* Dialog buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ccd0d4] dark:border-[#252B5C]">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsMediaModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={handleInsertMedia}
              disabled={!mediaUrlInput.trim()}
            >
              Insert into Info Editor
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
