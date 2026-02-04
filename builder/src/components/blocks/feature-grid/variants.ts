import { cva } from "class-variance-authority";

export const featureGridSectionClass = cva("w-full bg-background", {
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

export const featureGridClass = cva("grid gap-6", {
  variants: {
    variant: {
      "2col": "grid-cols-1 sm:grid-cols-2",
      "3col": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      "4col": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    },
  },
  defaultVariants: { variant: "3col" },
});
