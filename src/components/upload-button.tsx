"use client";

import { UploadButton as UTButton, UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export function UploadButton(props: Parameters<typeof UTButton<OurFileRouter>>[0]) {
  return <UTButton<OurFileRouter> {...props} />;
}
