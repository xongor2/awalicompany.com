import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  Calendar,
  Tag,
  RefreshCw,
  FileText,
  CheckCircle2,
  Clock,
  X,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { BlogPost } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { BlogFormPage } from './BlogFormPage';
import { BlogDetailModal } from './BlogDetailModal';

interface BlogsListPageProps {
  initialSearch?: string;
  isAddBlogOpenDirectly?: boolean;
  onCloseAddBlog?: () => void;
}

export const BlogsListPage: React.FC<BlogsListPageProps> = ({
  initialSearch = '',
  isAddBlogOpenDirectly = false,
  onCloseAddBlog,
}) => {
  const { showToast } = useToast();

  // Blog Data State
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and Pagination State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Published' | 'Draft'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // View & Edit Mode Navigation
  const [isFormView, setIsFormView] = useState(isAddBlogOpenDirectly);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  // View Modal State
  const [viewingBlog, setViewingBlog] = useState<BlogPost | null>(null);

  // Delete Confirmation Modal State
  const [blogToDelete, setBlogToDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Synchronize when external trigger opens Add Blog modal/form
  useEffect(() => {
    if (isAddBlogOpenDirectly) {
      setEditingBlog(null);
      setIsFormView(true);
    }
  }, [isAddBlogOpenDirectly]);

  // Load Blogs & Categories
  const fetchBlogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [blogsData, catsData] = await Promise.all([
        api.getBlogs(),
        api.getBlogCategories().catch(() => ['Real Estate', 'Investment', 'Business', 'Education', 'Lifestyle']),
      ]);
      setBlogs(Array.isArray(blogsData) ? blogsData : []);
      setCategories(Array.isArray(catsData) ? catsData : []);
    } catch (err: any) {
      console.error('Failed to load blogs:', err);
      setError(err.message || 'Failed to load blog posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filter Blogs
  const filteredBlogs = blogs.filter((blog) => {
    // Title search
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase().trim());
    // Category filter
    const matchesCategory =
      selectedCategory === 'All' ||
      (Array.isArray(blog.categories) && blog.categories.includes(selectedCategory));
    // Status filter
    const matchesStatus =
      selectedStatus === 'All' || blog.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination Slice
  const totalItems = filteredBlogs.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + pageSize);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  // Navigation handlers
  const handleOpenCreateForm = () => {
    setEditingBlog(null);
    setIsFormView(true);
  };

  const handleOpenEditForm = (blog: BlogPost) => {
    setEditingBlog(blog);
    setIsFormView(true);
  };

  const handleCloseForm = () => {
    setIsFormView(false);
    setEditingBlog(null);
    if (onCloseAddBlog) onCloseAddBlog();
  };

  const handleFormSuccess = (savedBlog: BlogPost, action: 'created' | 'updated') => {
    setIsFormView(false);
    setEditingBlog(null);
    if (onCloseAddBlog) onCloseAddBlog();
    fetchBlogs();
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteBlog(blogToDelete.id);
      showToast(
        `Blog post "${blogToDelete.title}" was permanently removed.`,
        'success',
        'Blog Deleted'
      );
      setBlogToDelete(null);
      fetchBlogs();
    } catch (err: any) {
      showToast(
        err.message || 'Could not delete blog post.',
        'error',
        'Delete Failed'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper date formatter
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Helper HTML stripper for clean preview snippet
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // If in Form view, show the full Add / Edit Blog Page
  if (isFormView) {
    return (
      <BlogFormPage
        blogToEdit={editingBlog}
        onBack={handleCloseForm}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Metrics counts
  const totalCount = blogs.length;
  const publishedCount = blogs.filter((b) => b.status === 'Published').length;
  const draftCount = blogs.filter((b) => b.status === 'Draft').length;
  const totalCategoriesCount = categories.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9DDE8] dark:border-[#252B5C]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#8A90A2] mb-1">
            <span>Dashboard</span>
            <span>&gt;</span>
            <span className="text-[#171A2B] dark:text-white font-semibold">Blogs</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#171A2B] dark:text-white">
              Blog Posts
            </h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF7817]/10 text-[#FF7817] border border-[#FF7817]/20">
              Editorial CMS
            </span>
          </div>
          <p className="text-sm text-[#5F667A] dark:text-[#8A90A2] mt-0.5">
            Manage company publications, market insights, and news updates across AW Ali Company.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={fetchBlogs}
            disabled={isLoading}
            className="rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5"
            title="Refresh blog list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="accent"
            onClick={handleOpenCreateForm}
            leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            className="rounded-xl px-4.5 py-2.5 text-sm font-semibold tracking-wide shadow-[0_2px_10px_rgba(255,120,23,0.30)] hover:shadow-[0_4px_16px_rgba(255,120,23,0.45)]"
          >
            Add Blog
          </Button>
        </div>
      </div>

      {/* Metrics Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Posts */}
        <button
          type="button"
          onClick={() => setSelectedStatus('All')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'All'
              ? 'bg-white dark:bg-[#151A46] border-[#FF7817] shadow-xs ring-1 ring-[#FF7817]/20'
              : 'bg-white dark:bg-[#151A46] border-[#D9DDE8] dark:border-[#252B5C] hover:border-[#C5CBE0] dark:hover:border-[#38407B]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F667A] dark:text-[#8A90A2] uppercase tracking-wider">
              Total Posts
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FF7817]/10 flex items-center justify-center text-[#FF7817]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-[#171A2B] dark:text-white">
              {totalCount}
            </span>
            <span className="text-xs text-[#8A90A2]">all entries</span>
          </div>
        </button>

        {/* Published Posts */}
        <button
          type="button"
          onClick={() => setSelectedStatus('Published')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'Published'
              ? 'bg-white dark:bg-[#151A46] border-[#FF7817] shadow-xs ring-1 ring-[#FF7817]/20'
              : 'bg-white dark:bg-[#151A46] border-[#D9DDE8] dark:border-[#252B5C] hover:border-[#C5CBE0] dark:hover:border-[#38407B]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F667A] dark:text-[#8A90A2] uppercase tracking-wider">
              Published
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FF7817]/10 flex items-center justify-center text-[#FF7817]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-[#171A2B] dark:text-white">
              {publishedCount}
            </span>
            <span className="text-xs text-[#FF7817] font-medium">live on site</span>
          </div>
        </button>

        {/* Draft Posts */}
        <button
          type="button"
          onClick={() => setSelectedStatus('Draft')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'Draft'
              ? 'bg-white dark:bg-[#151A46] border-amber-500 shadow-xs ring-1 ring-amber-500/20'
              : 'bg-white dark:bg-[#151A46] border-[#D9DDE8] dark:border-[#252B5C] hover:border-[#C5CBE0] dark:hover:border-[#38407B]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F667A] dark:text-[#8A90A2] uppercase tracking-wider">
              Drafts
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-[#171A2B] dark:text-white">
              {draftCount}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">in progress</span>
          </div>
        </button>

        {/* Categories */}
        <div className="p-4 rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#151A46] text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F667A] dark:text-[#8A90A2] uppercase tracking-wider">
              Categories
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#151A46]/10 dark:bg-white/10 flex items-center justify-center text-[#151A46] dark:text-white">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-[#171A2B] dark:text-white">
              {totalCategoriesCount}
            </span>
            <span className="text-xs text-[#8A90A2]">managed topics</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4 shadow-2xs border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#151A46]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#8A90A2]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search blogs by title or keyword..."
              className="w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white placeholder-[#8A90A2] focus:outline-none focus:ring-2 focus:ring-[#FF7817] transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-[#8A90A2] hover:text-[#171A2B] dark:hover:text-white cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right: Filters and Segmented Control */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Segmented Control */}
            <div className="flex items-center p-1 bg-[#F8F9FC] dark:bg-[#0B1030] rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] text-xs font-semibold">
              {(['All', 'Published', 'Draft'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedStatus === status
                      ? 'bg-white dark:bg-[#151A46] text-[#FF7817] shadow-xs'
                      : 'text-[#5F667A] dark:text-[#8A90A2] hover:text-[#171A2B] dark:hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div className="relative min-w-[160px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2 text-xs font-medium rounded-xl border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#0B1030] text-[#171A2B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7817] cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Active filters reset */}
            {(searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedStatus('All');
                }}
                className="text-xs font-semibold px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Responsive Table Container */}
      <Card className="overflow-hidden shadow-2xs border-[#D9DDE8] dark:border-[#252B5C] bg-white dark:bg-[#151A46]">
        {/* Table Top Header Ribbon */}
        <div className="px-6 py-3.5 border-b border-[#D9DDE8] dark:border-[#252B5C] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F8F9FC]/60 dark:bg-[#0B1030]/40">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5F667A] dark:text-[#8A90A2]">
              Published Records
            </span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#151A46]/10 dark:bg-white/10 text-[#151A46] dark:text-[#D9DDE8]">
              {filteredBlogs.length} {filteredBlogs.length === 1 ? 'post' : 'posts'}
            </span>
          </div>

          {!isLoading && !error && filteredBlogs.length > 0 && (
            <span className="text-xs text-[#8A90A2]">
              Showing {startIndex + 1}–{Math.min(startIndex + pageSize, totalItems)} of {totalItems}
            </span>
          )}
        </div>

        {isLoading ? (
          /* Loading Skeleton State */
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#D9DDE8] dark:border-[#252B5C]">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="flex items-center gap-4 py-3">
                <Skeleton className="w-18 h-12 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-24 hidden sm:block" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-24 hidden md:block" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#171A2B] dark:text-white">
              Unable to Load Blog Posts
            </h3>
            <p className="text-sm text-[#5F667A] dark:text-[#8A90A2] max-w-md mx-auto">
              {error}
            </p>
            <Button variant="primary" onClick={fetchBlogs} className="mx-auto">
              Try Again
            </Button>
          </div>
        ) : paginatedBlogs.length === 0 ? (
          /* Empty State */
          <div className="p-10 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#EEF0F5] dark:bg-[#252B5C] flex items-center justify-center text-[#8A90A2]">
              <FileText className="w-7 h-7 text-[#FF7817]" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#171A2B] dark:text-white">
              No Blog Posts Found
            </h3>
            <p className="text-sm text-[#5F667A] dark:text-[#8A90A2] max-w-sm mx-auto">
              {searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All'
                ? 'No posts matched your current filter criteria. Try adjusting or clearing your filters.'
                : 'There are no blog posts recorded yet. Create your first post to begin sharing updates.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              {searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All' ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setSelectedStatus('All');
                  }}
                >
                  Clear Filters
                </Button>
              ) : null}
              <Button
                variant="accent"
                onClick={handleOpenCreateForm}
                leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
                className="rounded-xl px-4 py-2 text-sm font-semibold shadow-[0_2px_10px_rgba(255,120,23,0.30)] hover:shadow-[0_4px_16px_rgba(255,120,23,0.45)]"
              >
                Add Blog Post
              </Button>
            </div>
          </div>
        ) : (
          /* Table View — Exact Column Order: Thumbnail → Title → Category → Status → Published Date → Actions */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#0B1030]/60 text-xs font-semibold text-[#5F667A] dark:text-[#8A90A2] uppercase tracking-wider select-none">
                  {/* Column 1: Thumbnail */}
                  <th className="py-3.5 pl-6 pr-3 w-24">Thumbnail</th>
                  {/* Column 2: Title */}
                  <th className="py-3.5 px-3 min-w-[260px]">Title & Excerpt</th>
                  {/* Column 3: Category */}
                  <th className="py-3.5 px-3 min-w-[150px]">Category</th>
                  {/* Column 4: Status */}
                  <th className="py-3.5 px-3 w-32">Status</th>
                  {/* Column 5: Published Date */}
                  <th className="py-3.5 px-3 w-36">Published Date</th>
                  {/* Column 6: Actions */}
                  <th className="py-3.5 pr-6 pl-3 w-36 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DDE8] dark:divide-[#252B5C] text-sm">
                {paginatedBlogs.map((blog) => {
                  const plainSnippet = stripHtml(blog.content);
                  const isPublished = blog.status === 'Published';

                  return (
                    <tr
                      key={blog.id}
                      className="hover:bg-[#F8F9FC] dark:hover:bg-[#0B1030]/40 transition-colors group"
                    >
                      {/* 1. Thumbnail Column */}
                      <td className="py-3.5 pl-6 pr-3 align-middle">
                        <div className="w-20 h-13 rounded-xl overflow-hidden border border-[#D9DDE8] dark:border-[#252B5C] bg-[#EEF0F5] dark:bg-[#252B5C] shrink-0 shadow-2xs group-hover:border-[#FF7817]/40 transition-all">
                          {blog.thumbnail ? (
                            <img
                              src={blog.thumbnail}
                              alt={blog.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&auto=format&fit=crop&q=80';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#8A90A2]">
                              <FileText className="w-5 h-5 text-[#FF7817]" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 2. Title Column */}
                      <td className="py-3.5 px-3 align-middle">
                        <div className="max-w-md">
                          <button
                            type="button"
                            onClick={() => setViewingBlog(blog)}
                            className="text-left font-bold text-sm text-[#171A2B] dark:text-white hover:text-[#FF7817] dark:hover:text-[#FF7817] transition-colors line-clamp-1 cursor-pointer block leading-snug"
                            title={blog.title}
                          >
                            {blog.title}
                          </button>
                          {plainSnippet && (
                            <p className="text-xs text-[#5F667A] dark:text-[#8A90A2] line-clamp-1 mt-1 font-normal">
                              {plainSnippet}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 3. Category Column */}
                      <td className="py-3.5 px-3 align-middle">
                        <div className="flex flex-wrap gap-1.5">
                          {blog.categories && blog.categories.length > 0 ? (
                            blog.categories.map((cat, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-[#F0F2F7] dark:bg-[#0B1030] text-[#151A46] dark:text-[#D9DDE8] border border-[#D9DDE8] dark:border-[#252B5C]"
                              >
                                {cat}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#8A90A2] italic">Uncategorized</span>
                          )}
                        </div>
                      </td>

                      {/* 4. Status Column */}
                      <td className="py-3.5 px-3 align-middle">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#FF7817] dark:bg-orange-950/40 dark:text-[#FF9240] border border-orange-200/80 dark:border-orange-800/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7817] animate-pulse" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* 5. Published Date Column */}
                      <td className="py-3.5 px-3 align-middle text-xs text-[#5F667A] dark:text-[#8A90A2]">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#8A90A2]" />
                          <span>{formatDate(blog.published_date || (isPublished ? blog.created_at : ''))}</span>
                        </div>
                      </td>

                      {/* 6. Actions Column */}
                      <td className="py-3.5 pr-6 pl-3 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => setViewingBlog(blog)}
                            className="p-2 rounded-xl text-[#5F667A] dark:text-[#8A90A2] hover:text-[#151A46] dark:hover:text-white hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] transition-all cursor-pointer"
                            title="View blog preview"
                            aria-label={`View ${blog.title}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(blog)}
                            className="p-2 rounded-xl text-[#5F667A] dark:text-[#8A90A2] hover:text-[#FF7817] hover:bg-[#FF7817]/10 transition-all cursor-pointer"
                            title="Edit blog post"
                            aria-label={`Edit ${blog.title}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setBlogToDelete(blog)}
                            className="p-2 rounded-xl text-[#5F667A] dark:text-[#8A90A2] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                            title="Delete blog post"
                            aria-label={`Delete ${blog.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && !error && filteredBlogs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </Card>

      {/* View Detail Modal */}
      <BlogDetailModal
        isOpen={Boolean(viewingBlog)}
        onClose={() => setViewingBlog(null)}
        blog={viewingBlog}
        onEdit={(b) => {
          setViewingBlog(null);
          handleOpenEditForm(b);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(blogToDelete)}
        onClose={() => !isDeleting && setBlogToDelete(null)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span>Delete Blog Post?</span>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[#5F667A] dark:text-[#8A90A2]">
            Are you sure you want to permanently delete{' '}
            <strong className="text-[#171A2B] dark:text-white font-semibold">
              "{blogToDelete?.title}"
            </strong>
            ? This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D9DDE8] dark:border-[#252B5C]">
            <Button
              variant="secondary"
              onClick={() => setBlogToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Delete Blog
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
