import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  ArrowRight,
  Calendar,
  User,
  Clock,
  Sparkles,
  X,
  Share2,
} from 'lucide-react';
import { BlogPost } from '../../types';
import { api } from '../../services/api';

export interface LatestInsightsSectionProps {
  onNavigate: (page: string) => void;
  onNavigateCMSBlog?: () => void;
}

export const LatestInsightsSection: React.FC<LatestInsightsSectionProps> = ({
  onNavigate,
  onNavigateCMSBlog,
}) => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchArticles = async () => {
      try {
        const data = await api.getBlogs();
        if (isMounted) {
          const published = (data || [])
            .filter((b) => b.status === 'Published')
            .sort(
              (a, b) =>
                new Date(b.published_date || b.created_at || '').getTime() -
                new Date(a.published_date || a.created_at || '').getTime()
            )
            .slice(0, 3);
          setBlogs(published);
        }
      } catch (err) {
        console.error('Failed to load insights:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative w-full py-20 sm:py-28 px-4 sm:px-8 lg:px-16 bg-[#FAFBFD] dark:bg-[#080C26] transition-colors border-b border-[#E2E6EF] dark:border-[#1E2554]">
      <div className="max-w-[1360px] mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E2E6EF] dark:border-[#1E2554] pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF7817]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligence & Thought Leadership</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#151A46] dark:text-white tracking-tight leading-tight">
              Corporate Intelligence & Market Insights
            </h2>
            <p className="text-base sm:text-lg text-[#555E78] dark:text-[#BAC3DC] leading-relaxed">
              Authoritative briefings, regulatory updates, and expert perspectives across global trade
              corridors, higher education frontiers, and real estate investments.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('blog')}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#151A46] hover:bg-[#FF7817] dark:bg-white/10 dark:hover:bg-[#FF7817] transition-all cursor-pointer shadow-xs"
            >
              <span>Explore All Insights</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-2xl bg-white dark:bg-white/5 border border-[#E2E6EF] dark:border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#111638] border border-[#E2E6EF] dark:border-[#202754] max-w-md mx-auto">
            <BookOpen className="w-10 h-10 text-[#FF7817] mx-auto opacity-70 mb-3" />
            <h3 className="font-heading text-lg font-bold text-[#151A46] dark:text-white">
              Upcoming Executive Briefings
            </h3>
            <p className="text-xs text-[#5D657E] dark:text-[#AAB2CA] mt-1">
              New thought leadership articles and industry reports will be released shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post) => {
              const category =
                post.categories && post.categories.length > 0
                  ? post.categories[0]
                  : 'Corporate Insight';
              const dateFormatted = new Date(
                post.published_date || post.created_at
              ).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <article
                  key={post.id}
                  onClick={() => setSelectedArticle(post)}
                  className="group bg-white dark:bg-[#12183F] rounded-2xl border border-[#DFE4EE] dark:border-[#1E2554] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#FF7817]/40 dark:hover:border-[#FF7817]/40 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1.5"
                >
                  {/* Photo Container */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={
                        post.thumbnail ||
                        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Unboxed clean metadata tag */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-[#151A46]/90 text-white backdrop-blur-md">
                        {category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Quiet metadata line without pills */}
                      <div className="flex items-center gap-2 text-[11px] text-[#6F7792] dark:text-[#A0ABC6]">
                        <span>{dateFormatted}</span>
                        <span aria-hidden="true">·</span>
                        <span>{post.author || 'Senior Advisory Desk'}</span>
                      </div>

                      <h3 className="font-heading text-lg font-bold text-[#151A46] dark:text-white group-hover:text-[#FF7817] transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-xs text-[#5D657E] dark:text-[#AAB2CA] line-clamp-3 leading-relaxed font-normal">
                        {post.content ? post.content.replace(/<[^>]*>?/gm, '') : ''}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#EDF1F7] dark:border-[#1E2554] flex items-center justify-between text-xs font-bold text-[#FF7817]">
                      <span className="inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                        <span>Read Full Briefing</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Article Interactive Reading Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#111638] rounded-3xl border border-[#DFE4EE] dark:border-[#202754] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-[#171A2B] dark:text-white">
            {/* Header Image */}
            <div className="relative h-64 w-full shrink-0 bg-slate-900">
              <img
                src={
                  selectedArticle.thumbnail ||
                  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80'
                }
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-[#FF7817] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="inline-block px-3 py-1 rounded text-xs font-bold bg-[#FF7817] text-white mb-2">
                  {selectedArticle.categories?.[0] || 'Executive Briefing'}
                </span>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {selectedArticle.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-2">
                  <span>{selectedArticle.author || 'AW Ali Advisory Team'}</span>
                  <span>·</span>
                  <span>
                    {new Date(
                      selectedArticle.published_date || selectedArticle.created_at
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div className="prose dark:prose-invert max-w-none text-sm text-[#485068] dark:text-[#BAC3DC] leading-relaxed whitespace-pre-line">
                {selectedArticle.content}
              </div>

              <div className="pt-6 border-t border-[#EDF1F7] dark:border-[#1E2554] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-[#6F7792] dark:text-[#A0ABC6]">
                  <span>Tags:</span>
                  {(selectedArticle.categories || []).map((cat, i) => (
                    <span key={i} className="text-[#151A46] dark:text-white font-semibold">
                      #{cat}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  {onNavigateCMSBlog && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedArticle(null);
                        onNavigateCMSBlog();
                      }}
                      className="px-4 py-2 text-xs font-bold text-[#FF7817] bg-[#FF7817]/10 hover:bg-[#FF7817] hover:text-white rounded-xl transition-all cursor-pointer"
                    >
                      Open CMS Editor
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedArticle(null)}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#151A46] dark:bg-white/10 hover:bg-[#FF7817] rounded-xl transition-all cursor-pointer"
                  >
                    Done Reading
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
