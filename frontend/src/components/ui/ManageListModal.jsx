import { useState } from 'react';
import { HiX, HiPlus, HiTrash } from 'react-icons/hi';

/**
 * ManageListModal — modal to view, add, and delete items in a list.
 *
 * Props:
 *  - open: boolean
 *  - onClose(): void
 *  - title: string (e.g. "Manage Tags")
 *  - items: { id: number|string, name: string, count?: number }[]
 *  - onAdd(name: string): Promise
 *  - onDelete(item): Promise
 */
export default function ManageListModal({ open, onClose, title, items = [], onAdd, onDelete }) {
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);

  if (!open) return null;

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || adding) return;
    setAdding(true);
    try {
      await onAdd(name);
      setNewName('');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (item) => {
    setDeleting(item.id ?? item.name);
    try {
      await onDelete(item);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <HiX size={20} />
          </button>
        </div>

        {/* Add new */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New name..."
            className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            disabled={!newName.trim() || adding}
            className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <HiPlus size={16} />
            Add
          </button>
        </form>

        {/* List */}
        <div className="max-h-64 overflow-y-auto space-y-1">
          {items.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No items yet</p>
          )}
          {items.map((item) => (
            <div
              key={item.id ?? item.name}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 dark:text-white">{item.name}</span>
                {item.count !== undefined && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">({item.count})</span>
                )}
              </div>
              <button
                onClick={() => handleDelete(item)}
                disabled={deleting === (item.id ?? item.name)}
                className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
              >
                <HiTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
