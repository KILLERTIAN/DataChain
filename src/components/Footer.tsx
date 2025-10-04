import Image from "next/image";
import Link from "next/link";
import AptosLogo from "../../public/aptos.png";
import { GitBranch, MessageCircle, Globe, Database } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-t from-black to-gray-900 text-white py-16 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg" />
              <span className="text-xl font-bold gradient-text">DataChain</span>
            </div>
            <p className="text-gray-400 text-sm">
              Blockchain-powered dataset ownership and provenance tracking. 
              A GitHub for datasets, built on trust.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <GitBranch className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/explore" className="text-gray-400 hover:text-white transition-colors">Explore Datasets</Link></li>
              <li><Link href="/upload" className="text-gray-400 hover:text-white transition-colors">Upload Dataset</Link></li>
              <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Documentation</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Powered By */}
          <div>
            <h3 className="font-semibold text-white mb-4">Powered By</h3>
            <div className="space-y-3">
              <a 
                href="https://www.aptosfoundation.org/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Image src={AptosLogo} alt="Aptos" width={20} height={20} />
                <span className="text-sm">Aptos Blockchain</span>
              </a>
              <a 
                href="https://ipfs.tech/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Database className="h-5 w-5" />
                <span className="text-sm">IPFS Storage</span>
              </a>
              <a 
                href="https://nextjs.org/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Globe className="h-5 w-5" />
                <span className="text-sm">Next.js</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 DataChain. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}