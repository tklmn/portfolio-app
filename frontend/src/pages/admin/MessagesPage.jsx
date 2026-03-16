import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { usePagination } from '../../hooks/usePagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { HiTrash, HiMail, HiMailOpen } from 'react-icons/hi';
import { useToast } from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { currentPage, setCurrentPage, totalPages, paginatedItems: displayedMessages } = usePagination(messages, 10, { mode: 'url' });
  const { addToast } = useToast();

  const fetchMessages = () => {
    api.get('/messages').then((res) => {
      setMessages(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const markAsRead = async (id) => {
    await api.patch(`/messages/${id}/read`);
    fetchMessages();
  };

  const handleDelete = async (id) => {
    await api.delete(`/messages/${id}`);
    addToast('Message deleted', 'success');
    if (selected?.id === id) setSelected(null);
    setConfirmDelete(null);
    fetchMessages();
  };

  const openMessage = (msg) => {
    setSelected(msg);
    if (!msg.read) markAsRead(msg.id);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {messages.filter((m) => !m.read).length} unread messages
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Messages list */}
        <div className="lg:col-span-2 space-y-2">
          {messages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No messages yet</p>
          ) : (
            displayedMessages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected?.id === msg.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {msg.read ? (
                      <HiMailOpen className="text-gray-400 flex-shrink-0" size={16} />
                    ) : (
                      <HiMail className="text-blue-500 flex-shrink-0" size={16} />
                    )}
                    <span className={`text-sm truncate ${!msg.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                      {msg.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">{msg.email}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">{msg.message}</p>
              </button>
            ))
          )}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 mt-3">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`px-2.5 py-1 text-xs rounded-md transition-colors ${currentPage === page ? 'bg-blue-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{page}</button>
              ))}
            </div>
          )}
        </div>

        {/* Message detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selected.name}</h2>
                  <a href={`mailto:${selected.email}`} className="text-sm text-blue-500 hover:underline">
                    {selected.email}
                  </a>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDelete(selected.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Delete message"
                >
                  <HiTrash size={18} />
                </button>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-12 border border-gray-200 dark:border-gray-800 text-center">
              <HiMail className="mx-auto text-gray-300 dark:text-gray-700" size={48} />
              <p className="text-gray-500 dark:text-gray-400 mt-4">Select a message to read</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete Message"
        message="This message will be moved to trash and can be restored later."
        confirmLabel="Move to Trash"
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
