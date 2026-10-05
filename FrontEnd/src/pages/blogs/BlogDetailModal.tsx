import React from 'react';
import {
  Calendar,
  User as UserIcon,
  Tag,
  Eye,
  Edit,
  X,
  Clock,
  Share2,
  BookmarkCheck
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BlogPost } from '../../types';

interface BlogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: BlogPost | null;
  onEdit?: (blog: BlogPost) => void;
}

export const BlogDetailModal: React.FC<BlogDetailModalProps> = ({
  isOpen,
  onClose,
  blog,
  onEdit,
}) => {
  if (!blog) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not published yet (Draft)';
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-3">
          <span className="font-heading text-lg font-bold text-[#171A2B] dark:text-white">
            Blog Post Preview
          </span>
          <Badge
            variant={blog.status === 'Published' ? 'active' : 'pending'}
            className="text-xs"
          >
            {blog.status}
          </Badge>
        </div>
      }
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
        {/* Featured Image */}
        {blog.thumbnail ? (
          <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden bg-[#EEF0F5] dark:bg-[#252B5C] border border-[#D9DDE8] dark:border-[#252B5C]">
            <img
              src={blog.thumbnail}
              alt={blog.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
              {blog.categories.map((cat, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white/90 dark:bg-[#151A46]/90 text-[#151A46] dark:text-white backdrop-blur-xs shadow-xs"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Title and Metadata */}
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#171A2B] dark:text-white leading-tight">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#5F667A] dark:text-[#8A90A2] pb-4 border-b border-[#D9DDE8] dark:border-[#252B5C]">
            <div className="flex items-center gap-1.5 font-medium">
              <UserIcon className="w-3.5 h-3.5 text-[#FF7817]" />
              <span>{blog.author || 'AW Ali Editorial'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#FF7817]" />
              <span>{formatDate(blog.published_date || blog.created_at)}</span>
            </div>

            {blog.views !== undefined && (
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>{blog.views} views</span>
              </div>
            )}
          </div>
        </div>

        {/* Formatted Content Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-[#171A2B] dark:text-[#D9DDE8]">
          <div
            dangerouslySetInnerHTML={{ __html: blog.content }}
            className="space-y-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:font-heading [&>h2]:text-xl [&>h2]:font-bold [&>h2]:font-heading [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:font-heading [&>p]:leading-relaxed [&>blockquote]:border-l-4 [&>blockquote]:border-[#FF7817] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-[#5F667A] dark:[&>blockquote]:text-[#8A90A2] [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>a]:text-[#FF7817] [&>a]:underline"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-[#D9DDE8] dark:border-[#252B5C]">
          <Button variant="secondary" onClick={onClose}>
            Close Preview
          </Button>

          {onEdit && (
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                onEdit(blog);
              }}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Blog Post
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
