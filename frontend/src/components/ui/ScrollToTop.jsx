import { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import { useSettings } from '../../hooks/useSettings';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const { settings } = useSettings();

  const enabled = settings?.scroll_to_top_enabled !== 'false';

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!enabled) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <FiArrowUp size={20} />
    </button>
  );
}
