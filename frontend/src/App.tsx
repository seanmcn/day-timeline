import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useDayStore } from '@/store/dayStore';
import { useTemplateStore } from '@/store/templateStore';
import { Header } from '@/components/Header';
import { DayStartButton } from '@/components/DayStartButton';
import { BlockList } from '@/components/BlockList';
import { DayMetrics } from '@/components/DayMetrics';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { getTodayKey } from '@day-timeline/shared';

export default function App() {
  return (
    <Authenticator>
      {({ user }) => <AuthenticatedApp userId={user?.userId ?? ''} />}
    </Authenticator>
  );
}

function AuthenticatedApp({ userId }: { userId: string }) {
  const { dayState, isLoading, error, loadDay } = useDayStore();
  const { loadTemplates } = useTemplateStore();

  useEffect(() => {
    if (userId) {
      loadDay(getTodayKey());
      loadTemplates();
    }
  }, [userId, loadDay, loadTemplates]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--color-text-muted)]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--color-error)]">{error}</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen pb-24">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header />
                <main className="max-w-2xl mx-auto px-4 py-6">
                  {!dayState?.dayStartAt ? (
                    <DayStartButton />
                  ) : (
                    <>
                      <DayMetrics />
                      <BlockList />
                    </>
                  )}
                </main>
              </>
            }
          />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
