export const BLOG_EVENTS = {
  viewChanged: "view-changed",
  openPublishModal: "open-publish-modal",
  momentPublished: "moment-published",
  heatmapDaySelected: "heatmap-day-selected",
  searchQueryChanged: "search-query-changed",
} as const;

export interface BlogViewChangedDetail {
  view?: "article" | "moment" | "note";
}

export interface MomentPublishedDetail {
  text: string;
  images: string[];
  location: string;
}

export interface HeatmapDaySelectedDetail {
  date: string;
}

export interface SearchQueryChangedDetail {
  query: string;
}
