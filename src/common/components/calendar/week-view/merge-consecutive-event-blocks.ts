export interface MergeableEventBlock {
  weekday?: string;
  startTime: string;
  endTime: string;
  weekNum?: number | null;
  activityId?: string;
  activityType?: string;
  subjectName?: string;
  assignmentId?: string;
  slotId?: string;
  resourceId?: string;
  expectedStudents?: number | null;
  assignmentIds?: string[];
  slotIds?: string[];
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function groupKey(block: MergeableEventBlock): string {
  const week = block.weekNum ?? 'null';
  return [
    block.weekday ?? '',
    week,
    block.activityId ?? '',
    block.resourceId ?? '',
  ].join('|');
}

function canMergeAdjacent(previous: MergeableEventBlock, next: MergeableEventBlock): boolean {
  return previous.endTime === next.startTime;
}

function mergeSegment(segment: MergeableEventBlock[]): MergeableEventBlock {
  const first = segment[0];
  const last = segment[segment.length - 1];

  const assignmentIds = segment
    .map((b) => b.assignmentId)
    .filter((id): id is string => Boolean(id));
  const slotIds = segment
    .map((b) => b.slotId)
    .filter((id): id is string => Boolean(id));

  return {
    ...first,
    startTime: first.startTime,
    endTime: last.endTime,
    assignmentId: first.assignmentId,
    slotId: first.slotId,
    assignmentIds: assignmentIds.length > 0 ? assignmentIds : undefined,
    slotIds: slotIds.length > 0 ? slotIds : undefined,
  };
}

/**
 * Combines consecutive same-activity blocks (e.g. 9–10 and 10–11) into one visual streak.
 */
export function mergeConsecutiveEventBlocks<T extends MergeableEventBlock>(blocks: T[]): T[] {
  if (blocks.length <= 1) {
    return blocks;
  }

  const grouped = new Map<string, T[]>();
  for (const block of blocks) {
    const key = groupKey(block);
    const list = grouped.get(key);
    if (list) {
      list.push(block);
    } else {
      grouped.set(key, [block]);
    }
  }

  const merged: T[] = [];

  for (const group of grouped.values()) {
    const sorted = [...group].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    let segment: T[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const previous = segment[segment.length - 1];

      if (canMergeAdjacent(previous, current)) {
        segment.push(current);
      } else {
        merged.push(mergeSegment(segment) as T);
        segment = [current];
      }
    }

    merged.push(mergeSegment(segment) as T);
  }

  return merged;
}
