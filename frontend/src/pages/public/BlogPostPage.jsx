import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SEOHead from '../../components/ui/SEOHead';
import { ArticleJsonLd } from '../../components/ui/JsonLd';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslateJson } from '../../hooks/useTranslateJson';
import { useSettings } from '../../hooks/useSettings';
import { FiCalendar, FiArrowLeft, FiClock } from 'react-icons/fi';
import 'highlight.js/styles/github-dark.css';

const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeHighlight];

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, formatDate } = useLanguage();
  const tj = useTranslateJson();
  const { settings } = useSettings();

  useEffect(() => {
    api.get(`/posts/${slug}`).then((res) => {
      setPost(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

  if (!post) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('blog.not_found')}</h2>
          <Link to="/blog" className="text-blue-500 hover:text-blue-600">&larr; {t('blog.back')}</Link>
        </div>
      </div>
    );
  }

  const baseUrl = settings?.site_url || '';
  const showDate = settings?.blog_show_date !== 'false';
  const showReadingTime = settings?.blog_show_reading_time !== 'false';

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <SEOHead
        title={`${tj(post.title)} — Blog`}
        description={tj(post.excerpt)}
        url={`${baseUrl}/blog/${post.slug}`}
        type="article"
        article={{
          publishedTime: post.created_at,
          tags: (post.tagList || []).map((tag) => tag.name),
        }}
      />
      {baseUrl && (
        <ArticleJsonLd
          title={post.title}
          description={post.excerpt}
          url={`${baseUrl}/blog/${post.slug}`}
          datePublished={post.created_at}
          dateModified={post.updated_at}
          author={settings?.hero_name || 'Author'}
        />
      )}

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 mb-8 transition-colors">
          <FiArrowLeft size={14} /> {t('blog.back')}
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{tj(post.title)}</h1>
          {(showDate || showReadingTime) && (
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
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
          {post.tagList && post.tagList.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tagList.map((tag) => (
                <span key={tag.id} className="px-2 py-1 text-xs rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-blue-500 prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700">
          <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
            {tj(post.content)}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
