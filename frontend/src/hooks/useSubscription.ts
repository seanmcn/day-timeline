import { useEffect, useRef } from 'react';
import { dataApi, type DayStateSubscription } from '@/lib/data-api';
import { useDayStore } from '@/store/dayStore';

export function useSubscription(date: string, isAuthenticated: boolean) {
  const subscriptionRef = useRef<DayStateSubscription | null>(null);
  const handleRemoteUpdate = useDayStore((state) => state.handleRemoteUpdate);

  useEffect(() => {
    if (!isAuthenticated || !date) {
      return;
    }

    subscriptionRef.current = dataApi.subscribeToDayStateUpdates(
      date,
      (remoteState) => {
        handleRemoteUpdate(remoteState);
      },
      (error) => {
        console.error('Subscription error:', error);
      }
    );

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [date, isAuthenticated, handleRemoteUpdate]);
}
