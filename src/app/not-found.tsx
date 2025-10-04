import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Database, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white cyber-grid flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
            <Database className="h-12 w-12 text-purple-400" />
          </div>
          <h1 className="text-8xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent neon-text">
            404
          </h1>
          <h2 className="text-3xl font-semibold mb-4 text-white">Dataset Not Found</h2>
          <p className="text-xl text-gray-400 mb-8">
            The dataset you're looking for doesn't exist on the blockchain or has been removed.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/explore">
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-2xl px-8 py-4 text-lg glow-purple transition-all duration-300">
              Explore Datasets
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-2 border-purple-400 text-purple-300 hover:bg-purple-500/20 rounded-2xl px-8 py-4 text-lg backdrop-blur-sm transition-all duration-300">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}