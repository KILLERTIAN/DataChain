"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LicenseBadge } from "@/components/LicenseBadge";
import { VersionTimeline } from "@/components/VersionTimeline";
import { 
  Download, 
  ExternalLink, 
  Shield, 
  User, 
  Calendar, 
  Database, 
  Eye, 
  Share2,
  Flag,
  Heart,
  GitBranch,
  Lock,
  Globe,
  FileText,
  Hash
} from "lucide-react";

interface DatasetDetailProps {
  params: { id: string };
}

// Mock data - replace with actual blockchain data
const datasetMetadata = {
  id: "1",
  name: "COVID-19 Research Dataset",
  description: "Comprehensive COVID-19 research data including patient demographics, symptoms, treatment outcomes, and epidemiological patterns. This dataset has been anonymized and prepared for research purposes in compliance with healthcare data regulations.",
  owner: "0x1234567890abcdef1234567890abcdef12345678",
  hash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  licenseType: "MIT",
  category: "Healthcare & Medical",
  tags: ["healthcare", "covid-19", "research", "epidemiology"],
  size: "2.3 GB",
  downloads: 1250,
  views: 3400,
  trustScore: 95,
  verified: true,
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  blockHeight: 1234567,
  transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  isPublic: true,
  allowCommercialUse: false
};

const versionHistory = [
  {
    version: "1.2.0",
    hash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    date: "2024-01-15",
    changes: "Added new patient cohort data and updated anonymization protocols",
    size: "2.3 GB"
  },
  {
    version: "1.1.0", 
    hash: "QmPreviousHashExample123456789abcdef",
    date: "2024-01-10",
    changes: "Fixed data formatting issues and added metadata descriptions",
    size: "2.1 GB"
  },
  {
    version: "1.0.0",
    hash: "QmOriginalHashExample987654321fedcba",
    date: "2024-01-05", 
    changes: "Initial dataset release with core COVID-19 research data",
    size: "2.0 GB"
  }
];

const similarDatasets = [
  {
    id: "2",
    title: "Global Health Survey Data",
    creator: "0x8765...4321",
    trustScore: 88,
    similarity: 85
  },
  {
    id: "3", 
    title: "Pandemic Response Analysis",
    creator: "0x9876...1234",
    trustScore: 92,
    similarity: 78
  }
];

