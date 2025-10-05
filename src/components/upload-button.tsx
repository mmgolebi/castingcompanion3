"use client";

import { UploadButton as UTButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export function UploadButton<T extends keyof OurFileRouter>(
  props: React.ComponentProps<typeof UTButton<OurFileRouter, T>>
) {
  return <UTButton<OurFileRouter, T> {...props} />;
}
