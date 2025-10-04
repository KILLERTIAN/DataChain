"use client";
import { WalletSelector } from "./WalletSelector";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavigationLinks = ({ mobile = false, onLinkClick }: { mobile?: boolean; onLinkClick?: () => void }) => (
    <>
      <Link
        href="/explore"
        className={`${mobile ? 'text-base py-3 px-4 rounded-lg hover:bg-gray-800/50' : 'text-sm'} font-medium transition-colors text-gray-300 hover:text-white`}
        onClick={onLinkClick}
      >
        Explore
      </Link>
      <Link
        href="/dashboard"
        className={`${mobile ? 'text-base py-3 px-4 rounded-lg hover:bg-gray-800/50' : 'text-sm'} font-medium transition-colors text-gray-300 hover:text-white`}
        onClick={onLinkClick}
      >
        Dashboard
      </Link>
      <Link
        href="/upload"
        className={`${mobile ? 'text-base py-3 px-4 rounded-lg hover:bg-gray-800/50' : 'text-sm'} font-medium transition-colors text-gray-300 hover:text-white`}
        onClick={onLinkClick}
      >
        Upload
      </Link>
    </>
  );



  return (
    <nav className="sticky top-0 z-50 w-full bg-black/90 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="DataChain Logo" width={32} height={32} className="rounded-lg" />
              <span className="text-xl font-bold gradient-text">
                DataChain
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Navigation Links */}
            <div className="flex items-center gap-8 mr-6">
              <NavigationLinks />
            </div>

            {/* Wallet Selector */}
            <div className="flex-shrink-0">
              <WalletSelector />
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="rounded-xl hover:bg-gray-800/50 text-gray-300"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800/50 pt-4 pb-4">
            <div className="flex flex-col space-y-2">
              <NavigationLinks mobile onLinkClick={() => setIsMobileMenuOpen(false)} />
              
              <div className="px-4 pt-4">
                <WalletSelector />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}