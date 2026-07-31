"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFiles } from "@/hooks/useFiles";
import { DownloadCloud } from "lucide-react";
import { formatFileSize } from "@/utils/formatFileSize";

const Home = () => {
  const router = useRouter();
  const { files, loading, error, uploading, uploadMultipleFiles, downloadFile } = useFiles();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    await uploadMultipleFiles(selectedFiles);
    
    // Clear the input
    event.target.value = '';
  };

  const features = [
    {
      title: "Easy Upload",
      description: "Drag and drop or click to upload files instantly",
    },
    {
      title: "File Management",
      description: "Organize and manage your uploaded files efficiently",
    },
    {
      title: "Share Files",
      description: "Generate shareable links for your files",
    },
    {
      title: "Quick Download",
      description: "Download files anytime, anywhere",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-4 text-5xl font-bold text-foreground">
            📁 Lapis Archive
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            Open Source File Sharing & Collaboration Platform
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => router.push("/signin")}>
              Sign In
            </Button>
            <Button
              onClick={() => router.push("/signup")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* File Upload Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
            Upload Your Files
          </h2>
          
          <Card className="p-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4 flex items-center justify-center text-4xl">
                📁
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to upload
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Support for all file types
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button asChild disabled={uploading}>
                  <span>{uploading ? "Uploading..." : "Choose Files"}</span>
                </Button>
              </label>
            </div>
            
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Uploaded Files:</h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-textGray">
                      <div className="flex-1">
                        <span className="text-sm font-medium">{file.name}</span>
                        <div className="text-xs text-gray-500">
                          ID: {file.id}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                        <Button
                          onClick={() => downloadFile(file.storage_key)}
                          variant="outline"
                          className="hover:bg-primary/10"
                        >
                          <DownloadCloud />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
          File Sharing Made Simple
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 text-center transition-shadow hover:shadow-lg"
            >
              <h3 className="mb-2 font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
