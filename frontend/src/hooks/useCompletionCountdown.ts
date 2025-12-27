import { useState, useEffect, useCallback, useRef } from 'react';
import { useDayStore } from '@/store/dayStore';

const COUNTDOWN_SECONDS = 5;

interface PendingCompletion {
  blockId: string;
  startedAt: number; // Date.now() when completion was triggered
}

export function useCompletionCountdown() {
  const [pendingCompletions, setPendingCompletions] = useState<
    Map<string, PendingCompletion>
  >(new Map());
  const [, forceUpdate] = useState({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { completeBlock, uncompleteBlock } = useDayStore();

  // Start a countdown for a block - immediately marks it complete in store
  const startCountdown = useCallback(
    (blockId: string) => {
      // Mark complete in store immediately
      completeBlock(blockId);

      // Add to pending completions for countdown tracking
      setPendingCompletions((prev) => {
        const next = new Map(prev);
        next.set(blockId, {
          blockId,
          startedAt: Date.now(),
        });
        return next;
      });
    },
    [completeBlock]
  );

  // Cancel countdown and uncomplete the block
  const cancelCountdown = useCallback(
    (blockId: string) => {
      // Remove from pending
      setPendingCompletions((prev) => {
        const next = new Map(prev);
        next.delete(blockId);
        return next;
      });

      // Uncomplete in store
      uncompleteBlock(blockId);
    },
    [uncompleteBlock]
  );

  // Check if a block is in countdown
  const isPending = useCallback(
    (blockId: string): boolean => {
      return pendingCompletions.has(blockId);
    },
    [pendingCompletions]
  );

  // Get remaining seconds for a block (0-5)
  const getSecondsRemaining = useCallback(
    (blockId: string): number => {
      const pending = pendingCompletions.get(blockId);
      if (!pending) return 0;

      const elapsed = Math.floor((Date.now() - pending.startedAt) / 1000);
      return Math.max(0, COUNTDOWN_SECONDS - elapsed);
    },
    [pendingCompletions]
  );

  // Tick the countdown every second
  useEffect(() => {
    if (pendingCompletions.size === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start interval if not already running
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();

        setPendingCompletions((prev) => {
          const next = new Map(prev);
          let hasChanges = false;

          for (const [blockId, pending] of prev) {
            const elapsed = Math.floor((now - pending.startedAt) / 1000);
            if (elapsed >= COUNTDOWN_SECONDS) {
              // Countdown finished - remove from pending (block stays completed)
              next.delete(blockId);
              hasChanges = true;
            }
          }

          if (hasChanges) {
            return next;
          }
          return prev;
        });

        // Force re-render to update countdown display
        forceUpdate({});
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pendingCompletions.size]);

  return {
    startCountdown,
    cancelCountdown,
    isPending,
    getSecondsRemaining,
    pendingBlockIds: Array.from(pendingCompletions.keys()),
  };
}
