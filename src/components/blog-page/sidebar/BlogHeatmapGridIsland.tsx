import { useMemo, useState } from "preact/hooks";
import type { HeatmapMatrix } from "./heatmap/types";
import { BLOG_EVENTS } from "../events";

interface Props {
  heatmap: HeatmapMatrix;
  initialSelectedDate: string;
}

const levelLabel = ["0 activities", "1 activity", "2 activities", "3 activities", "4+ activities"];

const flattenDates = (heatmap: HeatmapMatrix): string[] =>
  heatmap.flatMap((week) => week.map((day) => day.date));

const BlogHeatmapGridIsland = ({ heatmap, initialSelectedDate }: Props) => {
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const validDates = useMemo(() => new Set(flattenDates(heatmap)), [heatmap]);

  const onSelectDate = (date: string) => {
    if (!validDates.has(date)) return;
    setSelectedDate(date);
    window.dispatchEvent(
      new CustomEvent(BLOG_EVENTS.heatmapDaySelected, { detail: { date } }),
    );
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[280px] grid-flow-col gap-1" data-testid="heatmap-grid">
        {heatmap.map((week, weekIndex) => (
          <div className="grid grid-rows-7 gap-1" key={`week-${weekIndex}`}>
            {week.map((day) => (
              <button
                key={day.date}
                type="button"
                className={[
                  "h-3 w-3 rounded-[3px] transition-all cursor-pointer",
                  "hover:ring-2 hover:ring-primary focus:outline-none focus:ring-2 focus:ring-primary",
                  day.level === 0 ? "hm-level-0" : "",
                  day.level === 1 ? "hm-level-1" : "",
                  day.level === 2 ? "hm-level-2" : "",
                  day.level === 3 ? "hm-level-3" : "",
                  day.level === 4 ? "hm-level-4" : "",
                  selectedDate === day.date ? "ring-2 ring-primary" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                title={`${day.date}: ${day.count} activities`}
                aria-label={`${day.date} ${levelLabel[day.level]}`}
                data-date={day.date}
                data-level={day.level}
                onClick={() => onSelectDate(day.date)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogHeatmapGridIsland;
