import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
  children?: React.ReactNode;
}

export function StatCard({ label, value, className = "", children }: StatCardProps) {
  return (
    <Card className={`flex-1 px-3 py-2 text-center ${className}`}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center justify-center gap-1">
        <p className="text-3xl font-bold">{value}</p>
        {children}
      </div>
    </Card>
  );
}
