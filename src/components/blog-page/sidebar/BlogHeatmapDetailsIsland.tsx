import { useEffect, useMemo, useState } from "preact/hooks";
import type { ActivityType, HeatmapMatrix } from "./heatmap/types";
import { BLOG_EVENTS, type HeatmapDaySelectedDetail } from "../events";

interface Props {
  heatmap: HeatmapMatrix;
  initialSelectedDate: string;
}

const typeBadge: Record<ActivityType, string> = {
  article: "ARTICLE",
  note: "NOTE",
  moment: "MOMENT",
};

const toDayMap = (heatmap: HeatmapMatrix) => {
  const map = new Map<string, HeatmapMatrix[number][number]>();
  heatmap.forEach((week) => {
    week.forEach((day) => {
      map.set(day.date, day);
    });
  });
  return map;
};

const BlogHeatmapDetailsIsland = ({ heatmap, initialSelectedDate }: Props) => {
  const dayMap = useMemo(() => toDayMap(heatmap), [heatmap]);
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);

  useEffect(() => {
    const onSelected = (event: Event) => {
      const detail = (event as CustomEvent<HeatmapDaySelectedDetail>).detail;
      if (!detail?.date || !dayMap.has(detail.date)) return;
      setSelectedDate(detail.date);
    };

    window.addEventListener(BLOG_EVENTS.heatmapDaySelected, onSelected);
    return () =>
      window.removeEventListener(BLOG_EVENTS.heatmapDaySelected, onSelected);
  }, [dayMap]);

  const selected = dayMap.get(selectedDate);
  if (!selected) {
    return (
      <div className="px-2 pt-3 text-xs text-base-content/50" data-testid="heatmap-details-empty">
        No activity data.
      </div>
    );
  }

  return (
    <div className="px-2 pt-3" data-testid="heatmap-details">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold text-base-content/70">{selected.date}</p>
        <p className="text-[11px] text-base-content/50">{selected.count} activities</p>
      </div>

      {selected.items.length === 0 ? (
        <p className="rounded-lg bg-base-200/40 px-2 py-2 text-xs text-base-content/55">
          No activity on this day.
        </p>
      ) : (
        <ul className="space-y-2">
          {selected.items.map((item) => (
            <li className="rounded-lg border border-base-300/60 bg-base-100/80 px-2 py-2" key={`${item.type}-${item.id}`}>
              <div className="mb-1 inline-flex rounded bg-base-200 px-1.5 py-0.5 text-[10px] font-bold text-base-content/65">
                {typeBadge[item.type]}
              </div>
              {item.url ? (
                <a href={item.url} className="block text-xs text-base-content/80 hover:text-[var(--app-accent-hover)]">
                  {item.title}
                </a>
              ) : (
                <p className="text-xs text-base-content/80">{item.title}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BlogHeatmapDetailsIsland;
