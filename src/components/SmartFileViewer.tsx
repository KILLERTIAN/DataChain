"use client";

import { useState, useEffect } from "react";
import { FileViewer } from "./FileViewer";
import { StaticFileViewer } from "./StaticFileViewer";

interface SmartFileViewerProps {
  cid: string;
  filename?: string;
  size?: string;
}

/**
 * Smart File Viewer - Automatically detects if API routes are available
 * Falls back to static mode if needed
 */
export function SmartFileViewer(props: SmartFileViewerProps) {
  const [useStatic, setUseStatic] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Test if API routes are available
    const checkApiAvailability = async () => {
      try {
        const response = await fetch('/api/test-pinata', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        // If we get any response (even error), API routes are working
        setUseStatic(false);
      } catch (error) {
        // If fetch fails completely, we're likely in static export mode
        console.log('API routes not available, using static mode');
        setUseStatic(true);
      } finally {
        setChecked(true);
      }
    };

    checkApiAvailability();
  }, []);

  if (!checked) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-400"></div>
          <span className="text-gray-400 text-sm">Initializing...</span>
        </div>
      </div>
    );
  }

  return useStatic ? (
    <StaticFileViewer {...props} />
  ) : (
    <FileViewer {...props} />
  );
}