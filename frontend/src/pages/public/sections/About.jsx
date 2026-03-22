import { useEffect, useState } from 'react';
import SectionHeading from '../../../components/ui/SectionHeading';
import { FiBriefcase, FiBook, FiAward } from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext';
import { useSettings } from '../../../hooks/useSettings';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import api from '../../../api/axios';
import { useTranslateJson } from '../../../hooks/useTranslateJson';

const iconMap = {
  briefcase: FiBriefcase,
  award: FiAward,
  book: FiBook,
};

export default function About() {
  const { t } = useLanguage();
  const { settings, ts } = useSettings();
  const tj = useTranslateJson();
  const { ref, isVisible } = useScrollReveal();
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    api.get('/about/timeline').then((res) => {
      // Sort by year descending (newest first)
      const sorted = [...res.data].sort((a, b) => b.year.localeCompare(a.year));
      setTimeline(sorted);
    }).catch(() => {});
  }, []);

  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('about.title')} subtitle={t('about.subtitle')} />

        <div ref={ref} className={`grid lg:grid-cols-2 gap-12 items-start transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700/50">
              {ts('about_heading') && <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{ts('about_heading')}</h3>}
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                {ts('about_bio') && <p>{ts('about_bio')}</p>}
                {ts('about_bio_2') && <p>{ts('about_bio_2')}</p>}
                {ts('about_bio_3') && <p>{ts('about_bio_3')}</p>}
              </div>
            </div>

            {[
              { value: ts('about_stat_1_value'), label: ts('about_stat_1_label') },
              { value: ts('about_stat_2_value'), label: ts('about_stat_2_label') },
              { value: ts('about_stat_3_value'), label: ts('about_stat_3_label') },
            ].some((s) => s.value) && (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: ts('about_stat_1_value'), label: ts('about_stat_1_label') },
                  { value: ts('about_stat_2_value'), label: ts('about_stat_2_label') },
                  { value: ts('about_stat_3_value'), label: ts('about_stat_3_label') },
                ].filter((s) => s.value).map((stat) => (
                  <div key={stat.value} className="bg-white dark:bg-gray-800/50 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700/50">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
                    {stat.label && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {timeline.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('about.journey')}</h3>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 to-purple-600" />
                <div className="space-y-8">
                  {timeline.map((item) => {
                    const Icon = iconMap[item.icon] || FiBriefcase;
                    return (
                      <div key={item.id} className="relative pl-16">
                        <div className="absolute left-3 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Icon size={14} className="text-white" />
                        </div>
                        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700/50 hover:shadow-md transition-shadow">
                          <span className="text-xs font-medium text-blue-500 dark:text-blue-400">{item.year}</span>
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white mt-1">{tj(item.title)}</h4>
                          {tj(item.company) && <p className="text-sm text-gray-500 dark:text-gray-400">{tj(item.company)}</p>}
                          {tj(item.description) && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{tj(item.description)}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
