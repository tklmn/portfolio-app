import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { usePagination } from '../../hooks/usePagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { HiTrash, HiRefresh } from 'react-icons/hi';

const TABS = [
  { key: 'posts', label: 'Blog Posts' },
  { key: 'projects', label: 'Projects' },
  { key: 'skills', label: 'Skills' },
  { key: 'messages', label: 'Messages' },
];

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function TrashPage() {
  const [trash, setTrash] = useState({ posts: [], projects: [], skills: [], messages: [] });
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const VALID_TABS = TABS.map((t) => t.key);
  const activeTab = VALID_TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'posts';
  const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { type, id, label }
  const { addToast } = useToast();

  const fetchTrash = () => {
    api.get('/trash').then((res) => {
      setTrash(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchTrash(); }, []);

  const restore = async (type, id) => {
    try {
      await api.patch(`/trash/${type}/${id}/restore`);
      addToast('Item restored', 'success');
      fetchTrash();
    } catch {
      addToast('Failed to restore item', 'error');
    }
  };

  const permanentDelete = async ({ type, id }) => {
    try {
      await api.delete(`/trash/${type}/${id}`);
      addToast('Permanently deleted', 'success');
      fetchTrash();
    } catch {
      addToast('Failed to delete item', 'error');
    }
  };

  const emptyTrash = async () => {
    try {
      await api.delete('/trash');
      addToast('Trash emptied', 'success');
      fetchTrash();
    } catch {
      addToast('Failed to empty trash', 'error');
    }
  };

  const totalCount = Object.values(trash).reduce((sum, arr) => sum + arr.length, 0);
  const items = trash[activeTab] || [];
  const { currentPage, setCurrentPage, totalPages, paginatedItems } = usePagination(items, 10, { mode: 'state' });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trash</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {totalCount === 0 ? 'Trash is empty' : `${totalCount} item${totalCount !== 1 ? 's' : ''} in trash`}
          </p>
        </div>
        {totalCount > 0 && (
          <button
            onClick={() => setConfirmEmpty(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <HiTrash size={16} /> Empty Trash
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            {trash[tab.key]?.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {trash[tab.key].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <HiTrash size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No trashed {TABS.find((t) => t.key === activeTab)?.label.toLowerCase()}</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Item</th>
                  <th className="px-6 py-3 font-medium hidden sm:table-cell">Deleted</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {paginatedItems.map((item) => (
                  <tr key={item.id} className="text-sm">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {item._label || `#${item.id}`}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell text-xs">
                      {formatDate(item.deleted_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => restore(activeTab, item.id)}
                          title="Restore"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <HiRefresh size={13} /> Restore
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ type: activeTab, id: item.id, label: item._label })}
                          title="Delete permanently"
                          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                          <HiTrash size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages} ({items.length} total)
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
        </>
      )}

      <ConfirmDialog
        open={confirmEmpty}
        title="Empty Trash"
        message={`Permanently delete all ${totalCount} item${totalCount !== 1 ? 's' : ''} in trash? This cannot be undone.`}
        onConfirm={() => { setConfirmEmpty(false); emptyTrash(); }}
        onCancel={() => setConfirmEmpty(false)}
        confirmLabel="Empty Trash"
      />

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete Permanently"
        message={`Permanently delete "${confirmDelete?.label}"? This cannot be undone.`}
        confirmLabel="Delete Permanently"
        onConfirm={() => { const d = confirmDelete; setConfirmDelete(null); permanentDelete(d); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
