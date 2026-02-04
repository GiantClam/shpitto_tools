import React, { Suspense } from "react";
import EditorClient from "./editor-client";

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading editor…</div>}>
      <EditorClient />
    </Suspense>
  );
}
