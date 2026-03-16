import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { RiTwitterXFill } from 'react-icons/ri';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../hooks/useSettings';

export default function Footer() {
  const { t } = useLanguage();
  const { settings, ts } = useSettings();

  const socialLinks = [
    { icon: FiGithub, href: settings?.social_github, label: 'GitHub' },
    { icon: FiLinkedin, href: settings?.social_linkedin, label: 'LinkedIn' },
    { icon: RiTwitterXFill, href: settings?.social_x, label: 'X' },
    { icon: FiMail, href: settings?.contact_email ? `mailto:${settings.contact_email}` : null, label: 'Email' },
  ].filter((s) => s.href);

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all duration-300 hover:scale-110"
                aria-label={social.label}
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-400 dark:via-gray-600 to-transparent" />
          <div className="text-center text-sm text-gray-500 dark:text-gray-500">
            <p>{ts('footer_copyright') || `\u00A9 ${new Date().getFullYear()} Portfolio. ${t('footer.rights')}`}</p>
            {ts('footer_subline') && <p className="mt-1">{ts('footer_subline')}</p>}
            {!ts('footer_subline') && <p className="mt-1">{t('footer.built_with')}</p>}
          </div>
        </div>
      </div>
    </footer>
  );
}
