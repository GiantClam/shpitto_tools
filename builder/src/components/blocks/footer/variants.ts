import { cva } from "class-variance-authority";

export const footerClass = cva("w-full border-t border-border", {
  variants: {
    paddingY: { sm: "py-8", md: "py-12", lg: "py-16" },
    background: {
      none: "bg-background",
      muted: "bg-muted",
      gradient: "bg-gradient-to-b from-background to-muted",
      image: "bg-muted",
    },
  },
  defaultVariants: { paddingY: "md", background: "none" },
});
