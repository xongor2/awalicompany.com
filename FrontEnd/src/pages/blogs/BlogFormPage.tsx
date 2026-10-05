import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  X,
  Plus,
  Search,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  Link as LinkIcon,
  Quote,
  Grid,
  Undo2,
  Redo2,
  ChevronUp,
  ChevronDown,
  Trash2,
  RefreshCw,
  Eye,
  Code,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { BlogPost } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

interface BlogFormPageProps {
  blogToEdit?: BlogPost | null;
  onBack: () => void;
  onSuccess: (blog: BlogPost, action: 'created' | 'updated') => void;
}

// Curated high quality presets for AW Ali Company topics
const CURATED_FEATURED_IMAGES = [
  {
    label: 'Modern Commercial Real Estate & Highrise',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Global Freight, Trade & Shipping Logistics',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Higher Education Advisory & Global Students',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Corporate Strategy & Business Investment',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Luxury Residential Living & Duplex Penthouse',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=80',
  },
];

export const BlogFormPage: React.FC<BlogFormPageProps> = ({
  blogToEdit,
  onBack,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const isEdit = Boolean(blogToEdit);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([
    'Real Estate',
    'Investment',
    'Business',
    'Education',
    'Lifestyle',
  ]);

  // Sidebar Controls
  const [isCategoriesCollapsed, setIsCategoriesCollapsed] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Editor Toolbar State
  const [headingFormat, setHeadingFormat] = useState('Paragraph');
  const [editorTab, setEditorTab] = useState<'editor' | 'preview'>('editor');
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);

  // Drag and Drop & File upload
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Submission & Validation
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing blog or initialize fresh form
  useEffect(() => {
    if (blogToEdit) {
      setTitle(blogToEdit.title || '');
      setContent(blogToEdit.content || '');
      setFeaturedImage(blogToEdit.thumbnail || '');
      setSelectedCategories(blogToEdit.categories || []);
      setHistoryStack([blogToEdit.content || '']);
      setHistoryPointer(0);
    } else {
      // Empty pristine state
      setTitle('');
      setContent('');
      setFeaturedImage('');
      setSelectedCategories(['Real Estate']);
      setHistoryStack(['']);
      setHistoryPointer(0);
    }
    setErrors({});
    setImageError(null);
  }, [blogToEdit]);

  // Load categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await api.getBlogCategories();
        if (Array.isArray(cats) && cats.length > 0) {
          setAllCategories(cats);
        }
      } catch (err) {
        console.warn('Using default categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Compute Word Count
  const getWordCount = (text: string) => {
    // Strip HTML tags for accurate word count
    const stripped = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!stripped) return 0;
    return stripped.split(' ').length;
  };

  // Push content change into undo/redo stack
  const updateContentWithHistory = (newVal: string) => {
    setContent(newVal);
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: undefined }));
    }
    const newStack = historyStack.slice(0, historyPointer + 1);
    newStack.push(newVal);
    if (newStack.length > 50) newStack.shift();
    setHistoryStack(newStack);
    setHistoryPointer(newStack.length - 1);
  };

  const handleUndo = () => {
    if (historyPointer > 0) {
      const prevVal = historyStack[historyPointer - 1];
      setHistoryPointer(historyPointer - 1);
      setContent(prevVal);
    }
  };

  const handleRedo = () => {
    if (historyPointer < historyStack.length - 1) {
      const nextVal = historyStack[historyPointer + 1];
      setHistoryPointer(historyPointer + 1);
      setContent(nextVal);
    }
  };

  // Wrap or insert text in editor
  const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || defaultPlaceholder;
    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);

    updateContentWithHistory(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const handleHeadingChange = (format: string) => {
    setHeadingFormat(format);
    if (format === 'Paragraph') {
      insertFormatting('<p>', '</p>', 'Paragraph text');
    } else if (format === 'Heading 1') {
      insertFormatting('<h1>', '</h1>', 'Heading 1');
    } else if (format === 'Heading 2') {
      insertFormatting('<h2>', '</h2>', 'Heading 2');
    } else if (format === 'Heading 3') {
      insertFormatting('<h3>', '</h3>', 'Heading 3');
    } else if (format === 'Heading 4') {
      insertFormatting('<h4>', '</h4>', 'Heading 4');
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter URL link:', 'https://');
    if (url) {
      insertFormatting(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, '</a>', 'Link Text');
    }
  };

  const handleInsertImage = () => {
    const imgUrl = prompt('Enter image URL:', 'https://images.unsplash.com/');
    if (imgUrl) {
      const alt = prompt('Enter image description / alt text:', 'Blog illustration');
      const imgTag = `\n<img src="${imgUrl}" alt="${alt || 'Blog illustration'}" class="my-4 rounded-xl max-w-full shadow-md" />\n`;
      const textarea = textareaRef.current;
      if (!textarea) {
        updateContentWithHistory(content + imgTag);
        return;
      }
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + imgTag + content.substring(end);
      updateContentWithHistory(newContent);
    }
  };

  const handleInsertTable = () => {
    const tableTemplate = `
<table class="min-w-full my-4 border border-collapse border-[#D9DDE8] dark:border-[#252B5C] text-sm">
  <thead>
    <tr class="bg-[#F8F9FC] dark:bg-[#151A46]">
      <th class="border border-[#D9DDE8] dark:border-[#252B5C] p-2 text-left font-semibold">Key Metric</th>
      <th class="border border-[#D9DDE8] dark:border-[#252B5C] p-2 text-left font-semibold">Analysis</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border border-[#D9DDE8] dark:border-[#252B5C] p-2">Location Growth</td>
      <td class="border border-[#D9DDE8] dark:border-[#252B5C] p-2">+18.5% YoY</td>
    </tr>
    <tr>
      <td class="border border-[#D9DDE8] dark:border-[#252B5C] p-2">Rental Yield</td>
      <td class="border border-[#D9DDE8] dark:border-[#252B5C] p-2">7.2% Average</td>
    </tr>
  </tbody>
</table>
`;
    const textarea = textareaRef.current;
    if (!textarea) {
      updateContentWithHistory(content + tableTemplate);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + tableTemplate + content.substring(end);
    updateContentWithHistory(newContent);
  };

  // Image Upload Handling
  const processImageFile = (file: File) => {
    setImageError(null);
    if (!file.type.match(/^image\/(png|jpe?g|webp)$/i)) {
      setImageError('Please upload a PNG, JPG, or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image file size exceeds the 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setFeaturedImage(e.target.result);
      }
    };
    reader.onerror = () => {
      setImageError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Categories Handling
  const filteredCategories = allCategories.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase().trim())
  );

  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const handleAddNewCategory = async () => {
    const trimmed = newCategoryName.trim();
    setCategoryError(null);

    if (!trimmed) {
      setCategoryError('Please enter a category name');
      return;
    }

    // Duplicate check
    const duplicate = allCategories.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );

    if (duplicate) {
      setCategoryError(`Category "${trimmed}" already exists.`);
      if (!selectedCategories.includes(trimmed)) {
        setSelectedCategories((prev) => [...prev, trimmed]);
      }
      return;
    }

    try {
      const res = await api.createBlogCategory(trimmed);
      const addedName = res.category;
      setAllCategories((prev) => [...prev, addedName]);
      setSelectedCategories((prev) => [...prev, addedName]);
      setNewCategoryName('');
      setIsAddCategoryOpen(false);
      showToast(
        `Category "${addedName}" has been created and selected.`,
        'success',
        'Category Added'
      );
    } catch (err: any) {
      setCategoryError(err.message || 'Failed to create category');
    }
  };

  // Form Submission
  const validateForm = () => {
    const newErrors: { title?: string; content?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Blog Title is required.';
    }
    if (!content.trim()) {
      newErrors.content = 'Blog Content is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (targetStatus: 'Published' | 'Draft') => {
    if (!validateForm()) {
      showToast(
        'Please fill in the required fields (Title and Content).',
        'error',
        'Validation Error'
      );
      return;
    }

    const isPublish = targetStatus === 'Published';
    if (isPublish) {
      setIsPublishing(true);
    } else {
      setIsSavingDraft(true);
    }

    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        thumbnail: featuredImage || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80',
        categories: selectedCategories.length > 0 ? selectedCategories : ['General'],
        status: targetStatus,
        published_date: isPublish ? new Date().toISOString() : undefined,
      };

      let result: BlogPost;
      if (isEdit && blogToEdit) {
        result = await api.updateBlog(blogToEdit.id, payload);
        showToast(
          `"${result.title}" has been successfully updated as ${targetStatus}.`,
          'success',
          'Blog Updated'
        );
        onSuccess(result, 'updated');
      } else {
        result = await api.createBlog(payload);
        showToast(
          `"${result.title}" has been successfully ${isPublish ? 'published' : 'saved as draft'}.`,
          'success',
          isPublish ? 'Blog Published' : 'Draft Saved'
        );
        onSuccess(result, 'created');
      }
    } catch (err: any) {
      showToast(
        err.message || 'An unexpected error occurred while saving the blog.',
        'error',
        'Operation Failed'
      );
    } finally {
      setIsPublishing(false);
      setIsSavingDraft(false);
    }
  };

  const wordCount = getWordCount(content);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9DDE8] dark:border-[#252B5C]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#8A90A2] mb-1">
            <button
              onClick={onBack}
              className="hover:text-[#FF7817] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Blog</span>
            </button>
            <span>&gt;</span>
            <span className="text-[#171A2B] dark:text-white font-semibold">
              {isEdit ? 'Edit Blog Post' : 'Add New Blog Post'}
            </span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#171A2B] dark:text-white">
            {isEdit ? 'Edit Blog Post' : 'Add New Blog Post'}
          </h1>
          <p className="text-sm text-[#5F667A] dark:text-[#8A90A2] mt-0.5">
            {isEdit
              ? 'Update your blog post details, formatting, and categorization.'
              : 'Create and share your ideas with the world.'}
          </p>
        </div>

        <div>
          <Button
            variant="secondary"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Area (8 columns on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 space-y-6 shadow-xs border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#151A46]">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-semibold text-[#171A2B] dark:text-white mb-2 font-heading">
                Title <span className="text-[#FF7817]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                placeholder="Enter blog title..."
                className={`w-full px-4 py-3 text-base rounded-lg border bg-white dark:bg-[#0B1030] text-[#171A2B] dark:text-white placeholder-[#8A90A2] focus:outline-none focus:ring-2 focus:ring-[#FF7817] transition-colors ${
                  errors.title
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-[#D9DDE8] dark:border-[#252B5C]'
                }`}
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Content Field & Rich Text Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-[#171A2B] dark:text-white font-heading">
                  Content <span className="text-[#FF7817]">*</span>
                </label>

                {/* Editor / Live Preview Mode Tabs */}
                <div className="flex items-center bg-[#F8F9FC] dark:bg-[#0B1030] p-1 rounded-lg border border-[#D9DDE8] dark:border-[#252B5C] text-xs">
                  <button
                    type="button"
                    onClick={() => setEditorTab('editor')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                      editorTab === 'editor'
                        ? 'bg-white dark:bg-[#151A46] text-[#171A2B] dark:text-white shadow-2xs'
                        : 'text-[#5F667A] dark:text-[#8A90A2] hover:text-[#171A2B] dark:hover:text-white'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                      editorTab === 'preview'
                        ? 'bg-white dark:bg-[#151A46] text-[#FF7817] shadow-2xs font-semibold'
                        : 'text-[#5F667A] dark:text-[#8A90A2] hover:text-[#171A2B] dark:hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                </div>
              </div>

              {/* Editor Container */}
              <div
                className={`rounded-xl border overflow-hidden transition-colors ${
                  errors.content
                    ? 'border-red-500'
                    : 'border-[#D9DDE8] dark:border-[#252B5C]'
                }`}
              >
                {/* Rich Text Toolbar matching uploaded screenshot */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#F8F9FC] dark:bg-[#0B1030] border-b border-[#D9DDE8] dark:border-[#252B5C] select-none text-xs">
                  {/* Heading / Paragraph Format Dropdown */}
                  <div className="relative">
                    <select
                      value={headingFormat}
                      onChange={(e) => handleHeadingChange(e.target.value)}
                      className="px-2.5 py-1.5 bg-white dark:bg-[#151A46] border border-[#D9DDE8] dark:border-[#252B5C] rounded-md text-[#171A2B] dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#FF7817] cursor-pointer"
                    >
                      <option value="Paragraph">Paragraph</option>
                      <option value="Heading 1">Heading 1</option>
                      <option value="Heading 2">Heading 2</option>
                      <option value="Heading 3">Heading 3</option>
                      <option value="Heading 4">Heading 4</option>
                    </select>
                  </div>

                  <div className="h-5 w-px bg-[#D9DDE8] dark:bg-[#252B5C] mx-1" />

                  {/* Formatting Buttons */}
                  <button
                    type="button"
                    onClick={() => insertFormatting('<strong>', '</strong>', 'bold text')}
                    className="p-1.5 rounded-md hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] text-[#171A2B] dark:text-[#D9DDE8] transition-colors"
                    title="Bold (Ctrl+B)"
                  >
                    <Bold className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertFormatting('<em>', '</em>', 'italic text')}
                    className="p-1.5 rounded-md hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] text-[#171A2B] dark:text-[#D9DDE8] transition-colors"
                    title="Italic (Ctrl+I)"
                  >
                    <Italic className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertFormatting('<u>', '</u>', 'underlined text')}
                    className="p-1.5 rounded-md hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] text-[#171A2B] dark:text-[#D9DDE8] transition-colors"
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>

                  <div className="h-5 w-px bg-[#D9DDE8] dark:bg-[#252B5C] mx-1" />

                  {/* Lists */}
                  <button
                    type="button"
                    onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n</ul>', 'List item')}
                    className="p-1.5 rounded-md hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] text-[#171A2B] dark:text-[#D9DDE8] transition-colors"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertFormatting('<ol>\n  <li>', '</li>\n</ol>', 'Numbered item')}
                    className="p-1.5 rounded-md hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] text-[#171A2B] dark:text-[#D9DDE8] transition-colors"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>

                  <div className="h-5 w-px bg-[#D9DDE8] dark:bg-[#252B5C] mx-1" />

                  {/* Alignment */}
                  <button
                    type="button"
                    onClick={() => insertFormatting('<div class="text-left">', '</div>', 'Left aligned content')}
                    className="p-1.5 rounded-md hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] text-[#171A2B] dark:text-[#D9DDE8] transition-colors"
                    title="Align Left"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertFormatting('<div class="text-center">', '</div>', 'Centered content')}
                    className="p-1.5 rounded-md hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] text-[#171A2B] dark:text-[#D9DDE8] transition-colors"
                    title="Align Center"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>

                  <div className="h-5 w-px bg-[#D9DDE8] dark:bg-[#252B5C] mx-1" />

                  {/* Insert Link / Media / Quote / Table */}
                  <button
                    type="button"
                    onClick={handleInsertLink}
                    className="p-1.5 rounded-md hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] text-[#171A2B] dark:text-[#D9DDE8] transition-colors"
                    title="Insert Link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleInsertImage}
                    className="p-1.5 rounded-md hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] text-[#171A2B] dark:text-[#D9DDE8] transition-colors"
                    title="Insert Inline Image"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertFormatting('<blockquote>', '</blockquote>', 'Insightful quote or statement')}
                    className="p-1.5 rounded-md hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] text-[#171A2B] dark:text-[#D9DDE8] transition-colors"
                    title="Blockquote"
                  >
                    <Quote className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleInsertTable}
                    className="p-1.5 rounded-md hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] text-[#171A2B] dark:text-[#D9DDE8] transition-colors"
                    title="Insert Table"
                  >
                    <Grid className="w-4 h-4" />
                  </button>

                  <div className="h-5 w-px bg-[#D9DDE8] dark:bg-[#252B5C] mx-1" />

                  {/* Undo & Redo */}
                  <button
                    type="button"
                    disabled={historyPointer <= 0}
                    onClick={handleUndo}
                    className="p-1.5 rounded-md hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] text-[#171A2B] dark:text-[#D9DDE8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Undo"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    disabled={historyPointer >= historyStack.length - 1}
                    onClick={handleRedo}
                    className="p-1.5 rounded-md hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] text-[#171A2B] dark:text-[#D9DDE8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Redo"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Editor Content Area / Live Preview */}
                {editorTab === 'editor' ? (
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => updateContentWithHistory(e.target.value)}
                    placeholder="Write your blog content here..."
                    rows={16}
                    className="w-full p-4 font-mono text-sm leading-relaxed bg-white dark:bg-[#151A46] text-[#171A2B] dark:text-white placeholder-[#8A90A2] focus:outline-none resize-y min-h-[380px]"
                  />
                ) : (
                  <div className="p-6 bg-white dark:bg-[#151A46] min-h-[380px] prose prose-slate dark:prose-invert max-w-none text-[#171A2B] dark:text-[#D9DDE8]">
                    {content ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: content }}
                        className="space-y-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-semibold [&>blockquote]:border-l-4 [&>blockquote]:border-[#FF7817] [&>blockquote]:pl-4 [&>blockquote]:italic [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                      />
                    ) : (
                      <p className="text-sm text-[#8A90A2] italic">
                        No content written yet. Switch back to Editor mode to compose your post.
                      </p>
                    )}
                  </div>
                )}

                {/* Word & Character Counter Bottom-Right */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#F8F9FC] dark:bg-[#0B1030] border-t border-[#D9DDE8] dark:border-[#252B5C] text-xs text-[#8A90A2]">
                  <span>Formatting: HTML supported</span>
                  <span className="font-medium text-[#171A2B] dark:text-white">
                    {wordCount} words
                  </span>
                </div>
              </div>

              {errors.content && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.content}
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Right / Sidebar Area (4 columns on desktop) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Featured Image Card */}
          <Card className="p-6 shadow-xs border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#151A46]">
            <h2 className="text-base font-semibold text-[#171A2B] dark:text-white mb-4 font-heading">
              Featured Image
            </h2>

            {featuredImage ? (
              <div className="space-y-4">
                {/* Image Preview with Remove 'x' icon */}
                <div className="relative rounded-xl overflow-hidden border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#0B1030] group aspect-video">
                  <img
                    src={featuredImage}
                    alt="Featured Blog Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError('Failed to display the selected image URL.')}
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturedImage('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors shadow-sm"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Replace / Remove action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 text-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#FF7817]" />
                    Replace
                  </Button>

                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setFeaturedImage('')}
                    className="flex items-center justify-center gap-1.5 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              /* Dropzone upload area */
              <div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingImage(true);
                  }}
                  onDragLeave={() => setIsDraggingImage(false)}
                  onDrop={handleDropImage}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDraggingImage
                      ? 'border-[#FF7817] bg-[#FF7817]/5'
                      : 'border-[#D9DDE8] dark:border-[#252B5C] hover:border-[#FF7817] dark:hover:border-[#FF7817] bg-[#F8F9FC] dark:bg-[#0B1030]'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#EEF0F5] dark:bg-[#252B5C] flex items-center justify-center text-[#5F667A] dark:text-[#8A90A2]">
                    <ImageIcon className="w-6 h-6 text-[#FF7817]" />
                  </div>
                  <p className="text-sm font-semibold text-[#171A2B] dark:text-white">
                    Click to upload an image
                  </p>
                  <p className="text-xs text-[#8A90A2] mt-1">
                    PNG, JPG or WEBP (Max 5MB)
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsPresetModalOpen(true)}
                    className="text-xs text-[#FF7817] hover:underline font-medium flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Select from curated presets
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Enter direct image URL:');
                      if (url) setFeaturedImage(url.trim());
                    }}
                    className="text-xs text-[#5F667A] dark:text-[#8A90A2] hover:underline"
                  >
                    Paste URL
                  </button>
                </div>
              </div>
            )}

            {imageError && (
              <p className="mt-2 text-xs text-red-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {imageError}
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processImageFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
          </Card>

          {/* Categories Card */}
          <Card className="p-6 shadow-xs border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#151A46]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#171A2B] dark:text-white font-heading">
                Categories
              </h2>
              <button
                type="button"
                onClick={() => setIsCategoriesCollapsed(!isCategoriesCollapsed)}
                className="p-1 rounded-md text-[#8A90A2] hover:text-[#171A2B] dark:hover:text-white transition-colors"
                aria-label="Toggle categories"
              >
                {isCategoriesCollapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
            </div>

            {!isCategoriesCollapsed && (
              <div className="space-y-4">
                {/* Search Categories Field */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8A90A2]" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search Categories..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white placeholder-[#8A90A2] focus:outline-none focus:ring-1 focus:ring-[#FF7817]"
                  />
                  {categorySearch && (
                    <button
                      type="button"
                      onClick={() => setCategorySearch('')}
                      className="absolute right-2.5 top-2.5 text-[#8A90A2] hover:text-[#171A2B] dark:hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Categories Checkbox List */}
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => {
                      const isChecked = selectedCategories.includes(cat);
                      return (
                        <label
                          key={cat}
                          className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#F8F9FC] dark:hover:bg-[#0B1030] cursor-pointer text-xs font-medium text-[#171A2B] dark:text-[#D9DDE8] transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCategory(cat)}
                            className="w-4 h-4 rounded text-[#FF7817] focus:ring-[#FF7817] border-[#D9DDE8] dark:border-[#252B5C] dark:bg-[#0B1030] cursor-pointer"
                          />
                          <span>{cat}</span>
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-xs text-[#8A90A2] py-2 text-center">
                      No categories match "{categorySearch}".
                    </p>
                  )}
                </div>

                {/* Selected Category Tags Summary */}
                {selectedCategories.length > 0 && (
                  <div className="pt-2 border-t border-[#D9DDE8] dark:border-[#252B5C] flex flex-wrap gap-1.5">
                    {selectedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FF7817]/10 text-[#FF7817] text-[11px] font-semibold"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* + Add Category Trigger */}
                {!isAddCategoryOpen ? (
                  <button
                    type="button"
                    onClick={() => setIsAddCategoryOpen(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[#FF7817] hover:bg-[#FF7817]/5 rounded-lg border border-dashed border-[#FF7817]/40 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Category
                  </button>
                ) : (
                  /* Expanded Add Category Form */
                  <div className="p-3 rounded-lg bg-[#F8F9FC] dark:bg-[#0B1030] border border-[#D9DDE8] dark:border-[#252B5C] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#8A90A2] uppercase tracking-wider">
                        New Category Name
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddCategoryOpen(false);
                          setCategoryError(null);
                        }}
                        className="text-[#8A90A2] hover:text-[#171A2B] dark:hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => {
                          setNewCategoryName(e.target.value);
                          if (categoryError) setCategoryError(null);
                        }}
                        placeholder="Enter category name..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-md border border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#151A46] text-[#171A2B] dark:text-white placeholder-[#8A90A2] focus:outline-none focus:ring-1 focus:ring-[#FF7817]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={handleAddNewCategory}
                        className="text-xs px-3 py-1.5"
                      >
                        Add Category
                      </Button>
                    </div>

                    {categoryError && (
                      <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {categoryError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-[#0B1030]/95 backdrop-blur-md p-4 rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] shadow-lg flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={isSavingDraft || isPublishing}
        >
          Cancel
        </Button>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSubmit('Draft')}
            isLoading={isSavingDraft}
            disabled={isPublishing}
            className="border-[#D9DDE8] dark:border-[#252B5C] font-medium"
          >
            Save as Draft
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => handleSubmit('Published')}
            isLoading={isPublishing}
            disabled={isSavingDraft}
            className="bg-[#FF7817] hover:bg-[#D95D00] text-white font-semibold shadow-md px-6"
          >
            {isEdit ? 'Update Blog' : 'Publish Blog'}
          </Button>
        </div>
      </div>

      {/* Curated Presets Selection Modal */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#151A46] rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-[#171A2B] dark:text-white">
                Choose a Featured Image Preset
              </h3>
              <button
                type="button"
                onClick={() => setIsPresetModalOpen(false)}
                className="p-1 rounded-md text-[#8A90A2] hover:text-[#171A2B] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5F667A] dark:text-[#8A90A2]">
              Select from high-resolution professional images representing AW Ali Company sectors.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {CURATED_FEATURED_IMAGES.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setFeaturedImage(item.url);
                    setIsPresetModalOpen(false);
                  }}
                  className="group relative rounded-lg overflow-hidden border border-[#D9DDE8] dark:border-[#252B5C] cursor-pointer hover:border-[#FF7817] transition-all"
                >
                  <img
                    src={item.url}
                    alt={item.label}
                    className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-2 bg-white dark:bg-[#0B1030] text-[11px] font-medium text-[#171A2B] dark:text-white line-clamp-1">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPresetModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
