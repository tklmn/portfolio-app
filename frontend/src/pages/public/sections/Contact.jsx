import { useState } from 'react';
import SectionHeading from '../../../components/ui/SectionHeading';
import { useLanguage } from '../../../context/LanguageContext';
import { useSettings } from '../../../hooks/useSettings';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import api from '../../../api/axios';
import { FiMail, FiMapPin, FiSend } from 'react-icons/fi';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [sending, setSending] = useState(false);
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { ref, isVisible } = useScrollReveal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus({ type: '', message: '' });

    try {
      await api.post('/messages', form);
      setStatus({ type: 'success', message: t('contact.success') });
      setForm({ name: '', email: '', message: '', website: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || t('contact.error') });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('contact.title')} subtitle={t('contact.subtitle')} />

        <div ref={ref} className={`grid lg:grid-cols-5 gap-12 max-w-5xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="lg:col-span-2 space-y-6">
            {settings?.contact_email && (
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500"><FiMail size={24} /></div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{t('contact.email')}</h3>
                  <a href={`mailto:${settings.contact_email}`} className="text-gray-600 dark:text-gray-400 text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    {settings.contact_email}
                  </a>
                </div>
              </div>
            )}
            {settings?.contact_location && (
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500"><FiMapPin size={24} /></div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{t('contact.location')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{settings.contact_location}</p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
            {status.message && (
              <div className={`p-4 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'}`} role="alert" aria-live="assertive">
                {status.message}
              </div>
            )}

            {/* Honeypot — hidden from humans, bots fill it in */}
            <div className="absolute opacity-0 -z-10" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input id="contact-website" type="text" name="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="sr-only">{t('contact.name')}</label>
                <input id="contact-name" type="text" placeholder={t('contact.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label htmlFor="contact-email" className="sr-only">{t('contact.email')}</label>
                <input id="contact-email" type="email" placeholder={t('contact.email')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
            </div>

            <div>
              <label htmlFor="contact-message" className="sr-only">{t('contact.message')}</label>
              <textarea id="contact-message" placeholder={t('contact.message')} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" />
            </div>

            <button type="submit" disabled={sending} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              <FiSend size={18} />
              {sending ? t('contact.sending') : t('contact.send')}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
