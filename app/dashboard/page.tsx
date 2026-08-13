"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import UploadPanel from "@/components/dashboard/UploadPanel";
import UploadedFiles from "@/components/dashboard/UploadedFiles";
import SharedLinks from "@/components/dashboard/SharedLinks";
import ShareDialog from "@/components/dashboard/ShareDialog";
import type { UploadRecord } from "@/store/uploadsStore";

const Dashboard = () => {
  const [shareFile, setShareFile] = useState<UploadRecord | null>(null);

  return (
    <div className="min-h-content">
      <section className="py-10 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Files you&apos;ve uploaded here
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Upload a file to get a shareable link and access code for it.
            </p>
          </div>

          <Card className="p-4 sm:p-8">
            <UploadPanel />
            <UploadedFiles onShare={setShareFile} />
          </Card>
        </div>
      </section>

      <SharedLinks />

      <ShareDialog file={shareFile} onClose={() => setShareFile(null)} />
    </div>
  );
};

export default Dashboard;
