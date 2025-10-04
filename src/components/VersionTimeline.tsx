import { GitBranch, Download, Calendar, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VersionTimelineProps {
  versions: {
    version: string;
    hash: string;
    date: string;
    changes: string;
    size: string;
  }[];
}

export function VersionTimeline({ versions }: VersionTimelineProps) {
  return (
    <div className="space-y-6">
      {versions.map((version, index) => (
        <div key={version.version} className="relative">
          {/* Timeline line */}
          {index < versions.length - 1 && (
            <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-700" />
          )}
          
          <div className="flex items-start gap-4">
            {/* Version indicator */}
            <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            
            {/* Version content */}
            <div className="flex-1 bg-gray-700/30 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Version {version.version}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{version.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{version.size}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl">
                  Download
                </Button>
              </div>
              
              <p className="text-gray-300 mb-4">{version.changes}</p>
              
              <div className="flex items-center gap-2 text-xs">
                <Hash className="h-3 w-3 text-gray-500" />
                <span className="text-gray-500 font-mono">{version.hash}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}