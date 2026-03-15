import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
  children?: React.ReactNode;
}

export function StatCard({ label, value, className = "", children }: StatCardProps) {
  return (
    <Card className={`flex-1 px-3 py-3.5 text-center gradient-border overflow-hidden ${className}`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center justify-center gap-1 mt-1">
        <p className="text-2xl font-extrabold tracking-tight gradient-text">{value}</p>
        {children}
      </div>
    </Card>
  );
}
