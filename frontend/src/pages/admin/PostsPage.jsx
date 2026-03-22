import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { usePagination } from '../../hooks/usePagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { HiPlus, HiPencil, HiTrash, HiX, HiEye, HiEyeOff } from 'react-icons/hi';
import { useToast } from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import I18nField from '../../components/ui/I18nField';
import { displayName } from '../../utils/displayName';

const emptyForm = { title: '', slug: '', content: '', excerpt: '', tags: '', published: false };

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [languages, setLanguages] = useState(['en', 'de']);
  const [showAll, setShowAll] = useState(false);
  const { currentPage, setCurrentPage, totalPages: hookTotalPages, paginatedItems } = usePagination(posts, 10, { mode: 'url' });
  const perPage = 10;
  const { addToast } = useToast();

  const fetchPosts = () => {
    api.get('/posts/admin/all').then((res) => {
      setPosts(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
    api.get('/settings').then((res) => {
      const langs = (res.data.languages || 'en,de').split(',').map((l) => l.trim());
      setLanguages(langs);
    });
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (post) => {
    setEditing(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content || '',
      excerpt: post.excerpt || '',
      tags: post.tags || '',
      published: !!post.published,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/posts/${editing}`, form);
      } else {
        await api.post('/posts', form);
      }
      setShowModal(false);
      fetchPosts();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error saving post', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/posts/${id}`);
    addToast('Post deleted', 'success');
    setConfirmDelete(null);
    fetchPosts();
  };

  const togglePublish = async (post) => {
    await api.put(`/posts/${post.id}`, { published: !post.published });
    fetchPosts();
  };

  if (loading) return <LoadingSpinner />;

  const totalPages = showAll ? 1 : hookTotalPages;
  const displayedPosts = showAll ? posts : paginatedItems;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Posts</h1>
          {posts.length > perPage && (
            <button onClick={() => { setShowAll(!showAll); setCurrentPage(1); }} className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mt-1">
              {showAll ? `Show paginated (${perPage}/page)` : `Show all (${posts.length})`}
            </button>
          )}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
        >
          <HiPlus size={18} /> New Post
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium hidden sm:table-cell">Slug</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {displayedPosts.map((post) => (
                <tr key={post.id} className="text-sm">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{displayName(post.title)}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell font-mono text-xs">
                    {post.slug}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePublish(post)}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                        post.published
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                      }`}
                    >
                      {post.published ? <><HiEye size={12} /> Published</> : <><HiEyeOff size={12} /> Draft</>}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(post)} className="p-2 text-gray-500 hover:text-blue-500 transition-colors">
                        <HiPencil size={16} />
                      </button>
                      <button onClick={() => setConfirmDelete(post.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                        <HiTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages} ({posts.length} total)
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editing ? 'Edit Post' : 'New Post'}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (auto-generated if empty)</label>
                <input
                  type="text" value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="my-blog-post"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt</label>
                <I18nField value={form.excerpt} onChange={(v) => setForm({ ...form, excerpt: v })} languages={languages} type="textarea" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content (Markdown)</label>
                <I18nField value={form.content} onChange={(v) => setForm({ ...form, content: v })} languages={languages} type="textarea" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="React, JavaScript, Tutorial"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Published</span>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, published: !form.published })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.published ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.published ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Update Post' : 'Create Post'}
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
        title="Delete Post"
        message="This post will be moved to trash and can be restored later."
        confirmLabel="Move to Trash"
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