export default function DatasetDetail({ params }: DatasetDetailProps) {
  // Using params for future implementation
  console.log("Dataset ID:", params.id);
  const [activeTab, setActiveTab] = useState("overview");
  const [liked, setLiked] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white cyber-grid">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white">{datasetMetadata.name}</h1>
                {datasetMetadata.verified && (
                  <Shield className="h-8 w-8 text-green-400" />
                )}
              </div>
              <p className="text-xl text-gray-400 mb-4">{datasetMetadata.description}</p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {datasetMetadata.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 ml-6">
              <Button 
                onClick={() => window.open(`/api/files/QmXNT8ps3MAv2FmCNeeXnzuudfQJR7JKMEKwdrsboyerFt?download=true`, '_blank')}
                className="bg-purple-600 hover:bg-purple-700 rounded-xl px-6"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Dataset
              </Button>
              <Button 
                onClick={() => window.open(`https://brown-imaginative-bug-610.mypinata.cloud/ipfs/QmXNT8ps3MAv2FmCNeeXnzuudfQJR7JKMEKwdrsboyerFt`, '_blank')}
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl px-6"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on IPFS
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLiked(!liked)}
                  className={`rounded-xl ${liked ? 'text-red-400' : 'text-gray-400'}`}
                >
                  <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 rounded-xl">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 rounded-xl">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gray-800/50 border-gray-700 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-lg font-bold text-white">{datasetMetadata.downloads}</p>
                <p className="text-xs text-gray-400">Downloads</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-lg font-bold text-white">{datasetMetadata.views}</p>
                <p className="text-xs text-gray-400">Views</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-lg font-bold text-white">{datasetMetadata.size}</p>
                <p className="text-xs text-gray-400">Size</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-lg font-bold text-white">{datasetMetadata.trustScore}%</p>
                <p className="text-xs text-gray-400">Trust Score</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm font-bold text-white truncate">{datasetMetadata.owner.slice(0, 8)}...</p>
                <p className="text-xs text-gray-400">Owner</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-sm font-bold text-white">Jan 15</p>
                <p className="text-xs text-gray-400">Updated</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800/30 p-1 rounded-2xl w-fit">
            {[
              { id: "overview", label: "Overview" },
              { id: "versions", label: "Version History" },
              { id: "blockchain", label: "Blockchain Info" },
              { id: "similar", label: "Similar Datasets" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <Card className="bg-gray-800/50 border-gray-700 p-6 rounded-3xl">
                  <h3 className="text-xl font-semibold mb-4 text-white">Dataset Details</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">Description</h4>
                      <p className="text-gray-300 leading-relaxed">{datasetMetadata.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">Category</h4>
                        <p className="text-gray-300">{datasetMetadata.category}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-2">License</h4>
                        <LicenseBadge licenseType={datasetMetadata.licenseType} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">Visibility</h4>
                        <div className="flex items-center gap-2">
                          {datasetMetadata.isPublic ? (
                            <>
                              <Globe className="h-4 w-4 text-green-400" />
                              <span className="text-green-400">Public</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 text-yellow-400" />
                              <span className="text-yellow-400">Private</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-2">Commercial Use</h4>
                        <span className={datasetMetadata.allowCommercialUse ? "text-green-400" : "text-red-400"}>
                          {datasetMetadata.allowCommercialUse ? "Allowed" : "Not Allowed"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700 p-6 rounded-3xl">
                  <h3 className="text-xl font-semibold mb-4 text-white">Usage Guidelines</h3>
                  <div className="space-y-3 text-gray-300">
                    <p>• This dataset is provided for research and educational purposes</p>
                    <p>• Please cite the original source when using this data in publications</p>
                    <p>• Data has been anonymized to protect patient privacy</p>
                    <p>• Commercial use requires separate licensing agreement</p>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === "versions" && (
              <Card className="bg-gray-800/50 border-gray-700 p-6 rounded-3xl">
                <h3 className="text-xl font-semibold mb-6 text-white">Version History</h3>
                <VersionTimeline versions={versionHistory} />
              </Card>
            )}

            {activeTab === "blockchain" && (
              <Card className="bg-gray-800/50 border-gray-700 p-6 rounded-3xl">
                <h3 className="text-xl font-semibold mb-6 text-white">Blockchain Information</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Dataset Hash
                      </h4>
                      <p className="text-gray-300 font-mono text-sm break-all bg-gray-700/30 p-3 rounded-xl">
                        {datasetMetadata.hash}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Transaction Hash
                      </h4>
                      <p className="text-gray-300 font-mono text-sm break-all bg-gray-700/30 p-3 rounded-xl">
                        {datasetMetadata.transactionHash}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-white mb-2">Block Height</h4>
                      <p className="text-gray-300">{datasetMetadata.blockHeight.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">IPFS Hash</h4>
                      <p className="text-gray-300 font-mono text-sm break-all">{datasetMetadata.ipfsHash}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-2">Verification Status</h4>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-400" />
                      <span className="text-green-400">Verified on Aptos Blockchain</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "similar" && (
              <Card className="bg-gray-800/50 border-gray-700 p-6 rounded-3xl">
                <h3 className="text-xl font-semibold mb-6 text-white">Similar Datasets</h3>
                <div className="space-y-4">
                  {similarDatasets.map((dataset) => (
                    <div key={dataset.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-2xl">
                      <div>
                        <h4 className="font-medium text-white">{dataset.title}</h4>
                        <p className="text-sm text-gray-400">Creator: {dataset.creator}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">Trust Score: {dataset.trustScore}%</span>
                          <span className="text-xs text-purple-400">Similarity: {dataset.similarity}%</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <Card className="bg-gray-800/50 border-gray-700 p-6 rounded-3xl">
              <h3 className="text-lg font-semibold mb-4 text-white">Dataset Owner</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Research Institute</p>
                  <p className="text-sm text-gray-400 font-mono">{datasetMetadata.owner.slice(0, 12)}...</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Datasets:</span>
                  <span className="text-white">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Downloads:</span>
                  <span className="text-white">8,450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Trust Score:</span>
                  <span className="text-green-400">94%</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl">
                View Profile
              </Button>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-800/50 border-gray-700 p-6 rounded-3xl">
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Dataset
                </Button>
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl justify-start">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Fork Dataset
                </Button>
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Request Access
                </Button>
              </div>
            </Card>

            {/* License Info */}
            <Card className="bg-gray-800/50 border-gray-700 p-6 rounded-3xl">
              <h3 className="text-lg font-semibold mb-4 text-white">License Information</h3>
              <div className="space-y-3">
                <LicenseBadge licenseType={datasetMetadata.licenseType} />
                <p className="text-sm text-gray-400">
                  This dataset is licensed under the MIT License, allowing for free use with attribution.
                </p>
                <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 p-0">
                  Read full license terms
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}