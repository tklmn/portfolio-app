import { useEffect, useState, useMemo } from 'react';
import { usePagination } from '../../../hooks/usePagination';
import SectionHeading from '../../../components/ui/SectionHeading';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import OptimizedImage from '../../../components/ui/OptimizedImage';
import { useLanguage } from '../../../context/LanguageContext';
import { useSettings } from '../../../hooks/useSettings';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import api from '../../../api/axios';
import { useTranslateJson } from '../../../hooks/useTranslateJson';
import { FiGithub, FiExternalLink, FiSearch, FiStar } from 'react-icons/fi';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [techFilter, setTechFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { t } = useLanguage();
  const { settings } = useSettings();
  const tj = useTranslateJson();
  const { ref, isVisible } = useScrollReveal();

  useEffect(() => {
    api.get('/projects').then((res) => {
      setProjects(res.data);
      setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  }, []);

  // Extract unique techs and categories for filter dropdowns
  const allTechs = useMemo(() => {
    const techs = new Set();
    projects.filter((p) => p.featured).forEach((p) => {
      (p.tech_stack || '').split(',').forEach((t) => {
        const trimmed = t.trim();
        if (trimmed) techs.add(trimmed);
      });
    });
    return [...techs].sort();
  }, [projects]);

  const allCategories = useMemo(() => {
    return [...new Set(projects.filter((p) => p.featured).map((p) => p.category).filter(Boolean))].sort();
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      // Only show featured projects
      if (!p.featured) return false;
      if (search) {
        const s = search.toLowerCase();
        const titleMatch = (p.title || '').toLowerCase().includes(s) || JSON.stringify(p.title || '').toLowerCase().includes(s);
        const descMatch = (p.description || '').toLowerCase().includes(s) || JSON.stringify(p.description || '').toLowerCase().includes(s);
        if (!titleMatch && !descMatch) return false;
      }
      if (techFilter && !(p.tech_stack || '').toLowerCase().includes(techFilter.toLowerCase())) return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      return true;
    });
  }, [projects, search, techFilter, categoryFilter]);

  const perPage = parseInt(settings?.pagination_projects_per_page) || 10;
  const showPaginationControls = settings?.pagination_projects === 'true';
  const { currentPage: safePage, setCurrentPage, totalPages, paginatedItems: paginatedProjects } = usePagination(filtered, perPage, { mode: 'session', storageKey: 'projectsPage' });

  // Helper: update filter and reset page
  const setSearchAndReset = (v) => { setSearch(v); setCurrentPage(1); };
  const setTechAndReset = (v) => { setTechFilter(v); setCurrentPage(1); };
  const setCategoryAndReset = (v) => { setCategoryFilter(v); setCurrentPage(1); };

  if (loading) return <LoadingSpinner />;
  if (error) return null;

  const hasFilters = search || techFilter || categoryFilter;

  return (
    <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('projects.title')} subtitle={t('projects.subtitle')} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t('projects.search')}
              value={search}
              onChange={(e) => setSearchAndReset(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              aria-label={t('projects.search')}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryAndReset(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('projects.all_categories')}
          >
            <option value="">{t('projects.all_categories')}</option>
            {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={techFilter}
            onChange={(e) => setTechAndReset(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('projects.all_technologies')}
          >
            <option value="">{t('projects.all_technologies')}</option>
            {allTechs.map((tech) => <option key={tech} value={tech}>{tech}</option>)}
          </select>
        </div>

        {/* Project grid */}
        <div ref={ref} className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {paginatedProjects.map((project, index) => (
            <article
              key={project.id}
              className="group bg-white dark:bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1"
              style={{ transitionDelay: `${index * 75}ms` }}
            >
              <div className="h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5 flex items-center justify-center overflow-hidden">
                {project.image ? (
                  <OptimizedImage
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fallback={<div className="text-4xl opacity-50">🚀</div>}
                  />
                ) : (
                  <div className="text-4xl opacity-50 group-hover:scale-110 transition-transform duration-300">🚀</div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tj(project.title)}</h3>
                  {project.github_stars > 0 && (
                    <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full flex-shrink-0">
                      <FiStar size={12} /> {project.github_stars}
                    </span>
                  )}
                </div>
                {project.category && (
                  <span className="inline-block text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-md mb-2">
                    {project.category}
                  </span>
                )}
                {tj(project.description) && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{tj(project.description)}</p>}

                {project.tech_stack && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech_stack.split(',').map((tech) => (
                      <span key={tech} className="px-2 py-1 text-xs rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                      <FiGithub size={16} /> {t('projects.code')}
                    </a>
                  )}
                  {project.demo_url && (
                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                      <FiExternalLink size={16} /> {t('projects.demo')}
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

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

        {filtered.length === 0 && hasFilters && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">{t('projects.no_results')}</p>
        )}
      </div>
    </section>
  );
}
