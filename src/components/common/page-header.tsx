import { ThemeToggle } from "./theme-toggle";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight gradient-text">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm font-medium text-muted-foreground mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <ThemeToggle />
    </div>
  );
}
