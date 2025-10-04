"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, ExternalLink, Eye, FileText } from "lucide-react";

interface FileViewerProps {
  cid: string;
  filename?: string;
  size?: string;
}

export function FileViewer({ cid, filename = "dataset", size }: FileViewerProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/files/${cid}?download=true`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Download failed:', response.status);
        alert('Download failed. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOnIPFS = () => {
    window.open(`https://brown-imaginative-bug-610.mypinata.cloud/ipfs/${cid}`, '_blank');
  };

  const handlePreview = () => {
    window.open(`/api/files/${cid}`, '_blank');
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 p-4 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-purple-400" />
          <div>
            <p className="font-medium text-white">{filename}</p>
            <p className="text-sm text-gray-400">CID: {cid.slice(0, 12)}...</p>
            {size && <p className="text-xs text-gray-500">Size: {size}</p>}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={handleDownload}
          disabled={loading}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 rounded-xl flex-1"
        >
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Downloading...' : 'Download'}
        </Button>
        
        <Button
          onClick={handlePreview}
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl"
        >
          <Eye className="h-4 w-4" />
        </Button>
        
        <Button
          onClick={handleViewOnIPFS}
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}