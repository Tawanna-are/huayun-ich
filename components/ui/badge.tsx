import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-pine/18 bg-mist/80 px-3 py-1 text-xs font-medium text-pine",
        className
      )}
      {...props}
    />
  );
}
