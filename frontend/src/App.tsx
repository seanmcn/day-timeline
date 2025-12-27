import { useEffect } from 'react';
import { useDayStore } from '@/store/dayStore';
import { useAuthStore } from '@/store/authStore';
import { Header } from '@/components/Header';
import { DayStartButton } from '@/components/DayStartButton';
import { BlockList } from '@/components/BlockList';
import { DayMetrics } from '@/components/DayMetrics';
import { Login } from '@/components/Login';
import { getTodayKey } from '@day-timeline/shared';

export default function App() {
  const { dayState, isLoading, error, loadDay } = useDayStore();
  const { user, isLoading: authLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      loadDay(getTodayKey());
    }
  }, [user, loadDay]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--color-text-muted)]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

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
    <div className="min-h-screen pb-24">
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
    </div>
  );
}
