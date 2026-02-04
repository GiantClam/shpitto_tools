import { cva } from "class-variance-authority";

export const logoCloudSectionClass = cva("w-full bg-background", {
  variants: {
    paddingY: { sm: "py-8", md: "py-12", lg: "py-20" },
    background: {
      none: "bg-background",
      muted: "bg-muted",
      gradient: "bg-gradient-to-b from-background to-muted",
      image: "bg-muted",
    },
  },
  defaultVariants: { paddingY: "lg", background: "none" },
});

export const logoGridClass = cva("grid gap-6", {
  variants: {
    variant: {
      grid: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
      marquee: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    },
  },
  defaultVariants: { variant: "grid" },
});
