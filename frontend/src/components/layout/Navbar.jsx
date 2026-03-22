import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../hooks/useSettings';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { language, availableLanguages, switchLanguage, t } = useLanguage();
  const { settings } = useSettings();

  const isOn = (key) => settings?.[key] !== 'false';

  const allNavLinks = [
    { name: t('nav.home'), href: '#home', section: 'section_hero' },
    { name: t('nav.about'), href: '#about', section: 'section_about' },
    { name: t('nav.skills'), href: '#skills', section: 'section_skills' },
    { name: t('nav.projects'), href: '#projects', section: 'section_projects' },
    { name: t('nav.blog'), href: '/blog', section: 'section_blog' },
    { name: t('nav.contact'), href: '#contact', section: 'section_contact' },
  ];
  const navLinks = allNavLinks.filter((link) => isOn(link.section));

  const [activeSection, setActiveSection] = useState('#home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Detect active section
      if (location.pathname === '/') {
        const sections = navLinks.filter((l) => l.href.startsWith('#')).map((l) => l.href.slice(1));
        let current = '#home';
        for (const id of sections) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= 150) current = `#${id}`;
        }
        setActiveSection(current);
      }
    };
    // passive: true lets the browser optimise scrolling without waiting for this handler.
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname, navLinks]);

  const handleNavClick = (href) => {
    setIsOpen(false);
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation then scroll
        setTimeout(() => {
          const el = document.querySelector(href);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
          >
            {settings?.site_logo_text || ''}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = link.href.startsWith('/')
                ? location.pathname === link.href
                : location.pathname === '/' && activeSection === link.href;
              const cls = `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`;
              return link.href.startsWith('/') ? (
                <Link key={link.name} to={link.href} className={cls}>
                  {link.name}
                </Link>
              ) : (
                <button key={link.name} onClick={() => handleNavClick(link.href)} className={cls}>
                  {link.name}
                </button>
              );
            })}
            <select
              value={language}
              onChange={(e) => switchLanguage(e.target.value)}
              className="ml-2 px-2 py-1.5 rounded-lg text-xs font-bold bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase cursor-pointer"
              aria-label="Select language"
            >
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </select>
            <button
              onClick={toggleDarkMode}
              className="ml-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-b-xl">
            {navLinks.map((link) => {
              const isActive = link.href.startsWith('/')
                ? location.pathname === link.href
                : location.pathname === '/' && activeSection === link.href;
              const cls = `block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`;
              return link.href.startsWith('/') ? (
                <Link key={link.name} to={link.href} onClick={() => setIsOpen(false)} className={cls}>
                  {link.name}
                </Link>
              ) : (
                <button key={link.name} onClick={() => handleNavClick(link.href)} className={cls}>
                  {link.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
