import { useState, useEffect, useMemo } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import I18nField from '../../components/ui/I18nField';
import SettingsI18nField from '../../components/ui/SettingsI18nField';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';
import { HiMiniArrowsUpDown } from 'react-icons/hi2';
import { displayName } from '../../utils/displayName';

function SortableRow({ entry, onEdit, onDelete, dragEnabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id, disabled: !dragEnabled });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <tr ref={setNodeRef} style={style} className="text-sm bg-white dark:bg-gray-900">
      <td className="px-3 py-4 w-10">
        {dragEnabled ? (
          <button {...attributes} {...listeners} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing touch-none" aria-label="Drag to reorder">
            <HiMiniArrowsUpDown size={16} />
          </button>
        ) : (
          <span className="p-1 text-gray-200 dark:text-gray-700"><HiMiniArrowsUpDown size={16} /></span>
        )}
      </td>
      <td className="px-4 py-4 font-medium text-blue-500 whitespace-nowrap">
        {entry.year}{entry.is_current ? ' — Present' : entry.year_end ? ` — ${entry.year_end}` : ''}
      </td>
      <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{displayName(entry.title)}</td>
      <td className="px-4 py-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{displayName(entry.company)}</td>
      <td className="px-4 py-4 text-right">
        <div className="flex justify-end gap-1">
          <button onClick={() => onEdit(entry)} className="p-2 text-gray-500 hover:text-blue-500 transition-colors"><HiPencil size={16} /></button>
          <button onClick={() => onDelete(entry.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><HiTrash size={16} /></button>
        </div>
      </td>
    </tr>
  );
}

export default function AboutPage() {
  const [settings, setSettings] = useState({});
  const [timeline, setTimeline] = useState([]);
  const [languages, setLanguages] = useState(['en', 'de']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ year: '', year_end: '', is_current: false, title: '{}', company: '{}', description: '{}', icon: 'briefcase' });
  const [formSaving, setFormSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { addToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchData = async () => {
    const [aboutRes, settingsRes] = await Promise.all([
      api.get('/about'),
      api.get('/settings'),
    ]);
    setSettings(aboutRes.data.settings);
    setTimeline(aboutRes.data.timeline);
    // Read configured languages
    const langs = (settingsRes.data.languages || 'en,de').split(',').map((l) => l.trim());
    setLanguages(langs);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- Sorting ---
  const sortByYear = (items) => [...items].sort((a, b) => {
    const yearCmp = b.year.localeCompare(a.year);
    if (yearCmp !== 0) return yearCmp;
    return b.id - a.id; // newest entry first within same year
  });

  const sortByOrder = (items) => [...items].sort((a, b) => a.sort_order - b.sort_order);

  // If any entry has sort_order > 0, all have been manually sorted
  const isManual = timeline.some((t) => t.sort_order > 0);
  const displayTimeline = useMemo(() => {
    return isManual ? sortByOrder(timeline) : sortByYear(timeline);
  }, [timeline, isManual]);

  // --- Bio & Stats ---
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      addToast('About section saved', 'success');
    } catch {
      addToast('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  // --- Timeline CRUD ---
  const openCreate = () => {
    setEditing(null);
    setForm({ year: '', year_end: '', is_current: false, title: '{}', company: '{}', description: '{}', icon: 'briefcase' });
    setShowModal(true);
  };

  const openEdit = (entry) => {
    setEditing(entry.id);
    setForm({
      year: entry.year,
      year_end: entry.year_end || '',
      is_current: !!entry.is_current,
      title: entry.title || '{}',
      company: entry.company || '{}',
      description: entry.description || '{}',
      icon: entry.icon || 'briefcase',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSaving(true);
    try {
      if (editing) {
        await api.put(`/about/timeline/${editing}`, { ...form, sort_order: 0 });
      } else {
        await api.post('/about/timeline', { ...form, sort_order: 0 });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error saving entry', 'error');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/about/timeline/${id}`);
    addToast('Entry deleted', 'success');
    setConfirmDelete(null);
    fetchData();
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const source = displayTimeline;
    const oldIndex = source.findIndex((t) => t.id === active.id);
    const newIndex = source.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(source, oldIndex, newIndex);
    setTimeline(reordered);

    const updates = reordered.map((item, index) => ({ id: item.id, sort_order: index + 1 }));
    try {
      const { data } = await api.patch('/about/timeline/reorder', updates);
      setTimeline(data);
    } catch {
      addToast('Failed to save order', 'error');
      fetchData();
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings(); }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">About Section</h1>
          <button type="submit" disabled={saving} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      {/* Biography */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Biography</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Heading</label>
            <SettingsI18nField settingsKey="about_heading" settings={settings} onChange={setSettings} languages={languages} />
          </div>
          {[
            { key: 'about_bio', label: 'Paragraph 1' },
            { key: 'about_bio_2', label: 'Paragraph 2 (optional)' },
            { key: 'about_bio_3', label: 'Paragraph 3 (optional)' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
              <SettingsI18nField settingsKey={field.key} settings={settings} onChange={setSettings} languages={languages} type="textarea" />
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stats</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Stat {n}</p>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Value</label>
                <input type="text" value={settings[`about_stat_${n}_value`] || ''} onChange={(e) => setSettings({ ...settings, [`about_stat_${n}_value`]: e.target.value })} placeholder="5+" className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Label</label>
                <SettingsI18nField settingsKey={`about_stat_${n}_label`} settings={settings} onChange={setSettings} languages={languages} />
              </div>
            </div>
          ))}
        </div>
      </div>
      </form>

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Timeline</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Sorted by year. Drag to override.</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all">
            <HiPlus size={16} /> Add Entry
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-3 py-3 w-10"></th>
                <th className="px-4 py-3 font-medium">Year</th>
                <th className="px-4 py-3 font-medium">Title (EN)</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Company (EN)</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={displayTimeline.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {displayTimeline.map((entry) => (
                    <SortableRow key={entry.id} entry={entry} onEdit={openEdit} onDelete={(id) => setConfirmDelete(id)} dragEnabled={true} />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Entry' : 'New Entry'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><HiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start *</label>
                  <input type="text" required value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End</label>
                  <input type="text" value={form.is_current ? '' : form.year_end} onChange={(e) => setForm({ ...form, year_end: e.target.value })} placeholder="2026" disabled={form.is_current} className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-40" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_current: !form.is_current, year_end: '' })}
                      className={`relative w-9 h-5 rounded-full transition-colors ${form.is_current ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_current ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Current</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
                <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none">
                  <option value="briefcase">Briefcase — Job / Position</option>
                  <option value="graduation">Graduation — Degree / Study</option>
                  <option value="certificate">Certificate — Certification</option>
                  <option value="award">Award — Prize / Achievement</option>
                  <option value="book">Book — Education / Course</option>
                  <option value="school">School — School / Training</option>
                  <option value="rocket">Rocket — Startup / Launch</option>
                  <option value="code">Code — Development / Technical</option>
                  <option value="globe">Globe — Remote / International</option>
                  <option value="heart">Heart — Volunteering / Social</option>
                  <option value="star">Star — Highlight / Special</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <I18nField value={form.title} onChange={(v) => setForm({ ...form, title: v })} languages={languages} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company *</label>
                <I18nField value={form.company} onChange={(v) => setForm({ ...form, company: v })} languages={languages} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <I18nField value={form.description} onChange={(v) => setForm({ ...form, description: v })} languages={languages} type="textarea" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={formSaving} className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
                  {formSaving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Delete Entry" message="Delete this timeline entry?" onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
