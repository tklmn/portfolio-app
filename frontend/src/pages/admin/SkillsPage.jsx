import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { usePagination } from '../../hooks/usePagination';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AutocompleteChipPicker from '../../components/ui/AutocompleteChipPicker';
import ManageListModal from '../../components/ui/ManageListModal';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';
import { HiMiniArrowsUpDown } from 'react-icons/hi2';
import { useToast } from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const emptyForm = { name: '', category: '', level: 50, icon: '', sort_order: 0 };

function SortableRow({ skill, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: skill.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="text-sm bg-white dark:bg-gray-900">
      <td className="px-3 py-4 w-10">
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <HiMiniArrowsUpDown size={16} />
        </button>
      </td>
      <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
        <div className="flex items-center gap-2">
          {skill.icon && <Icon icon={skill.icon} width={18} height={18} className="text-gray-500 dark:text-gray-400 shrink-0" />}
          {skill.name}
        </div>
      </td>
      <td className="px-4 py-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
        {skill.category && <span className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800">{skill.category}</span>}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
              style={{ width: `${skill.level}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{skill.level}%</span>
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex justify-end gap-1">
          <button onClick={() => onEdit(skill)} className="p-2 text-gray-500 hover:text-blue-500 transition-colors">
            <HiPencil size={16} />
          </button>
          <button onClick={() => onDelete(skill.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
            <HiTrash size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { currentPage, setCurrentPage, totalPages: hookTotalPages, paginatedItems } = usePagination(skills, 10, { mode: 'url' });
  const perPage = 10;
  const { addToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchSkills = () => {
    api.get('/skills').then((res) => {
      setSkills(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const fetchCategories = () => {
    api.get('/settings').then((res) => {
      const cats = (res.data.skill_categories || '').split(',').map((c) => c.trim()).filter(Boolean);
      setCategories(cats);
    });
  };

  useEffect(() => {
    fetchSkills();
    fetchCategories();
  }, []);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = skills.findIndex((s) => s.id === active.id);
    const newIndex = skills.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(skills, oldIndex, newIndex);

    // Optimistic update
    setSkills(reordered);

    // Send new order to backend
    const updates = reordered.map((item, index) => ({ id: item.id, sort_order: index + 1 }));
    try {
      const { data } = await api.patch('/skills/reorder', updates);
      setSkills(data);
    } catch {
      addToast('Failed to save order', 'error');
      fetchSkills();
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, sort_order: skills.length + 1 });
    setShowModal(true);
  };

  const openEdit = (skill) => {
    setEditing(skill.id);
    setForm({
      name: skill.name,
      category: skill.category || '',
      level: skill.level || 50,
      icon: skill.icon || '',
      sort_order: skill.sort_order || 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/skills/${editing}`, form);
      } else {
        await api.post('/skills', form);
      }
      setShowModal(false);
      fetchSkills();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error saving skill', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/skills/${id}`);
    addToast('Skill deleted', 'success');
    setConfirmDelete(null);
    fetchSkills();
  };

  if (loading) return <LoadingSpinner />;

  const totalPages = showAll ? 1 : hookTotalPages;
  const displayedSkills = showAll ? skills : paginatedItems;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Skills</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag rows to reorder</p>
          {skills.length > perPage && (
            <button onClick={() => { setShowAll(!showAll); setCurrentPage(1); }} className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mt-1">
              {showAll ? `Show paginated (${perPage}/page)` : `Show all (${skills.length})`}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManageCategories(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            Manage Categories
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
          >
            <HiPlus size={18} /> Add Skill
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-3 py-3 w-10"></th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 font-medium">Level</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={displayedSkills.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {displayedSkills.map((skill) => (
                    <SortableRow
                      key={skill.id}
                      skill={skill}
                      onEdit={openEdit}
                      onDelete={(id) => setConfirmDelete(id)}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages} ({skills.length} total)</p>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${currentPage === page ? 'bg-blue-500 text-white' : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editing ? 'Edit Skill' : 'New Skill'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <HiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <AutocompleteChipPicker
                  value={form.category}
                  onChange={(v) => {
                    // Only keep the last selected (single category)
                    const parts = v.split(',').map((s) => s.trim()).filter(Boolean);
                    setForm({ ...form, category: parts[parts.length - 1] || '' });
                  }}
                  suggestions={categories}
                  onCreateNew={async (name) => {
                    const updated = [...categories, name];
                    setCategories(updated);
                    await api.put('/settings', { skill_categories: updated.join(',') });
                  }}
                  placeholder="Select or create category..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Level: {form.level}%
                </label>
                <input
                  type="range" min="0" max="100" value={form.level}
                  onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text" value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="simple-icons:react"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {form.icon && (
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <Icon icon={form.icon} width={24} height={24} className="text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Browse 200K+ icons at{' '}
                  <a href="https://icon-sets.iconify.design/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">icon-sets.iconify.design</a>
                  {' '}&mdash; use format like <code className="text-xs">simple-icons:react</code>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Update Skill' : 'Create Skill'}
                </button>
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete Skill"
        message="This skill will be moved to trash and can be restored later."
        confirmLabel="Move to Trash"
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />

      <ManageListModal
        open={showManageCategories}
        onClose={() => setShowManageCategories(false)}
        title="Manage Skill Categories"
        items={categories.map((c) => ({ name: c, count: skills.filter((s) => s.category === c).length }))}
        onAdd={async (name) => {
          const updated = [...categories, name];
          setCategories(updated);
          await api.put('/settings', { skill_categories: updated.join(',') });
        }}
        onDelete={async (item) => {
          const updated = categories.filter((c) => c !== item.name);
          setCategories(updated);
          await api.put('/settings', { skill_categories: updated.join(',') });
        }}
      />
    </div>
  );
}
