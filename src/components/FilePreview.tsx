"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "./OptimizedImage";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { 
  Download, 
  ExternalLink, 
  Eye, 
  FileText, 
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  File
} from "lucide-react";
import { generateFileUrl, generateDirectIpfsUrl, isImageFile, getContentType } from "@/lib/pinata";

interface FilePreviewProps {
  cid: string;
  filename?: string;
  size?: string;
  isPrivate?: boolean;
  showPreview?: boolean;
  className?: string;
}

export function FilePreview({ 
  cid, 
  filename = "file", 
  size, 
  isPrivate = false,
  showPreview = true,
  className = ""
}: FilePreviewProps) {
  const [loading, setLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Use signed URL for private files
  const { url: signedUrl, loading: signedUrlLoading } = useSignedUrl(
    isPrivate ? cid : null,
    { expires: 3600 }
  );

  const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  const contentType = getContentType(filename);
  const isImage = isImageFile(filename);
  const isVideo = ['.mp4', '.webm', '.ogg', '.mov'].includes(fileExtension);
  const isAudio = ['.mp3', '.wav', '.ogg', '.m4a'].includes(fileExtension);
  const isText = ['.txt', '.md', '.json', '.csv', '.log'].includes(fileExtension);
  const isArchive = ['.zip', '.tar', '.gz', '.rar'].includes(fileExtension);

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-5 w-5 text-purple-400" />;
    if (isVideo) return <Video className="h-5 w-5 text-blue-400" />;
    if (isAudio) return <Music className="h-5 w-5 text-green-400" />;
    if (isText) return <FileText className="h-5 w-5 text-yellow-400" />;
    if (isArchive) return <Archive className="h-5 w-5 text-orange-400" />;
    return <File className="h-5 w-5 text-gray-400" />;
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const downloadUrl = isPrivate && signedUrl 
        ? signedUrl 
        : generateFileUrl(cid, { download: true, filename });
        
      const response = await fetch(downloadUrl);
      
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

  const handleViewExternal = () => {
    if (isPrivate && signedUrl) {
      window.open(signedUrl, '_blank');
    } else {
      const ipfsUrl = generateDirectIpfsUrl(cid);
      window.open(ipfsUrl, '_blank');
    }
  };

  const handlePreview = async () => {
    if (!isText || previewContent) return;

    try {
      const previewUrl = isPrivate && signedUrl 
        ? signedUrl 
        : generateFileUrl(cid);
        
      const response = await fetch(previewUrl);
      
      if (response.ok) {
        const text = await response.text();
        setPreviewContent(text.substring(0, 1000)); // Limit preview to 1000 chars
      } else {
        throw new Error('Failed to load preview');
      }
    } catch (error) {
      setPreviewError('Failed to load preview');
    }
  };

  useEffect(() => {
    if (showPreview && isText && !previewContent && !previewError) {
      handlePreview();
    }
  }, [showPreview, isText, previewContent, previewError, signedUrl]);

  const renderPreview = () => {
    if (!showPreview) return null;

    if (isImage) {
      return (
        <div className="mt-4">
          {isPrivate && signedUrl ? (
            <img 
              src={signedUrl} 
              alt={filename}
              className="max-w-full h-auto rounded-lg border border-gray-700"
              style={{ maxHeight: '200px' }}
            />
          ) : (
            <OptimizedImage
              cid={cid}
              filename={filename}
              alt={filename}
              width={300}
              height={200}
              className="max-w-full h-auto rounded-lg border border-gray-700"
            />
          )}
        </div>
      );
    }

    if (isVideo && (isPrivate ? signedUrl : true)) {
      const videoUrl = isPrivate && signedUrl ? signedUrl : generateFileUrl(cid);
      return (
        <div className="mt-4">
          <video 
            controls 
            className="max-w-full h-auto rounded-lg border border-gray-700"
            style={{ maxHeight: '200px' }}
          >
            <source src={videoUrl} type={contentType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (isAudio && (isPrivate ? signedUrl : true)) {
      const audioUrl = isPrivate && signedUrl ? signedUrl : generateFileUrl(cid);
      return (
        <div className="mt-4">
          <audio controls className="w-full">
            <source src={audioUrl} type={contentType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    if (isText && previewContent) {
      return (
        <div className="mt-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 max-h-32 overflow-y-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
              {previewContent}
              {previewContent.length >= 1000 && '...'}
            </pre>
          </div>
        </div>
      );
    }

    if (previewError) {
      return (
        <div className="mt-4 text-sm text-red-400">
          {previewError}
        </div>
      );
    }

    return null;
  };

  return (
    <Card className={`bg-gray-800/50 border-gray-700 p-4 rounded-2xl ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getFileIcon()}
          <div>
            <p className="font-medium text-white">{filename}</p>
            <p className="text-sm text-gray-400">CID: {cid.slice(0, 12)}...</p>
            {size && <p className="text-xs text-gray-500">Size: {size}</p>}
            {isPrivate && <p className="text-xs text-yellow-400">Private File</p>}
          </div>
        </div>
      </div>

      {renderPreview()}
      
      <div className="flex gap-2 mt-4">
        <Button
          onClick={handleDownload}
          disabled={loading || (isPrivate && signedUrlLoading)}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 rounded-xl flex-1"
        >
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Downloading...' : 'Download'}
        </Button>
        
        {showPreview && (isImage || isVideo || isAudio) && (
          <Button
            onClick={() => {
              const previewUrl = isPrivate && signedUrl ? signedUrl : generateFileUrl(cid);
              window.open(previewUrl, '_blank');
            }}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl"
            disabled={isPrivate && signedUrlLoading}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          onClick={handleViewExternal}
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl"
          disabled={isPrivate && signedUrlLoading}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {isPrivate && signedUrlLoading && (
        <div className="mt-2 text-xs text-gray-400">
          Generating secure access link...
        </div>
      )}
    </Card>
  );
}