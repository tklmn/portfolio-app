import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import SettingsI18nField from '../../components/ui/SettingsI18nField';

// Fields with i18n: true get tabbed language inputs
const sections = [
  {
    title: 'Site',
    fields: [
      { key: 'site_logo_text', label: 'Logo / Brand Text', type: 'text' },
    ],
  },
  {
    title: 'Sections',
    description: 'Enable or disable sections on the public website. Disabled sections are hidden from the page and the navigation.',
    fields: [
      { key: 'section_hero', label: 'Hero', type: 'toggle' },
      { key: 'section_about', label: 'About', type: 'toggle' },
      { key: 'section_skills', label: 'Skills', type: 'toggle' },
      { key: 'section_projects', label: 'Projects', type: 'toggle' },
      { key: 'section_blog', label: 'Blog', type: 'toggle' },
      { key: 'section_contact', label: 'Contact', type: 'toggle' },
    ],
  },
  {
    title: 'Hero Section',
    fields: [
      { key: 'hero_name', label: 'Name', type: 'text' },
      { key: 'hero_title', label: 'Job Title', type: 'text', i18n: true },
      { key: 'hero_subtitle', label: 'Introduction Text', type: 'textarea', i18n: true },
      { key: 'hero_image', label: 'Profile Image URL (or /uploads/... path)', type: 'text' },
      { key: 'hero_badge_enabled', label: 'Experience Badge Visible', type: 'toggle' },
      { key: 'hero_badge_text', label: 'Badge Text', type: 'text', i18n: true },
    ],
  },
  {
    title: 'Footer',
    fields: [
      { key: 'footer_copyright', label: 'Copyright Line', type: 'text', i18n: true },
      { key: 'footer_subline', label: 'Subline (e.g. "Built with...")', type: 'text', i18n: true },
    ],
  },
  {
    title: 'Social Links',
    fields: [
      { key: 'social_github', label: 'GitHub URL', type: 'url' },
      { key: 'social_linkedin', label: 'LinkedIn URL', type: 'url' },
      { key: 'social_x', label: 'X (formerly Twitter) URL', type: 'url' },
    ],
  },
  {
    title: 'Contact Info',
    fields: [
      { key: 'contact_email', label: 'Contact Email', type: 'email' },
      { key: 'contact_location', label: 'Location', type: 'text' },
    ],
  },
  {
    title: 'SEO Settings',
    fields: [
      { key: 'seo_title', label: 'SEO Title', type: 'text' },
      { key: 'seo_description', label: 'SEO Description', type: 'textarea' },
      { key: 'seo_keywords', label: 'SEO Keywords', type: 'text' },
      { key: 'site_url', label: 'Site URL', type: 'url' },
    ],
  },
  {
    title: 'UI Settings',
    fields: [
      { key: 'scroll_to_top_enabled', label: 'Scroll-to-Top Button', type: 'toggle' },
      { key: 'pagination_projects_per_page', label: 'Projects per Page', type: 'text' },
      { key: 'pagination_projects', label: 'Show Project Pagination Controls', type: 'toggle', defaultOn: false },
    ],
  },
  {
    title: 'Blog Post Display',
    description: 'Control pagination and which meta information is shown on the blog list and individual post pages.',
    fields: [
      { key: 'pagination_posts_per_page', label: 'Posts per Page', type: 'text' },
      { key: 'pagination_posts', label: 'Show Pagination Controls', type: 'toggle', defaultOn: false },
      { key: 'blog_show_date', label: 'Show Post Date', type: 'toggle' },
      { key: 'blog_show_reading_time', label: 'Show Reading Time', type: 'toggle' },
    ],
  },
  {
    title: 'Languages',
    description: 'Comma-separated language codes. Add a new language by adding its code here (e.g. en,de,fr). Then create the matching translation file at src/i18n/fr.json.',
    fields: [
      { key: 'languages', label: 'Active Languages', type: 'text' },
    ],
  },
  {
    title: 'GitHub Integration',
    fields: [
      { key: 'github_username', label: 'GitHub Username (for repo import)', type: 'text' },
    ],
  },
];

function ToggleField({ field, settings, setSettings }) {
  const isOn = settings[field.key] !== undefined ? settings[field.key] === 'true' : field.defaultOn !== false;
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</span>
      <button
        type="button"
        onClick={() => setSettings({ ...settings, [field.key]: isOn ? 'false' : 'true' })}
        className={`relative w-11 h-6 rounded-full transition-colors ${isOn ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </label>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [languages, setLanguages] = useState(['en', 'de']);
  const { addToast } = useToast();

  useEffect(() => {
    api.get('/settings').then((res) => {
      setSettings(res.data);
      const langs = (res.data.languages || 'en,de').split(',').map((l) => l.trim());
      setLanguages(langs);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/settings', settings);
      setSettings(data);
      addToast('Settings saved successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

  const renderField = (key, type, placeholder) => {
    if (type === 'textarea') {
      return (
        <textarea rows={3} value={settings[key] || ''} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} placeholder={placeholder} className={`${inputClass} resize-none`} />
      );
    }
    return (
      <input type={type} value={settings[key] || ''} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} placeholder={placeholder} className={inputClass} />
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Site Settings</h1>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{section.title}</h2>
            {section.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{section.description}</p>
            )}
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  {field.type === 'toggle' ? (
                    <ToggleField field={field} settings={settings} setSettings={setSettings} />
                  ) : field.i18n ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                      <SettingsI18nField
                        settingsKey={field.key}
                        settings={settings}
                        onChange={setSettings}
                        languages={languages}
                        type={field.type}
                      />
                    </div>
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                      {renderField(field.key, field.type)}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </form>
  );
}
