"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, ExternalLink, Eye, FileText } from "lucide-react";

interface StaticFileViewerProps {
  cid: string;
  filename?: string;
  size?: string;
  gateway?: string;
}

/**
 * Static File Viewer - Works with static export by directly accessing IPFS gateways
 * Use this component when you need static export compatibility
 */
export function StaticFileViewer({ 
  cid, 
  filename = "dataset", 
  size,
  gateway = "https://brown-imaginative-bug-610.mypinata.cloud/ipfs"
}: StaticFileViewerProps) {
  const [loading, setLoading] = useState(false);

  const directUrl = `${gateway}/${cid}`;

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Direct download from IPFS gateway
      const response = await fetch(directUrl);
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
        throw new Error(`Download failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOnIPFS = () => {
    window.open(directUrl, '_blank');
  };

  const handlePreview = () => {
    window.open(directUrl, '_blank');
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
            <p className="text-xs text-blue-400">Static Mode</p>
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