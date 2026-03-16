import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './components/ui/Toast';

import PublicLayout from './components/layout/PublicLayout';
import ProtectedRoute from './components/ui/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';

const HomePage = lazy(() => import('./pages/public/HomePage'));
const BlogPage = lazy(() => import('./pages/public/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/public/BlogPostPage'));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'));

const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ProjectsPage = lazy(() => import('./pages/admin/ProjectsPage'));
const SkillsPage = lazy(() => import('./pages/admin/SkillsPage'));
const MessagesPage = lazy(() => import('./pages/admin/MessagesPage'));
const PostsPage = lazy(() => import('./pages/admin/PostsPage'));
const AboutPage = lazy(() => import('./pages/admin/AboutPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/admin/ProfilePage'));
const GitHubImportPage = lazy(() => import('./pages/admin/GitHubImportPage'));
const TrashPage = lazy(() => import('./pages/admin/TrashPage'));

function SuspenseWrapper({ children }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ToastProvider>
                <BrowserRouter>
                  <SuspenseWrapper>
                    <Routes>
                      <Route element={<PublicLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/blog/:slug" element={<BlogPostPage />} />
                      </Route>

                      <Route path="/admin/login" element={<LoginPage />} />

                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute>
                            <AdminLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<DashboardPage />} />
                        <Route path="about" element={<AboutPage />} />
                        <Route path="projects" element={<ProjectsPage />} />
                        <Route path="skills" element={<SkillsPage />} />
                        <Route path="messages" element={<MessagesPage />} />
                        <Route path="posts" element={<PostsPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="github" element={<GitHubImportPage />} />
                        <Route path="trash" element={<TrashPage />} />
                      </Route>

                      <Route path="*" element={<PublicLayout />}>
                        <Route path="*" element={<NotFoundPage />} />
                      </Route>
                    </Routes>
                  </SuspenseWrapper>
                </BrowserRouter>
              </ToastProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
