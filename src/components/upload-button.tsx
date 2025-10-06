"use client";

import { UploadButton as UTButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export function UploadButton(props: any) {
  return <UTButton<OurFileRouter> {...props} />;
}
