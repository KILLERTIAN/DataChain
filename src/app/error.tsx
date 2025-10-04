"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white cyber-grid flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <AlertTriangle className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white via-red-200 to-red-400 bg-clip-text text-transparent neon-text">
            Oops!
          </h1>
          <h2 className="text-3xl font-semibold mb-4 text-white">Something went wrong</h2>
          <p className="text-xl text-gray-400 mb-8">
            We encountered an error while processing your request. This might be a temporary blockchain connectivity issue.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={reset}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-2xl px-8 py-4 text-lg glow-purple transition-all duration-300"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="border-2 border-purple-400 text-purple-300 hover:bg-purple-500/20 rounded-2xl px-8 py-4 text-lg backdrop-blur-sm transition-all duration-300"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}