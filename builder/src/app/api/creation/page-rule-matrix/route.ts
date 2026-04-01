import { NextRequest, NextResponse } from "next/server";
import {
  buildPageRuleMatrixMarkdown,
  buildPageRuleMatrixPayload,
} from "@/lib/agent/page-rule-matrix-doc";

export async function GET(request: NextRequest) {
  const format = String(request.nextUrl.searchParams.get("format") || "json").toLowerCase();
  if (format === "md" || format === "markdown") {
    const markdown = buildPageRuleMatrixMarkdown();
    return new Response(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  }
  return NextResponse.json(buildPageRuleMatrixPayload());
}
