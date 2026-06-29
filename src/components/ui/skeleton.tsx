import { cn } from "@/lib/utils";
import React from "react";

interface SkeletonProps extends React.ComponentProps<"div"> {
  repeat?: number; // optional prop with default value
}

function Skeleton({ className, repeat = 1, ...props }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: repeat }).map((_, idx) => (
        <div
          key={idx}
          data-slot="skeleton"
          className={cn("animate-pulse rounded-md bg-muted", className)}
          {...props}
        />
      ))}
    </>
  );
}

export { Skeleton };
