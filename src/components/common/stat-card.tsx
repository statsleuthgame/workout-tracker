import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
  children?: React.ReactNode;
}

export function StatCard({ label, value, className = "", children }: StatCardProps) {
  return (
    <Card className={`flex-1 px-3 py-3 text-center border-t-2 border-primary/30 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center justify-center gap-1 mt-0.5">
        <p className="text-2xl font-extrabold tracking-tight">{value}</p>
        {children}
      </div>
    </Card>
  );
}
