import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import { FiStar, FiGitBranch, FiDownload, FiRefreshCw, FiCheck, FiTrash2 } from 'react-icons/fi';

export default function GitHubImportPage() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(null);
  const [hasUsername, setHasUsername] = useState(false);
  const { addToast } = useToast();

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/github/repos');
      setRepos(data);
      setHasUsername(true);
    } catch {
      setHasUsername(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRepos(); }, []);

  const handleRemove = async (repo) => {
    setImporting(repo.id);
    try {
      await api.delete(`/github/import`, { data: { github_url: repo.html_url } });
      setRepos((prev) => prev.map((r) => r.id === repo.id ? { ...r, import_status: null } : r));
      addToast(`"${repo.name}" removed from projects`, 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Remove failed', 'error');
    } finally {
      setImporting(null);
    }
  };

  const handleImport = async (repo) => {
    setImporting(repo.id);
    try {
      await api.post('/github/import', repo);
      setRepos((prev) => prev.map((r) => r.id === repo.id ? { ...r, import_status: 'imported' } : r));
      addToast(`"${repo.name}" imported as project`, 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Import failed', 'error');
    } finally {
      setImporting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GitHub Import</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Import repositories from GitHub as portfolio projects
          </p>
        </div>
        <button
          onClick={fetchRepos}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {!hasUsername && !loading && repos.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-300 text-sm">
            Set your GitHub username in <strong>Settings</strong> first to import repositories.
          </p>
        </div>
      )}

      {loading && <LoadingSpinner />}

      {!loading && repos.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{repo.name}</h3>
                    {repo.import_status === 'imported' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Imported</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {repo.description || 'No description'}
                  </p>
                </div>
                {repo.import_status === 'imported' ? (
                  <button
                    onClick={() => handleRemove(repo)}
                    disabled={importing === repo.id}
                    className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Remove from projects"
                  >
                    <FiTrash2 size={18} />
                  </button>
                ) : repo.import_status === 'trashed' ? (
                  <span className="flex-shrink-0 p-2 text-gray-400" title="In trash">
                    <FiCheck size={18} />
                  </span>
                ) : (
                  <button
                    onClick={() => handleImport(repo)}
                    disabled={importing === repo.id}
                    className="flex-shrink-0 p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Import as project"
                  >
                    <FiDownload size={18} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                {repo.language && (
                  <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{repo.language}</span>
                )}
                <span className="flex items-center gap-1">
                  <FiStar size={12} /> {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  <FiGitBranch size={12} /> {repo.forks_count}
                </span>
                <span>
                  Updated {new Date(repo.updated_at).toLocaleDateString()}
                </span>
              </div>

              {repo.topics && repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {repo.topics.slice(0, 5).map((topic) => (
                    <span key={topic} className="px-2 py-0.5 text-xs rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
