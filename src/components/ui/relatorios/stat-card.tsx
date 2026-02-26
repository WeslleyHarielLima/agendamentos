type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
};

export function StatCard({ label, value, sub, highlight }: StatCardProps) {
  return (
    <div
      className={`bg-background-tertiary rounded-xl p-5 border ${
        highlight ? 'border-content-brand/40' : 'border-border-primary'
      }`}
    >
      <p className="text-paragraph-small-size text-content-tertiary mb-1">
        {label}
      </p>
      <p
        className={`text-title-size font-bold ${
          highlight ? 'text-content-brand' : 'text-content-primary'
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-paragraph-small-size text-content-tertiary mt-1">
          {sub}
        </p>
      )}
    </div>
  );
}
