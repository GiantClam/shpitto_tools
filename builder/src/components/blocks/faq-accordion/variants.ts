import { cva } from "class-variance-authority";

export const faqSectionClass = cva("w-full bg-background", {
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
