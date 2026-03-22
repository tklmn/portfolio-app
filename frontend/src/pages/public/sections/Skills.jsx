import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import SectionHeading from '../../../components/ui/SectionHeading';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { useLanguage } from '../../../context/LanguageContext';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import api from '../../../api/axios';

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollReveal();

  useEffect(() => {
    api.get('/skills').then((res) => {
      setSkills(res.data);
      setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error || skills.length === 0) return null;

  const categories = ['All', ...new Set(skills.map((s) => s.category).filter(Boolean))];
  const filtered = activeCategory === 'All' ? skills : skills.filter((s) => s.category === activeCategory);

  return (
    <section id="skills" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('skills.title')} subtitle={t('skills.subtitle')} />

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat === 'All' ? t('skills.all') : cat}
            </button>
          ))}
        </div>

        <div ref={ref} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {filtered.map((skill, index) => {
            return (
              <div
                key={skill.id}
                className="group bg-white dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  {skill.icon ? (
                    <Icon icon={skill.icon} width={24} height={24} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
                  ) : null}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{skill.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{skill.category}</p>
                  </div>
                </div>
                <div
                  className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"
                  role="progressbar"
                  aria-valuenow={skill.level}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${skill.name} proficiency`}
                >
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
                <p className="text-right text-xs text-gray-500 dark:text-gray-500 mt-1">{skill.level}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
