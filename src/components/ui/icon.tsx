import { cn } from "@/lib/utils/cn";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  fill?: boolean;
  size?: number | string;
}

export function Icon({ name, fill = false, size = 24, className, ...props }: IconProps) {
  return (
    <span
      className={cn(
        "material-symbols-rounded select-none",
        fill && "fill",
        className
      )}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      }}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  );
}
