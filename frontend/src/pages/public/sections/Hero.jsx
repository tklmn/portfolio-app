import { FiArrowDown, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { RiTwitterXFill } from 'react-icons/ri';
import { useLanguage } from '../../../context/LanguageContext';
import { useSettings } from '../../../hooks/useSettings';

export default function Hero() {
  const { t } = useLanguage();
  const { settings, ts } = useSettings();

  const scrollTo = (id) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const badgeEnabled = settings?.hero_badge_enabled !== 'false';
  const badgeText = ts('hero_badge_text') || '5+ Years';

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fade-in">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <p className="text-blue-500 dark:text-blue-400 font-medium mb-4 tracking-wide">
              {t('hero.greeting')}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              {settings?.hero_name || 'John Developer'}
            </h1>
            <h2 className="text-xl sm:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 mb-6">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                {ts('hero_title') || 'Full-Stack Web Developer'}
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-lg mb-8 leading-relaxed">
              {ts('hero_subtitle') || 'I build exceptional digital experiences with modern technologies.'}
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <button
                onClick={() => scrollTo('#projects')}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                {t('hero.cta_work')}
              </button>
              <button
                onClick={() => scrollTo('#contact')}
                className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300"
              >
                {t('hero.cta_contact')}
              </button>
            </div>

            <div className="flex gap-4 mt-8 justify-center lg:justify-start">
              {settings?.social_github && (
                <a href={settings.social_github} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="GitHub">
                  <FiGithub size={22} />
                </a>
              )}
              {settings?.social_linkedin && (
                <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="LinkedIn">
                  <FiLinkedin size={22} />
                </a>
              )}
              {settings?.social_x && (
                <a href={settings.social_x} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="X">
                  <RiTwitterXFill size={22} />
                </a>
              )}
              {settings?.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="Email">
                  <FiMail size={22} />
                </a>
              )}
            </div>
          </div>

          {/* Profile image */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {settings?.hero_image ? (
                    <img
                      src={settings.hero_image}
                      alt={settings?.hero_name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl sm:text-7xl">👨‍💻</span>
                  )}
                </div>
              </div>
              {badgeEnabled && (
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold rotate-12 shadow-lg">
                  {badgeText}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll down indicator — clickable */}
        <button
          onClick={() => scrollTo('#about')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer p-2 hover:text-blue-500 transition-colors"
          aria-label="Scroll down"
        >
          <FiArrowDown className="text-gray-400 dark:text-gray-600" size={24} />
        </button>
      </div>
    </section>
  );
}
