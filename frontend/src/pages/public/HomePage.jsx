import { useEffect } from 'react';
import Hero from './sections/Hero';
import About from './sections/About';
import Skills from './sections/Skills';
import Projects from './sections/Projects';
import Contact from './sections/Contact';
import SEOHead from '../../components/ui/SEOHead';
import { PersonJsonLd, WebSiteJsonLd } from '../../components/ui/JsonLd';
import { useSettings } from '../../hooks/useSettings';

export default function HomePage() {
  const { settings } = useSettings();

  // Save scroll position before unload, restore after mount
  useEffect(() => {
    const saved = sessionStorage.getItem('homeScrollY');
    if (saved) {
      // Wait for content to render, then scroll
      const timer = setTimeout(() => {
        window.scrollTo(0, parseInt(saved));
        sessionStorage.removeItem('homeScrollY');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('homeScrollY', String(window.scrollY));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <>
      <SEOHead
        title={settings?.seo_title || 'Portfolio'}
        description={settings?.seo_description}
        keywords={settings?.seo_keywords}
        image={settings?.seo_image}
        url={settings?.site_url}
      />
      {settings?.site_url && (
        <WebSiteJsonLd
          name={settings?.hero_name || 'Portfolio'}
          url={settings?.site_url}
          description={settings?.seo_description}
        />
      )}
      {settings?.hero_name && (
        <PersonJsonLd
          name={settings.hero_name}
          url={settings?.site_url}
          jobTitle={settings?.hero_title}
          sameAs={[
            settings?.social_github,
            settings?.social_linkedin,
            settings?.social_twitter,
          ].filter(Boolean)}
        />
      )}
      {settings?.section_hero !== 'false' && <Hero />}
      {settings?.section_about !== 'false' && <About />}
      {settings?.section_skills !== 'false' && <Skills />}
      {settings?.section_projects !== 'false' && <Projects />}
      {settings?.section_contact !== 'false' && <Contact />}
    </>
  );
}
