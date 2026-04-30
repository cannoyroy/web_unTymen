export type ActivityType = "article" | "note" | "moment";

export interface ActivityRecord {
  type: ActivityType;
  id: string;
  title: string;
  date: string;
  url?: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  items: ActivityRecord[];
}

export type HeatmapMatrix = HeatmapDay[][];

