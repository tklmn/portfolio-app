import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { HiOutlineCollection, HiOutlineLightningBolt, HiOutlineMail, HiOutlineDocumentText, HiOutlineCog, HiOutlineEye } from 'react-icons/hi';
import { FiExternalLink, FiClock, FiMail, FiAlertCircle } from 'react-icons/fi';
import { displayName } from '../../utils/displayName';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch each independently so one failure doesn't block others
    const fetches = {
      projects: api.get('/projects').then((r) => r.data.length).catch(() => '?'),
      skills: api.get('/skills').then((r) => r.data.length).catch(() => '?'),
      messages: api.get('/messages').then((r) => {
        const msgs = r.data;
        setRecentMessages(msgs.slice(0, 3));
        return msgs.length;
      }).catch(() => '?'),
      posts: api.get('/posts/admin/all').then((r) => {
        setRecentPosts(r.data.slice(0, 3));
        return r.data.length;
      }).catch(() => '?'),
      unread: api.get('/messages').then((r) => r.data.filter((m) => !m.read).length).catch(() => 0),
    };

    Promise.all(Object.values(fetches)).then((results) => {
      const keys = Object.keys(fetches);
      const data = {};
      keys.forEach((key, i) => { data[key] = results[i]; });
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  const cards = [
    { title: 'Projects', count: stats?.projects ?? '?', icon: HiOutlineCollection, color: 'blue', href: '/admin/projects' },
    { title: 'Skills', count: stats?.skills ?? '?', icon: HiOutlineLightningBolt, color: 'purple', href: '/admin/skills' },
    { title: 'Messages', count: stats?.messages ?? '?', icon: HiOutlineMail, color: 'green', href: '/admin/messages', badge: stats?.unread > 0 ? stats.unread : null },
    { title: 'Blog Posts', count: stats?.posts ?? '?', icon: HiOutlineDocumentText, color: 'orange', href: '/admin/posts' },
  ];

  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name || 'Admin'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's an overview of your portfolio</p>
        </div>
        <div className="flex gap-2">
          <Link to="/" target="_blank" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <HiOutlineEye size={16} /> View Site
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <HiOutlineCog size={16} /> Settings
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.href}
            className="relative bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${colorMap[card.color]}`}>
                <card.icon size={24} />
              </div>
              {card.badge && (
                <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">{card.badge}</span>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{card.count}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.title}</div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Messages</h2>
            <Link to="/admin/messages" className="text-sm text-blue-500 hover:text-blue-600">View all</Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">No messages yet</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className={`p-2 rounded-full ${msg.read ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                    <FiMail size={14} className={msg.read ? 'text-gray-400' : 'text-blue-500'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${msg.read ? 'text-gray-600 dark:text-gray-400' : 'font-medium text-gray-900 dark:text-white'}`}>{msg.name}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{new Date(msg.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-0.5">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Posts */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Posts</h2>
            <Link to="/admin/posts" className="text-sm text-blue-500 hover:text-blue-600">View all</Link>
          </div>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">No posts yet</p>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className={`p-2 rounded-full ${post.published ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                    <FiAlertCircle size={14} className={post.published ? 'text-green-500' : 'text-yellow-500'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{displayName(post.title)}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${post.published ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'}`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <FiClock size={10} className="text-gray-400" />
                      <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'New Project', href: '/admin/projects', icon: HiOutlineCollection },
            { label: 'New Blog Post', href: '/admin/posts', icon: HiOutlineDocumentText },
            { label: 'Edit About', href: '/admin/about', icon: HiOutlineEye },
            { label: 'Site Settings', href: '/admin/settings', icon: HiOutlineCog },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <action.icon size={16} />
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
