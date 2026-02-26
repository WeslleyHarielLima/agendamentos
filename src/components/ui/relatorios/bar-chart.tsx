type BarChartItem = {
  label: string;
  value: number;
};

type BarChartProps = {
  data: BarChartItem[];
  formatValue?: (v: number) => string;
  height?: number;
};

export function BarChart({
  data,
  formatValue = (v) => String(v),
  height = 140,
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-content-tertiary text-paragraph-small-size"
        style={{ height }}
      >
        Nenhum dado no período.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full overflow-x-auto">
      <div
        className="flex items-end gap-1 min-w-0"
        style={{ height: height + 24 }}
      >
        {data.map(({ label, value }) => {
          const pct = (value / max) * 100;
          return (
            <div
              key={label}
              className="flex flex-col items-center justify-end gap-1 flex-1 min-w-[24px] group"
              style={{ height: height + 24 }}
            >
              <div
                className="w-full flex flex-col justify-end"
                style={{ height }}
              >
                <div
                  className="w-full rounded-t bg-content-brand/25 group-hover:bg-content-brand/40 transition-colors relative"
                  style={{ height: `${pct}%`, minHeight: value > 0 ? 4 : 0 }}
                  title={formatValue(value)}
                >
                  <div className="absolute inset-x-0 top-0 h-0.5 rounded-t bg-content-brand" />
                </div>
              </div>
              <span
                className="text-[9px] text-content-tertiary truncate w-full text-center"
                title={label}
              >
                {label.slice(5)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
