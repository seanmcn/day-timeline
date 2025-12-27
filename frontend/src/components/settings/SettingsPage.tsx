import { Link } from 'react-router-dom';
import { useTemplateStore } from '@/store/templateStore';
import { TemplateList } from './TemplateList';

export function SettingsPage() {
  const { isLoading, error } = useTemplateStore();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            to="/"
            className="p-2 -ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Back to timeline"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 10H5M5 10l5-5M5 10l5 5" />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center text-[var(--color-text-muted)]">
            Loading templates...
          </div>
        ) : error ? (
          <div className="text-center text-[var(--color-error)]">{error}</div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold mb-4">Block Templates</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Customize the blocks that appear when you start a new day. You can
                add tasks to any block, reorder them, or hide ones you don't use.
              </p>
              <TemplateList />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
