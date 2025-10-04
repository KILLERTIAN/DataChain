"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import RippleGrid from "@/components/RippleGrid";
import { Shield, Database, GitBranch, Lock, Zap, Users, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: Shield,
      title: "Tamper-Proof",
      description: "Every dataset version is cryptographically hashed and stored on-chain, ensuring complete data integrity."
    },
    {
      icon: Database,
      title: "Verifiable Ownership",
      description: "Prove dataset authorship with blockchain-backed certificates. No more data theft or unauthorized use."
    },
    {
      icon: GitBranch,
      title: "Version Control",
      description: "Track every modification, fork, and update with Git-like versioning powered by blockchain."
    },
    {
      icon: Lock,
      title: "Access Control",
      description: "Smart contract-based licensing system with NFT and token-gated access permissions."
    }
  ];

  const useCases = [
    {
      title: "Research Institutions",
      description: "Publish verified datasets without fear of plagiarism",
      icon: Users
    },
    {
      title: "AI Startups",
      description: "Sell or share training datasets securely",
      icon: Zap
    },
    {
      title: "Journalists",
      description: "Prove data authenticity in investigations",
      icon: Shield
    },
    {
      title: "Governments",
      description: "Maintain traceable open data platforms",
      icon: Database
    }
  ];

  const techStack = [
    { name: "Aptos Blockchain", description: "Move smart contracts for dataset registry" },
    { name: "IPFS/Filecoin", description: "Decentralized storage for dataset files" },
    { name: "Next.js", description: "Modern React framework for the frontend" },
    { name: "AI Detection", description: "Similarity models to detect copied datasets" }
  ];

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center">
        {/* RippleGrid Background */}
        <div className="absolute inset-0">
          <RippleGrid
            enableRainbow={true}
            gridColor="#8A2BE2"
            rippleIntensity={0.08}
            gridSize={10.0}
            gridThickness={18.0}
            fadeDistance={1.2}
            vignetteStrength={2.5}
            glowIntensity={0.1}
            opacity={1}
            mouseInteraction={true}
            mouseInteractionRadius={0.8}
          />        
        </div>

        <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4">
          <div className="mb-8 animate-float">
            <span className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium backdrop-blur-sm">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
              Blockchain-Powered Dataset Ownership
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl mb-8 font-bold gradient-text">
            DataChain
          </h1>
          
          <p className="text-2xl md:text-4xl mb-6 text-gray-200 font-light">
            A GitHub for datasets, powered by blockchain trust
          </p>
          
          <p className="text-lg md:text-xl mb-12 text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Register, verify, and track datasets on-chain. Ensure tamper-proof provenance, 
            transparent ownership transfers, and cryptographic authenticity for your data.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/explore">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-10 py-5 text-lg rounded-2xl transition-all duration-300 hover:scale-105">
                Explore Datasets
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/upload">
              <Button size="lg" variant="outline" className="border-2 border-purple-400 text-purple-300 hover:bg-purple-500/20 px-10 py-5 text-lg rounded-2xl backdrop-blur-sm transition-all duration-300 hover:border-purple-300">
                Register Your Dataset
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-white">Why DataChain?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Unlike typical data repositories, DataChain makes datasets tamper-proof, 
              verifiable, and traceable through blockchain technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="web3-card p-8 rounded-3xl group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-purple-500/20">
                      <feature.icon className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-purple-200 transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-24 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-white">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              A simple, secure process to register and manage your datasets on the blockchain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-400">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Upload Dataset</h3>
              <p className="text-gray-400 leading-relaxed">
                Upload your dataset to IPFS/Filecoin. The SHA-256 hash and metadata are stored in our Move smart contract.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Blockchain Registry</h3>
              <p className="text-gray-400 leading-relaxed">
                Your Aptos wallet is tagged as the creator/owner. Every update creates a new version with full history.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-400">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Verify & Share</h3>
              <p className="text-gray-400 leading-relaxed">
                Anyone can verify authenticity, trace provenance, and access datasets through smart contract permissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative z-10 py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-white">Use Cases</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              DataChain serves various industries and use cases requiring data authenticity and provenance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="web3-card p-8 rounded-3xl group relative overflow-hidden animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-blue-500/20">
                      <useCase.icon className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-blue-200 transition-colors">{useCase.title}</h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{useCase.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-white">Built on Modern Tech</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Leveraging the best blockchain and web technologies for a seamless experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {techStack.map((tech, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-gray-800/30 rounded-2xl border border-gray-700">
                <CheckCircle className="h-6 w-6 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{tech.name}</h3>
                  <p className="text-gray-400">{tech.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6 text-white">Ready to Secure Your Data?</h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join the future of dataset management with blockchain-powered ownership and provenance tracking.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/upload">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg rounded-2xl">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-500/10 px-8 py-4 text-lg rounded-2xl">
                Explore Datasets
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
