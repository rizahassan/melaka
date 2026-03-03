'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface Project {
  id: string;
  name: string;
  firebaseProjectId: string;
  status: 'active' | 'paused' | 'disconnected';
  config: {
    collections: { path: string; fields: string[]; enabled: boolean }[];
    sourceLocale: string;
    targetLocales: string[];
  };
}

interface DashboardStats {
  totalTranslations: number;
  translationsThisMonth: number;
  activeCollections: number;
  targetLanguages: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects', {
        headers: { 'x-user-id': user?.uid || '' },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        
        // Calculate stats from projects
        if (data.projects?.length > 0) {
          const project = data.projects[0];
          setStats({
            totalTranslations: 0, // Will come from usage API
            translationsThisMonth: 0,
            activeCollections: project.config.collections.filter((c: { enabled: boolean }) => c.enabled !== false).length,
            targetLanguages: project.config.targetLocales.length,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Melaka Cloud</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">
              Settings
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* No projects - show onboarding */}
        {!loadingProjects && projects.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Melaka Cloud!
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connect your Firebase project to start translating your Firestore content automatically.
            </p>
            <Link
              href="/connect"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold inline-block"
            >
              Connect Firebase Project
            </Link>
          </div>
        )}

        {/* Has projects - show dashboard */}
        {!loadingProjects && projects.length > 0 && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500 mb-1">Total Translations</div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats?.totalTranslations || 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500 mb-1">This Month</div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats?.translationsThisMonth || 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500 mb-1">Collections</div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats?.activeCollections || 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-500 mb-1">Languages</div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats?.targetLanguages || 0}
                </div>
              </div>
            </div>

            {/* Projects List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
                <Link
                  href="/connect"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Project
                </Link>
              </div>
              <div className="divide-y">
                {projects.map((project) => (
                  <div key={project.id} className="px-6 py-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-500">{project.firebaseProjectId}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          project.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : project.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {project.status}
                      </span>
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Manage →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Link
                href="/translations"
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Review Translations</h3>
                <p className="text-sm text-gray-500">View and edit your translations</p>
              </Link>
              <Link
                href="/analytics"
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                <p className="text-sm text-gray-500">Translation stats and usage</p>
              </Link>
              <Link
                href="/settings"
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Settings</h3>
                <p className="text-sm text-gray-500">Configure languages and billing</p>
              </Link>
            </div>
          </>
        )}

        {loadingProjects && (
          <div className="text-center py-12 text-gray-500">Loading projects...</div>
        )}
      </main>
    </div>
  );
}
