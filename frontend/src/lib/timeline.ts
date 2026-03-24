import {
  type Block,
  isBlockPinned,
  getScheduledDate,
  getBlockEffectiveEstimate,
} from '@day-timeline/shared';

export interface TimelineSegment {
  type: 'block' | 'continuation';
  block: Block;
  displayLabel: string;
  effectiveEstimate: number;
  projectedStart: string; // ISO 8601
}

// Compute visual timeline segments, splitting flexible blocks around pinned blocks
export function computeTimelineSegments(
  blocks: Block[],
  dayStartAt: string | null
): TimelineSegment[] {
  if (!dayStartAt) {
    // No day start — no splitting, just return blocks as segments
    return [...blocks]
      .sort((a, b) => a.order - b.order)
      .map((block) => ({
        type: 'block' as const,
        block,
        displayLabel: block.label,
        effectiveEstimate: getBlockEffectiveEstimate(block),
        projectedStart: dayStartAt ?? new Date().toISOString(),
      }));
  }

  const sorted = [...blocks].sort((a, b) => a.order - b.order);
  const segments: TimelineSegment[] = [];
  let runningTime = new Date(dayStartAt);
  const now = new Date();

  // Pending continuation from a previously split block
  let pendingContinuation: {
    block: Block;
    remainingMinutes: number;
  } | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const block = sorted[i];

    if (isBlockPinned(block) && !block.completed && block.sessions.length === 0) {
      // Pinned block: anchor at scheduled time
      const scheduledDate = getScheduledDate(block.scheduledAt!, dayStartAt);
      const effectiveStart = scheduledDate > runningTime ? scheduledDate : runningTime;

      // If there's a pending continuation and this pinned block comes right after,
      // we need to check if even MORE of the original block needs to be deferred
      // (multiple pinned blocks interrupting the same flexible block)

      segments.push({
        type: 'block',
        block,
        displayLabel: block.label,
        effectiveEstimate: getBlockEffectiveEstimate(block),
        projectedStart: effectiveStart.toISOString(),
      });

      runningTime = new Date(effectiveStart);
      runningTime.setMinutes(runningTime.getMinutes() + getBlockEffectiveEstimate(block));

      // Emit pending continuation after this pinned block
      if (pendingContinuation) {
        segments.push({
          type: 'continuation',
          block: pendingContinuation.block,
          displayLabel: `${pendingContinuation.block.label} (cont.)`,
          effectiveEstimate: pendingContinuation.remainingMinutes,
          projectedStart: runningTime.toISOString(),
        });
        runningTime.setMinutes(
          runningTime.getMinutes() + pendingContinuation.remainingMinutes
        );
        pendingContinuation = null;
      }
    } else if (!isBlockPinned(block) && !block.completed && block.sessions.length === 0) {
      // Flexible block (not started, not completed): check if a later pinned block interrupts it
      const blockStart = new Date(runningTime < now ? now : runningTime);
      const estimate = getBlockEffectiveEstimate(block);
      const blockEnd = new Date(blockStart);
      blockEnd.setMinutes(blockEnd.getMinutes() + estimate);

      // Look ahead for the next pinned block that interrupts this block's time range
      let interruptingPinned: Block | null = null;
      for (let j = i + 1; j < sorted.length; j++) {
        const candidate = sorted[j];
        if (isBlockPinned(candidate) && !candidate.completed && candidate.sessions.length === 0) {
          const scheduledDate = getScheduledDate(candidate.scheduledAt!, dayStartAt);
          if (scheduledDate > blockStart && scheduledDate < blockEnd) {
            interruptingPinned = candidate;
            break;
          }
        }
      }

      if (interruptingPinned) {
        const scheduledDate = getScheduledDate(interruptingPinned.scheduledAt!, dayStartAt);
        const minutesBefore = Math.round(
          (scheduledDate.getTime() - blockStart.getTime()) / 60000
        );
        const minutesAfter = estimate - minutesBefore;

        if (minutesBefore > 0) {
          // Emit first part
          segments.push({
            type: 'block',
            block,
            displayLabel: block.label,
            effectiveEstimate: minutesBefore,
            projectedStart: blockStart.toISOString(),
          });
        } else {
          // No time before pinned block — emit the full block as a segment
          // (it just gets pushed after the pinned block)
          segments.push({
            type: 'block',
            block,
            displayLabel: block.label,
            effectiveEstimate: estimate,
            projectedStart: blockStart.toISOString(),
          });
          runningTime = new Date(blockEnd);
          continue;
        }

        // Store continuation to emit after the pinned block
        if (minutesAfter > 0) {
          pendingContinuation = {
            block,
            remainingMinutes: minutesAfter,
          };
        }

        runningTime = new Date(scheduledDate);
      } else {
        // No interruption — emit normally
        segments.push({
          type: 'block',
          block,
          displayLabel: block.label,
          effectiveEstimate: estimate,
          projectedStart: blockStart.toISOString(),
        });
        runningTime = new Date(blockEnd);
      }
    } else {
      // Completed or started block — emit as-is, no splitting
      const blockStart = new Date(runningTime);
      if (block.completed) {
        const lastSession = block.sessions[block.sessions.length - 1];
        if (lastSession?.endedAt) {
          const endedAt = new Date(lastSession.endedAt);
          if (endedAt > runningTime) {
            runningTime = new Date(endedAt);
          }
        }
      } else if (block.sessions.length > 0) {
        const startedAt = new Date(block.sessions[0].startedAt);
        if (startedAt > runningTime) {
          runningTime = new Date(startedAt);
        }
        runningTime.setMinutes(
          runningTime.getMinutes() + getBlockEffectiveEstimate(block)
        );
      }

      segments.push({
        type: 'block',
        block,
        displayLabel: block.label,
        effectiveEstimate: getBlockEffectiveEstimate(block),
        projectedStart: blockStart.toISOString(),
      });

      // For blocks that didn't update runningTime above (completed with no sessions)
      if (block.completed && block.sessions.length === 0) {
        // Completed instantly — don't advance runningTime
      } else if (!block.completed && block.sessions.length === 0) {
        // Shouldn't reach here (handled above), but be safe
        runningTime.setMinutes(
          runningTime.getMinutes() + getBlockEffectiveEstimate(block)
        );
      }

      // Emit any pending continuation after completed/started blocks too
      if (pendingContinuation) {
        segments.push({
          type: 'continuation',
          block: pendingContinuation.block,
          displayLabel: `${pendingContinuation.block.label} (cont.)`,
          effectiveEstimate: pendingContinuation.remainingMinutes,
          projectedStart: runningTime.toISOString(),
        });
        runningTime.setMinutes(
          runningTime.getMinutes() + pendingContinuation.remainingMinutes
        );
        pendingContinuation = null;
      }
    }
  }

  // If there's still a pending continuation after all blocks
  if (pendingContinuation) {
    segments.push({
      type: 'continuation',
      block: pendingContinuation.block,
      displayLabel: `${pendingContinuation.block.label} (cont.)`,
      effectiveEstimate: pendingContinuation.remainingMinutes,
      projectedStart: runningTime.toISOString(),
    });
  }

  return segments;
}
