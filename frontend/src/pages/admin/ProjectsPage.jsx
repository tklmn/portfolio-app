import { useState, useEffect } from 'react';
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
import I18nField from '../../components/ui/I18nField';
import AutocompleteChipPicker from '../../components/ui/AutocompleteChipPicker';
import ManageListModal from '../../components/ui/ManageListModal';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';
import { HiMiniArrowsUpDown } from 'react-icons/hi2';
import { useToast } from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { displayName } from '../../utils/displayName';

const emptyForm = {
  title: '', description: '', tech_stack: '', github_url: '', demo_url: '', category: '', featured: false, sort_order: 0,
};

function SortableRow({ project, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
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
      <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{displayName(project.title)}</td>
      <td className="px-4 py-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
        <div className="flex flex-wrap gap-1">
          {project.tech_stack?.split(',').slice(0, 3).map((t) => (
            <span key={t} className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800">
              {t.trim()}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        {project.featured ? (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
            Featured
          </span>
        ) : (
          <span className="text-gray-400 text-xs">No</span>
        )}
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex justify-end gap-1">
          <button onClick={() => onEdit(project)} className="p-2 text-gray-500 hover:text-blue-500 transition-colors">
            <HiPencil size={16} />
          </button>
          <button onClick={() => onDelete(project.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
            <HiTrash size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [languages, setLanguages] = useState(['en', 'de']);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [projectCategories, setProjectCategories] = useState([]);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { currentPage, setCurrentPage, totalPages: hookTotalPages, paginatedItems } = usePagination(projects, 10, { mode: 'url' });
  const perPage = 10;
  const { addToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchProjects = () => {
    api.get('/projects').then((res) => {
      setProjects(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const fetchSettings = () => {
    api.get('/settings').then((res) => {
      const langs = (res.data.languages || 'en,de').split(',').map((l) => l.trim());
      setLanguages(langs);
      const cats = (res.data.project_categories || '').split(',').map((c) => c.trim()).filter(Boolean);
      setProjectCategories(cats);
    });
  };

  useEffect(() => {
    fetchProjects();
    fetchSettings();
  }, []);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(projects, oldIndex, newIndex);

    setProjects(reordered);

    const updates = reordered.map((item, index) => ({ id: item.id, sort_order: index + 1 }));
    try {
      const { data } = await api.patch('/projects/reorder', updates);
      setProjects(data);
    } catch {
      addToast('Failed to save order', 'error');
      fetchProjects();
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, sort_order: projects.length + 1 });
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (project) => {
    setEditing(project.id);
    setForm({
      title: project.title,
      description: project.description || '',
      tech_stack: project.tech_stack || '',
      category: project.category || '',
      github_url: project.github_url || '',
      demo_url: project.demo_url || '',
      featured: !!project.featured,
      sort_order: project.sort_order || 0,
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    if (imageFile) formData.append('image', imageFile);

    try {
      if (editing) {
        await api.put(`/projects/${editing}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error saving project', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/projects/${id}`);
    addToast('Project deleted', 'success');
    setConfirmDelete(null);
    fetchProjects();
  };

  if (loading) return <LoadingSpinner />;

  const totalPages = showAll ? 1 : hookTotalPages;
  const displayedProjects = showAll ? projects : paginatedItems;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag rows to reorder</p>
          {projects.length > perPage && (
            <button onClick={() => { setShowAll(!showAll); setCurrentPage(1); }} className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mt-1">
              {showAll ? `Show paginated (${perPage}/page)` : `Show all (${projects.length})`}
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
            <HiPlus size={18} /> Add Project
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-3 py-3 w-10"></th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Tech Stack</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Featured</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={displayedProjects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {displayedProjects.map((project) => (
                    <SortableRow
                      key={project.id}
                      project={project}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages} ({projects.length} total)
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${currentPage === page ? 'bg-blue-500 text-white' : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editing ? 'Edit Project' : 'New Project'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <HiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <I18nField value={form.title} onChange={(v) => setForm({ ...form, title: v })} languages={languages} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <I18nField value={form.description} onChange={(v) => setForm({ ...form, description: v })} languages={languages} type="textarea" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tech Stack</label>
                <AutocompleteChipPicker
                  value={form.tech_stack}
                  onChange={(v) => setForm({ ...form, tech_stack: v })}
                  suggestions={[...new Set(projects.flatMap((p) => (p.tech_stack || '').split(',').map((t) => t.trim()).filter(Boolean)))]}
                  placeholder="Add technologies..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <AutocompleteChipPicker
                  value={form.category}
                  onChange={(v) => {
                    const parts = v.split(',').map((s) => s.trim()).filter(Boolean);
                    setForm({ ...form, category: parts[parts.length - 1] || '' });
                  }}
                  suggestions={projectCategories}
                  onCreateNew={async (name) => {
                    const updated = [...projectCategories, name];
                    setProjectCategories(updated);
                    await api.put('/settings', { project_categories: updated.join(',') });
                  }}
                  placeholder="Select or create category..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub URL</label>
                  <input
                    type="url" value={form.github_url}
                    onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Demo URL</label>
                  <input
                    type="url" value={form.demo_url}
                    onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
                <input
                  type="file" accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-600 dark:file:text-blue-400"
                />
              </div>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured</span>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, featured: !form.featured })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.featured ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Update Project' : 'Create Project'}
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
        title="Delete Project"
        message="This project will be moved to trash and can be restored later."
        confirmLabel="Move to Trash"
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />

      <ManageListModal
        open={showManageCategories}
        onClose={() => setShowManageCategories(false)}
        title="Manage Project Categories"
        items={projectCategories.map((c) => ({ name: c, count: projects.filter((p) => p.category === c).length }))}
        onAdd={async (name) => {
          const updated = [...projectCategories, name];
          setProjectCategories(updated);
          await api.put('/settings', { project_categories: updated.join(',') });
        }}
        onDelete={async (item) => {
          const updated = projectCategories.filter((c) => c !== item.name);
          setProjectCategories(updated);
          await api.put('/settings', { project_categories: updated.join(',') });
        }}
      />
    </div>
  );
}
