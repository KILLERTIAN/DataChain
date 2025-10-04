"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatasetCard } from "@/components/DatasetCard";
import { Search, Filter, Grid, List, Database, Users, Calendar, Shield } from "lucide-react";

function ExplorePage() {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("downloads");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch datasets from API
  const fetchDatasets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
      params.append('sortBy', sortBy);

      console.log('Fetching datasets with params:', params.toString());
      
      const response = await fetch(`/api/datasets?${params}`);
      const data = await response.json();

      console.log('Datasets API response:', data);

      if (data.success) {
        setDatasets(data.datasets || []);
        setStats(data.stats || {});
        setError(null);
        console.log('Datasets loaded:', data.datasets?.length || 0);
      } else {
        setError(data.error || 'Failed to fetch datasets');
        console.error('API error:', data.error);
      }
    } catch (err) {
      setError('Failed to fetch datasets');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchDatasets();
  }, [search, selectedTags, sortBy]);

  // Get all unique tags from datasets
  const allTags = Array.from(new Set(datasets.flatMap(d => d.tags || [])));

  const filteredDatasets = datasets
    .filter((dataset) => {
      const matchesSearch = dataset.title.toLowerCase().includes(search.toLowerCase()) ||
        dataset.description.toLowerCase().includes(search.toLowerCase()) ||
        dataset.creator.toLowerCase().includes(search.toLowerCase());

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(tag => dataset.tags.includes(tag));

      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "downloads":
          return b.downloads - a.downloads;
        case "trustScore":
          return b.trustScore - a.trustScore;
        case "size":
          return parseFloat(b.size) - parseFloat(a.size);
        case "recent":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white cyber-grid">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            Explore Datasets
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Discover verified, blockchain-registered datasets from researchers and organizations worldwide.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="web3-card p-6 rounded-2xl group">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/20">
                <Database className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors">{stats.totalDatasets || 0}</p>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Total Datasets</p>
              </div>
            </div>
          </Card>

          <Card className="web3-card p-6 rounded-2xl group">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">{stats.uniqueCreators || 0}</p>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Contributors</p>
              </div>
            </div>
          </Card>

          <Card className="web3-card p-6 rounded-2xl group">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center border border-green-500/20">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white group-hover:text-green-200 transition-colors">{stats.verifiedDatasets || 0}</p>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Verified</p>
              </div>
            </div>
          </Card>

          <Card className="web3-card p-6 rounded-2xl group">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center border border-orange-500/20">
                <Calendar className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white group-hover:text-orange-200 transition-colors">24h</p>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Latest Update</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search datasets by title, description, or creator..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 rounded-2xl h-12"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>

              <Button
                variant="outline"
                onClick={fetchDatasets}
                disabled={loading}
                className="border-purple-600 text-purple-300 hover:bg-purple-700/20 rounded-xl"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400 mr-2"></div>
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-gray-600 text-white rounded-xl px-3 py-2"
              >
                <option value="downloads">Most Downloaded</option>
                <option value="trustScore">Highest Trust Score</option>
                <option value="recent">Most Recent</option>
                <option value="size">Largest Size</option>
              </select>

              <div className="flex border border-gray-600 rounded-xl overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mt-4 bg-gray-800/30 border-gray-700 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4 text-white">Filter by Tags</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full ${selectedTags.includes(tag)
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "border-gray-600 text-gray-300 hover:bg-gray-700"
                      }`}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="mt-3 text-gray-400 hover:text-white"
                >
                  Clear all filters
                </Button>
              )}
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-400">
            Showing {filteredDatasets.length} of {datasets.length} datasets
          </p>
          
          {/* Debug Info */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => window.open('/api/test-datasets', '_blank')}
              variant="outline"
              size="sm"
              className="border-yellow-600 text-yellow-300 hover:bg-yellow-700/20 rounded-xl"
            >
              Debug Blockchain
            </Button>
            
            <Button
              onClick={() => {
                console.log('Current datasets:', datasets);
                console.log('Filtered datasets:', filteredDatasets);
                console.log('Stats:', stats);
              }}
              variant="outline"
              size="sm"
              className="border-blue-600 text-blue-300 hover:bg-blue-700/20 rounded-xl"
            >
              Log Data
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Loading datasets...</h3>
            <p className="text-gray-500">Fetching the latest data from the blockchain</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <Database className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-400 mb-2">Error loading datasets</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchDatasets} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
              Try Again
            </Button>
          </div>
        )}

        {/* Dataset Grid/List */}
        {!loading && !error && (viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDatasets.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                title={dataset.title}
                creator={dataset.creator}
                trustScore={dataset.trustScore}
                href={`/datasets/${dataset.id}`}
                description={dataset.description}
                tags={dataset.tags}
                size={dataset.size}
                downloads={dataset.downloads}
                verified={dataset.verified}
                licenseType={dataset.licenseType}
                cid={dataset.cid}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDatasets.map((dataset) => (
              <Card key={dataset.id} className="bg-gray-800/50 border-gray-700 p-6 rounded-2xl hover:bg-gray-800/70 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{dataset.title}</h3>
                      {dataset.verified && (
                        <Shield className="h-5 w-5 text-green-400" />
                      )}
                    </div>
                    <p className="text-gray-400 mb-3">{dataset.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {dataset.tags?.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <span>Creator: {dataset.creator}</span>
                      <span>Size: {dataset.size}</span>
                      <span>Downloads: {dataset.downloads}</span>
                      <span>Trust Score: {dataset.trustScore}%</span>
                    </div>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ))}

        {filteredDatasets.length === 0 && (
          <div className="text-center py-12">
            <Database className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No datasets found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExplorePage;