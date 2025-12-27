import { useState, useRef, useCallback, useEffect } from 'react';
import { useDrag } from '@use-gesture/react';

interface SwipeableWrapperProps {
  children: React.ReactNode;
  onSwipeRight: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isCompleted?: boolean;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 80;
const MAX_SWIPE = 120;

export function SwipeableWrapper({
  children,
  onSwipeRight,
  onEdit,
  onDuplicate,
  onDelete,
  isCompleted,
  disabled,
}: SwipeableWrapperProps) {
  const [offset, setOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if device supports touch
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const resetSwipe = useCallback(() => {
    setIsAnimating(true);
    setOffset(0);
    setTimeout(() => setIsAnimating(false), 300);
  }, []);

  const bind = useDrag(
    ({ movement: [mx], velocity: [vx], direction: [dx], last, cancel }) => {
      if (disabled) {
        cancel();
        return;
      }

      // Swipe left (reveal actions) is only enabled on touch devices
      const swipeLeftEnabled = isTouchDevice && !isCompleted;

      if (last) {
        // On release
        if (swipeLeftEnabled && (mx < -SWIPE_THRESHOLD || (vx > 0.5 && dx < 0))) {
          // Swiped left enough - reveal actions (touch only, incomplete blocks)
          setIsAnimating(true);
          setOffset(-MAX_SWIPE);
          setTimeout(() => setIsAnimating(false), 300);
        } else if (mx > SWIPE_THRESHOLD || (vx > 0.5 && dx > 0)) {
          // Swiped right - trigger done/undo action
          setIsAnimating(true);
          onSwipeRight();
          setOffset(0);
          setTimeout(() => setIsAnimating(false), 300);
        } else {
          // Snap back
          setIsAnimating(true);
          setOffset(0);
          setTimeout(() => setIsAnimating(false), 300);
        }
      } else {
        // During drag - limit range
        // Swipe left only on touch, swipe right always allowed
        const minOffset = swipeLeftEnabled ? -MAX_SWIPE : 0;
        const newOffset = Math.max(minOffset, Math.min(MAX_SWIPE, mx));
        setOffset(newOffset);
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      threshold: 10,
    }
  );

  const handleActionClick = (action: () => void) => {
    action();
    resetSwipe();
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-xl">
      {/* Left swipe actions (Edit, Duplicate, Delete) - revealed on left swipe */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-stretch"
        style={{
          width: MAX_SWIPE,
          opacity: offset < 0 ? Math.min(1, Math.abs(offset) / SWIPE_THRESHOLD) : 0,
        }}
      >
        <button
          onClick={() => handleActionClick(onEdit)}
          className="flex-1 flex flex-col items-center justify-center bg-[var(--color-accent)] text-white min-w-[40px]"
          aria-label="Edit"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button
          onClick={() => handleActionClick(onDuplicate)}
          className="flex-1 flex flex-col items-center justify-center bg-[var(--color-text-muted)] text-white min-w-[40px]"
          aria-label="Duplicate"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
            <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
          </svg>
        </button>
        <button
          onClick={() => handleActionClick(onDelete)}
          className="flex-1 flex flex-col items-center justify-center bg-[var(--color-error)] text-white min-w-[40px]"
          aria-label="Delete"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Right swipe indicator (Done/Undo) - revealed on right swipe */}
      <div
        className={`absolute left-0 top-0 bottom-0 flex items-center justify-center ${
          isCompleted ? 'bg-[var(--color-border)]' : 'bg-[var(--color-success)]'
        }`}
        style={{
          width: MAX_SWIPE,
          opacity: offset > 0 ? Math.min(1, offset / SWIPE_THRESHOLD) : 0,
        }}
      >
        {isCompleted ? (
          // Undo icon
          <svg width="32" height="32" viewBox="0 0 20 20" fill="white">
            <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          // Checkmark icon
          <svg width="32" height="32" viewBox="0 0 20 20" fill="white">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      {/* Main content */}
      <div
        {...bind()}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isAnimating ? 'transform 0.3s ease-out' : 'none',
          touchAction: 'pan-y',
        }}
        className="relative z-10 bg-[var(--color-surface)]"
      >
        {children}
      </div>
    </div>
  );
}
