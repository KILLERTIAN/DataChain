"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { SmartFileViewer } from "@/components/SmartFileViewer";
import { 
  Database, 
  Upload, 
  Download, 
  TrendingUp, 
  Shield, 
  Users,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

// Mock user data - replace with actual blockchain data
const mockUserData = {
  totalDatasets: 12,
  totalDownloads: 8450,
  trustScore: 94,
  followers: 156,
  datasets: [
    {
      id: "1",
      title: "COVID-19 Research Dataset",
      description: "Comprehensive COVID-19 research data with patient demographics",
      downloads: 1250,
      views: 3400,
      trustScore: 95,
      status: "verified",
      lastUpdated: "2024-01-15",
      size: "2.3 GB",
      license: "MIT"
    },
    {
      id: "2",
      title: "Climate Change Satellite Data", 
      description: "Satellite imagery and climate measurements from 2020-2024",
      downloads: 890,
      views: 2100,
      trustScore: 88,
      status: "pending",
      lastUpdated: "2024-01-10",
      size: "15.7 GB",
      license: "CC BY 4.0"
    },
    {
      id: "3",
      title: "Financial Market Analysis",
      description: "Stock market data and trading patterns for ML training",
      downloads: 2100,
      views: 5600,
      trustScore: 92,
      status: "verified",
      lastUpdated: "2024-01-12",
      size: "5.1 GB",
      license: "Commercial"
    }
  ],
  recentActivity: [
    { type: "download", dataset: "COVID-19 Research Dataset", user: "0x1234...5678", time: "2 hours ago" },
    { type: "view", dataset: "Climate Change Satellite Data", user: "0x8765...4321", time: "4 hours ago" },
    { type: "upload", dataset: "Financial Market Analysis", user: "You", time: "1 day ago" },
    { type: "verification", dataset: "COVID-19 Research Dataset", user: "System", time: "2 days ago" }
  ]
};

export default function Dashboard() {
  const { account, connected } = useWallet();
  const [activeTab, setActiveTab] = useState("overview");
  const [userDatasets, setUserDatasets] = useState<any[]>([]);
  const [allDatasets, setAllDatasets] = useState<any[]>([]);
  const [pinataFiles, setPinataFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDatasets: 0,
    totalDownloads: 0,
    trustScore: 85,
    followers: 0
  });

  // Fetch user's datasets and all datasets
  useEffect(() => {
    if (connected && account?.address) {
      fetchUserDatasets();
    }
    fetchAllDatasets();
  }, [connected, account]);

  const fetchUserDatasets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/datasets?creator=${account?.address}`);
      const data = await response.json();
      
      if (data.success) {
        setUserDatasets(data.datasets);
        setStats({
          totalDatasets: data.datasets.length,
          totalDownloads: data.datasets.reduce((sum: number, d: any) => sum + d.downloads, 0),
          trustScore: data.datasets.length > 0 ? 
            Math.round(data.datasets.reduce((sum: number, d: any) => sum + d.trustScore, 0) / data.datasets.length) : 85,
          followers: Math.floor(Math.random() * 200) // Mock for now
        });
      }
    } catch (error) {
      console.error('Failed to fetch user datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDatasets = async () => {
    try {
      const response = await fetch('/api/datasets');
      const data = await response.json();
      
      if (data.success) {
        const datasets = data.datasets || [];
        setAllDatasets(datasets);
        
        // Separate Pinata files
        const pinataDatasets = datasets.filter((d: any) => d.creator === 'Pinata Upload');
        setPinataFiles(pinataDatasets);
        
        console.log('Dashboard - Total datasets:', datasets.length);
        console.log('Dashboard - Pinata files:', pinataDatasets.length);
      }
    } catch (error) {
      console.error('Failed to fetch all datasets:', error);
    }
  };



  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Database className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">Please connect your wallet to access your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white cyber-grid">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">
                Dashboard
              </h1>
              <p className="text-xl md:text-2xl text-gray-300">
                Welcome back, {account?.address ? `${account.address.toString().slice(0, 6)}...${account.address.toString().slice(-4)}` : 'User'}
              </p>
            </div>
            <Link href="/upload">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-2xl px-8 py-4 text-lg transition-all duration-300 hover:scale-105">
                <Upload className="h-5 w-5 mr-2" />
                Upload Dataset
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="web3-card p-6 rounded-3xl group animate-float">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white group-hover:text-purple-200 transition-colors">{stats.totalDatasets}</p>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Total Datasets</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/20">
                <Database className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-400">
              <TrendingUp className="h-4 w-4 mr-1" />
              +2 this month
            </div>
          </Card>

          <Card className="web3-card p-6 rounded-3xl group animate-float" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white group-hover:text-blue-200 transition-colors">{stats.totalDownloads.toLocaleString()}</p>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Total Downloads</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                <Download className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-400">
              <TrendingUp className="h-4 w-4 mr-1" />
              +15% this week
            </div>
          </Card>

          <Card className="web3-card p-6 rounded-3xl group animate-float" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white group-hover:text-green-200 transition-colors">{stats.trustScore}%</p>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Trust Score</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center border border-green-500/20">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000" 
                  style={{ width: `${mockUserData.trustScore}%` }}
                />
              </div>
            </div>
          </Card>

          <Card className="web3-card p-6 rounded-3xl group animate-float" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white group-hover:text-orange-200 transition-colors">{stats.followers}</p>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Followers</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center border border-orange-500/20">
                <Users className="h-6 w-6 text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-400">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8 this week
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800/30 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "overview"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("datasets")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "datasets"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              My Datasets
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "activity"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Activity
            </button>
            {pinataFiles.length > 0 && (
              <button
                onClick={() => setActiveTab("pinata")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "pinata"
                    ? "bg-green-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Pinata Files ({pinataFiles.length})
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Datasets */}
            <div className="lg:col-span-2 space-y-6">
              {/* User's Datasets */}
              <Card className="bg-gray-800/50 border-gray-700 p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Your Recent Datasets</h3>
                  <Link href="/dashboard?tab=datasets">
                    <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                      View All
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {userDatasets.slice(0, 3).map((dataset) => (
                    <div key={dataset.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-2xl">
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1">{dataset.title}</h4>
                        <p className="text-sm text-gray-400 mb-2">{dataset.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{dataset.downloads} downloads</span>
                          <span>{dataset.views} views</span>
                          <span>Updated {dataset.lastUpdated}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          dataset.verified 
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {dataset.verified ? 'verified' : 'pending'}
                        </span>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {userDatasets.length === 0 && (
                    <div className="text-center py-8">
                      <Database className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 mb-4">No datasets uploaded yet</p>
                      <Link href="/upload">
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                          Upload Your First Dataset
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Card>

              {/* Pinata Files */}
              {pinataFiles.length > 0 && (
                <Card className="bg-gradient-to-r from-green-900/20 to-green-800/20 border-green-700/50 p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-green-300">Pinata IPFS Files</h3>
                      <p className="text-green-400/80 text-sm">
                        {pinataFiles.length} files from your Pinata account
                      </p>
                    </div>

                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pinataFiles.slice(0, 4).map((file) => (
                      <div key={file.id} className="p-4 bg-gray-800/50 border border-green-700/30 rounded-2xl">
                        <div className="mb-3">
                          <h4 className="font-medium text-white mb-1">{file.title}</h4>
                          <p className="text-sm text-gray-400 mb-2">{file.description}</p>
                          <div className="flex items-center gap-3 text-xs text-green-400">
                            <span>📁 {file.size}</span>
                            <span>⬇️ {file.downloads}</span>
                          </div>
                        </div>
                        {file.cid && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => window.open(`/api/files/${file.cid}`, '_blank')}
                              size="sm"
                              variant="outline"
                              className="border-green-600 text-green-300 hover:bg-green-700/20 rounded-xl flex-1"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            <Button
                              onClick={() => window.open(`/api/files/${file.cid}?download=true`, '_blank')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 rounded-xl"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {pinataFiles.length > 4 && (
                    <div className="mt-4 text-center">
                      <Button
                        onClick={() => setActiveTab("pinata")}
                        variant="ghost"
                        className="text-green-400 hover:text-green-300"
                      >
                        View All {pinataFiles.length} Pinata Files
                      </Button>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Quick Actions */}
            <div>
              <Card className="bg-gray-800/50 border-gray-700 p-6 rounded-3xl mb-6 gap-3">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/upload">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Dataset
                    </Button>
                  </Link>
                  <Link href="/explore">
                    <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Explore Datasets
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Dataset
                  </Button>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-gray-800/50 border-gray-700 p-6 rounded-3xl">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {mockUserData.recentActivity.slice(0, 4).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === "download" ? "bg-blue-400" :
                        activity.type === "view" ? "bg-green-400" :
                        activity.type === "upload" ? "bg-purple-400" : "bg-yellow-400"
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-white">
                          {activity.type === "download" && "Downloaded by"} 
                          {activity.type === "view" && "Viewed by"}
                          {activity.type === "upload" && "Uploaded"}
                          {activity.type === "verification" && "Verified"}
                          <span className="text-gray-400"> {activity.user}</span>
                        </p>
                        <p className="text-xs text-gray-500">{activity.dataset}</p>
                        <p className="text-xs text-gray-600">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "datasets" && (
          <div className="space-y-6">
            {loading ? (
              <Card className="bg-gray-800/50 border-gray-700 p-8 rounded-3xl text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading your datasets...</p>
              </Card>
            ) : userDatasets.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700 p-8 rounded-3xl text-center">
                <Database className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No datasets yet</h3>
                <p className="text-gray-500 mb-6">Upload your first dataset to get started</p>
                <Link href="/upload">
                  <Button className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Dataset
                  </Button>
                </Link>
              </Card>
            ) : (
              userDatasets.map((dataset) => (
              <Card key={dataset.id} className="bg-gray-800/50 border-gray-700 p-6 rounded-3xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{dataset.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        dataset.status === "verified" 
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {dataset.status}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-4">{dataset.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Downloads</p>
                        <p className="text-white font-medium">{dataset.downloads}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Views</p>
                        <p className="text-white font-medium">{dataset.views}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Size</p>
                        <p className="text-white font-medium">{dataset.size}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Trust Score</p>
                        <p className="text-white font-medium">{dataset.trustScore}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )))}
          </div>
        )}

        {activeTab === "activity" && (
          <Card className="bg-gray-800/50 border-gray-700 p-6 rounded-3xl">
            <h3 className="text-xl font-semibold text-white mb-6">Activity Timeline</h3>
            <div className="space-y-6">
              {mockUserData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    activity.type === "download" ? "bg-blue-400" :
                    activity.type === "view" ? "bg-green-400" :
                    activity.type === "upload" ? "bg-purple-400" : "bg-yellow-400"
                  }`} />
                  <div className="flex-1 pb-6 border-b border-gray-700 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">
                        {activity.type === "download" && "Dataset Downloaded"} 
                        {activity.type === "view" && "Dataset Viewed"}
                        {activity.type === "upload" && "Dataset Uploaded"}
                        {activity.type === "verification" && "Dataset Verified"}
                      </p>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                    <p className="text-gray-400">{activity.dataset}</p>
                    <p className="text-sm text-gray-500">by {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "pinata" && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-green-900/20 to-green-800/20 border-green-700/50 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-green-300">Pinata IPFS Files</h3>
                  <p className="text-green-400/80">
                    Manage and preview files from your Pinata account
                  </p>
                </div>
                <Button
                  onClick={fetchAllDatasets}
                  variant="outline"
                  className="border-green-600 text-green-300 hover:bg-green-700/20 rounded-xl"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {pinataFiles.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-16 w-16 text-green-600/50 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-green-400 mb-2">No Pinata Files Found</h4>
                  <p className="text-green-400/70 mb-6">Upload files to your Pinata account to see them here</p>
                  <Button
                    onClick={() => window.open('https://app.pinata.cloud', '_blank')}
                    className="bg-green-600 hover:bg-green-700 rounded-xl"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Pinata Dashboard
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinataFiles.map((file) => (
                    <Card key={file.id} className="bg-gray-800/50 border-green-700/30 p-6 rounded-2xl">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white">{file.title}</h4>
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                            Pinata
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{file.description}</p>
                        <div className="flex items-center gap-4 text-xs text-green-400 mb-4">
                          <span>📁 {file.size}</span>
                          <span>⬇️ {file.downloads}</span>
                          <span>👁️ {file.views || 0}</span>
                          <span>🔗 CID: {file.cid?.slice(0, 8)}...</span>
                        </div>
                      </div>
                      
                      {file.cid && (
                        <div className="space-y-3">
                          <SmartFileViewer
                            cid={file.cid}
                            filename={file.title}
                            size={file.size}
                          />
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => window.open(`/datasets/${file.id}`, '_blank')}
                              size="sm"
                              variant="outline"
                              className="border-green-600 text-green-300 hover:bg-green-700/20 rounded-xl flex-1"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                            <Button
                              onClick={() => window.open(`https://brown-imaginative-bug-610.mypinata.cloud/ipfs/${file.cid}`, '_blank')}
                              size="sm"
                              variant="outline"
                              className="border-green-600 text-green-300 hover:bg-green-700/20 rounded-xl"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}