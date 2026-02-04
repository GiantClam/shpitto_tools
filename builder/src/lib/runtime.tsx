import * as Babel from "@babel/standalone";
import * as React from "react";
import * as Lucide from "lucide-react";
import * as Motion from "framer-motion";

import { cn } from "@/lib/cn";
import { NavbarBlock } from "@/components/blocks/navbar/block";
import {
  magicImportMap,
  AnimatedBeam,
  BentoGrid,
  BorderBeam,
  Carousel,
  ComparisonSlider,
  GlowCard,
  GradientText,
  Magnifier,
  Marquee,
  NumberTicker,
  Particles,
  TextReveal,
  SceneSwitcher,
} from "@/components/magic-exports";
import { useInViewReveal, useParallaxY } from "@/lib/motion";
import {
  uiImportMap,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Input,
  Label,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
  Progress,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toast,
  useToast,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Textarea,
} from "@/components/ui-exports";

type JITComponent = {
  render: React.ComponentType<any>;
  config?: Record<string, any>;
};

const lucideWithAliases = (() => {
  const icons = { ...Lucide } as Record<string, unknown>;
  if (!("Waveform" in icons) && "AudioWaveform" in icons) {
    icons.Waveform = icons.AudioWaveform;
  }
  return icons;
})();

const moduleMap: Record<string, Record<string, unknown>> = {
  ...magicImportMap,
  ...uiImportMap,
  "@/components/blocks/navbar/block": { NavbarBlock },
  "@/components/magic-exports": {
    AnimatedBeam,
    BentoGrid,
    BorderBeam,
    Carousel,
    ComparisonSlider,
    GlowCard,
    GradientText,
    Magnifier,
    Marquee,
    NumberTicker,
    Particles,
    TextReveal,
    SceneSwitcher,
  },
  "@/components/ui-exports": {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Alert,
    AlertDescription,
    AlertTitle,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    Input,
    Label,
    Popover,
    PopoverAnchor,
    PopoverContent,
    PopoverTrigger,
    Progress,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
    Separator,
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetOverlay,
    SheetPortal,
    SheetTitle,
    SheetTrigger,
    Skeleton,
    Slider,
    Switch,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Toast,
    ToastAction,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
    toast,
    useToast,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    Textarea,
  },
  "@/lib/cn": { cn },
  "@/lib/utils": { cn },
  "@/lib/motion": { useInViewReveal, useParallaxY },
  react: React,
  React,
  "lucide-react": lucideWithAliases,
  "framer-motion": Motion,
};

const normalizeModule = (mod: Record<string, unknown> | undefined) => {
  if (!mod || typeof mod !== "object") return mod;
  const hasDefault = Object.prototype.hasOwnProperty.call(mod, "default");
  if (hasDefault) {
    return (mod as any).__esModule ? mod : { __esModule: true, ...mod };
  }
  const entries = Object.entries(mod);
  if (entries.length === 1) {
    return { __esModule: true, ...mod, default: entries[0][1] };
  }
  return mod;
};

const resolveModule = (path: string) => {
  if (moduleMap[path]) return normalizeModule(moduleMap[path] as Record<string, unknown>);
  const key = Object.keys(moduleMap).find((moduleKey) => path.endsWith(moduleKey));
  if (!key) return undefined;
  return normalizeModule(moduleMap[key] as Record<string, unknown>);
};

const sanitizeJitCode = (input: string) => {
  const isWordChar = (value: string) => /[A-Za-z0-9]/.test(value);
  let out = "";
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];
    if (inLineComment) {
      out += char;
      if (char === "\n" || char === "\r") {
        inLineComment = false;
      }
      continue;
    }
    if (inBlockComment) {
      out += char;
      if (char === "*" && next === "/") {
        out += next;
        i += 1;
        inBlockComment = false;
      }
      continue;
    }
    if (inSingle) {
      if (escaped) {
        out += char;
        escaped = false;
        continue;
      }
      if (char === "\\") {
        out += char;
        escaped = true;
        continue;
      }
      if (char === "'") {
        const prev = out.at(-1) ?? "";
        const nextChar = next ?? "";
        if (isWordChar(prev) && isWordChar(nextChar)) {
          out += "\\'";
          continue;
        }
        inSingle = false;
        out += char;
        continue;
      }
      out += char;
      continue;
    }
    if (inDouble) {
      if (escaped) {
        out += char;
        escaped = false;
        continue;
      }
      if (char === "\\") {
        out += char;
        escaped = true;
        continue;
      }
      if (char === '"') {
        inDouble = false;
      }
      out += char;
      continue;
    }
    if (inTemplate) {
      if (escaped) {
        out += char;
        escaped = false;
        continue;
      }
      if (char === "\\") {
        out += char;
        escaped = true;
        continue;
      }
      if (char === "`") {
        inTemplate = false;
      }
      out += char;
      continue;
    }
    if (char === "/" && next === "/") {
      out += char + next;
      i += 1;
      inLineComment = true;
      continue;
    }
    if (char === "/" && next === "*") {
      out += char + next;
      i += 1;
      inBlockComment = true;
      continue;
    }
    if (char === "'") {
      inSingle = true;
      out += char;
      continue;
    }
    if (char === '"') {
      inDouble = true;
      out += char;
      continue;
    }
    if (char === "`") {
      inTemplate = true;
      out += char;
      continue;
    }
    out += char;
  }
  return out;
};

export function compileJIT(rawCode: string): JITComponent | null {
  try {
    const sanitized = sanitizeJitCode(rawCode);
    const transpiled = Babel.transform(sanitized, {
      presets: ["react", "typescript"],
      plugins: ["transform-modules-commonjs"],
      filename: "jit.tsx",
      sourceType: "module",
    }).code;
    if (!transpiled) return null;

    const exports: Record<string, any> = {};
    const require = (path: string) => {
      const mod = resolveModule(path);
      if (!mod) {
        throw new Error(`Missing module: ${path}`);
      }
      return mod;
    };

    // eslint-disable-next-line no-new-func
    const fn = new Function(
      "require",
      "exports",
      "React",
      "window",
      "document",
      "globalThis",
      "self",
      "Function",
      `"use strict";\n${transpiled}`
    );
    fn(require, exports, React, undefined, undefined, undefined, undefined, undefined);

    if (!exports.default) return null;
    return {
      render: exports.default,
      config: exports.config,
    };
  } catch (error) {
    console.error("JIT Compiler Error", error);
    return null;
  }
}
