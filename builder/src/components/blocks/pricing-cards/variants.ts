import { cva } from "class-variance-authority";

export const pricingSectionClass = cva("w-full bg-background", {
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

export const pricingGridClass = cva("grid gap-6", {
  variants: {
    variant: {
      "2up": "grid-cols-1 md:grid-cols-2",
      "3up": "grid-cols-1 md:grid-cols-3",
      "withToggle": "grid-cols-1 md:grid-cols-3",
    },
  },
  defaultVariants: { variant: "3up" },
});
