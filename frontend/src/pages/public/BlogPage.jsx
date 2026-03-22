import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SectionHeading from '../../components/ui/SectionHeading';
import SEOHead from '../../components/ui/SEOHead';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../hooks/useSettings';
import { useTranslateJson } from '../../hooks/useTranslateJson';
import { usePagination } from '../../hooks/usePagination';
import { FiCalendar, FiArrowRight, FiClock } from 'react-icons/fi';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('');
  const { t, formatDate } = useLanguage();
  const { settings } = useSettings();
  const tj = useTranslateJson();

  useEffect(() => {
    api.get('/posts').then((res) => {
      setPosts(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const allTags = [...new Set(posts.flatMap((p) => (p.tagList || []).map((tag) => tag.name)))].sort();
  const filtered = activeTag ? posts.filter((p) => (p.tagList || []).some((tag) => tag.name === activeTag)) : posts;
  const perPage = parseInt(settings?.pagination_posts_per_page) || 10;
  const showPaginationControls = settings?.pagination_posts === 'true';
  const showDate = settings?.blog_show_date !== 'false';
  const showReadingTime = settings?.blog_show_reading_time !== 'false';
  const { currentPage: safePage, setCurrentPage, totalPages, paginatedItems: paginatedPosts } = usePagination(filtered, perPage, { mode: 'url' });

  if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <SEOHead title={`${t('blog.title')} — Portfolio`} description={t('blog.subtitle')} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('blog.title')} subtitle={t('blog.subtitle')} />

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveTag('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!activeTag ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {t('skills.all')}
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTag === tag ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">{t('blog.no_posts')}</p>
        ) : (
          <div className="space-y-6">
            {paginatedPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="block group bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-lg transition-all duration-300"
              >
                {(showDate || showReadingTime) && (
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {showDate && (
                      <span className="flex items-center gap-1">
                        <FiCalendar size={14} />
                        {formatDate(post.created_at)}
                      </span>
                    )}
                    {showReadingTime && post.reading_time > 0 && (
                      <span className="flex items-center gap-1">
                        <FiClock size={14} />
                        {post.reading_time} {t('blog.min_read')}
                      </span>
                    )}
                  </div>
                )}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mb-2">
                  {tj(post.title)}
                </h2>
                {tj(post.excerpt) && <p className="text-gray-600 dark:text-gray-400 mb-4">{tj(post.excerpt)}</p>}

                {/* Tags */}
                {post.tagList && post.tagList.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tagList.map((tag) => (
                      <span key={tag.id} className="px-2 py-0.5 text-xs rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                <span className="inline-flex items-center gap-1 text-sm text-blue-500 dark:text-blue-400 font-medium group-hover:gap-2 transition-all">
                  {t('blog.read_more')} <FiArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {showPaginationControls && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-40 transition-all"
            >
              &larr;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${safePage === page ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md' : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400'}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-40 transition-all"
            >
              &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
