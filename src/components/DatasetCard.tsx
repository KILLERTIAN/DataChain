import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Download, Database, ExternalLink } from "lucide-react";

interface DatasetCardProps {
  title: string;
  creator: string;
  trustScore: number;
  href: string;
  description?: string;
  tags?: string[];
  size?: string;
  downloads?: number;
  verified?: boolean;
  licenseType?: string;
  cid?: string;
}

export function DatasetCard({ 
  title, 
  creator, 
  trustScore, 
  href, 
  description,
  tags = [],
  size,
  downloads,
  verified = false,
  licenseType,
  cid
}: DatasetCardProps) {
  
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cid) {
      window.open(`/api/files/${cid}?download=true`, '_blank');
    }
  };

  const handleViewIPFS = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cid) {
      window.open(`https://brown-imaginative-bug-610.mypinata.cloud/ipfs/${cid}`, '_blank');
    }
  };
  return (
    <Link href={href} className="block group">
      <Card className="web3-card p-6 rounded-3xl group-hover:scale-[1.02] h-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="flex flex-col h-full relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                {title}
              </h3>
              {verified && (
                <Shield className="h-5 w-5 text-green-400 flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
              {description}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag} 
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-600/50 text-gray-400 rounded-full text-xs">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="space-y-3 mt-auto">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span className="truncate">Creator: {creator}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {size && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <Database className="h-4 w-4" />
                    <span>{size}</span>
                  </div>
                )}
                {downloads !== undefined && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <Download className="h-4 w-4" />
                    <span>{downloads}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Trust Score */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Trust Score</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      trustScore >= 90 ? 'bg-green-500' :
                      trustScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${trustScore}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${
                  trustScore >= 90 ? 'text-green-400' :
                  trustScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {trustScore}%
                </span>
              </div>
            </div>

            {/* License */}
            {licenseType && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>License: {licenseType}</span>
              </div>
            )}

            {/* File Actions */}
            {cid && (
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleDownload}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 rounded-xl flex-1 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button
                  onClick={handleViewIPFS}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}