import type { ActivityRecord, HeatmapDay, HeatmapMatrix } from "./types";

const DAYS_PER_WEEK = 7;
export const DEFAULT_HEATMAP_WEEKS = 12;

type PostLike = {
  id: string;
  data: {
    title: string;
    pubDate: Date;
  };
};

type NoteLike = {
  id: string;
  title: string;
  date: Date;
};

type MomentLike = {
  id: string;
  name: string;
  text: string;
  createdAt?: string;
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

export const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const calcLevel = (count: number): 0 | 1 | 2 | 3 | 4 => {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
};

export const collectActivityRecords = ({
  posts,
  notes,
  moments,
}: {
  posts: PostLike[];
  notes: NoteLike[];
  moments: MomentLike[];
}): ActivityRecord[] => {
  const records: ActivityRecord[] = [];

  posts.forEach((post) => {
    records.push({
      type: "article",
      id: post.id,
      title: post.data.title,
      date: toDateKey(post.data.pubDate),
      url: `/posts/${post.id}/`,
    });
  });

  notes.forEach((note) => {
    records.push({
      type: "note",
      id: note.id,
      title: note.title,
      date: toDateKey(note.date),
    });
  });

  moments.forEach((moment) => {
    if (!moment.createdAt) return;
    const createdAt = new Date(moment.createdAt);
    if (Number.isNaN(createdAt.getTime())) return;
    const preview = moment.text.replace(/\s+/g, " ").trim();
    records.push({
      type: "moment",
      id: moment.id,
      title: preview ? preview.slice(0, 48) : `Moment by ${moment.name}`,
      date: toDateKey(createdAt),
    });
  });

  return records;
};

const groupRecordsByDate = (records: ActivityRecord[]): Map<string, ActivityRecord[]> => {
  const grouped = new Map<string, ActivityRecord[]>();
  records.forEach((record) => {
    const list = grouped.get(record.date) ?? [];
    list.push(record);
    grouped.set(record.date, list);
  });
  return grouped;
};

export const buildHeatmapMatrix = (
  records: ActivityRecord[],
  now: Date = new Date(),
  weeks: number = DEFAULT_HEATMAP_WEEKS,
): HeatmapMatrix => {
  const totalDays = weeks * DAYS_PER_WEEK;
  const endDate = startOfDay(now);
  const startDate = addDays(endDate, -(totalDays - 1));
  const grouped = groupRecordsByDate(records);
  const matrix: HeatmapMatrix = [];

  for (let weekIndex = 0; weekIndex < weeks; weekIndex += 1) {
    const week: HeatmapDay[] = [];
    for (let dayIndex = 0; dayIndex < DAYS_PER_WEEK; dayIndex += 1) {
      const offset = weekIndex * DAYS_PER_WEEK + dayIndex;
      const date = addDays(startDate, offset);
      const key = toDateKey(date);
      const items = grouped.get(key) ?? [];
      week.push({
        date: key,
        count: items.length,
        level: calcLevel(items.length),
        items,
      });
    }
    matrix.push(week);
  }

  return matrix;
};
