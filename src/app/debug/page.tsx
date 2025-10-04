"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, RefreshCw } from "lucide-react";

export default function DebugPage() {
  const [debugData, setDebugData] = useState<any>(null);
  const [datasetsData, setDatasetsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-blockchain');
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      console.error('Debug fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatasetsData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/datasets');
      const data = await response.json();
      setDatasetsData(data);
    } catch (error) {
      console.error('Datasets fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
    fetchDatasetsData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text">Debug Dashboard</h1>
          <p className="text-gray-300">Debug blockchain and API data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Blockchain Debug */}
          <Card className="bg-gray-800/50 border-gray-700 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Blockchain Debug</h2>
              <Button
                onClick={fetchDebugData}
                disabled={loading}
                variant="outline"
                className="border-purple-600 text-purple-300 hover:bg-purple-700/20"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {debugData ? (
              <div className="space-y-4">
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <h3 className="font-medium text-purple-300 mb-2">Configuration</h3>
                  <div className="text-sm space-y-1">
                    <div><span className="text-gray-400">Module:</span> <span className="font-mono text-white">{debugData.debug?.moduleAddress}</span></div>
                    <div><span className="text-gray-400">Service:</span> <span className="font-mono text-white">{debugData.debug?.serviceAccount}</span></div>
                    <div><span className="text-gray-400">Network:</span> <span className="text-white">{debugData.debug?.network}</span></div>
                  </div>
                </div>

                {debugData.debug?.datasets && (
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h3 className="font-medium text-green-300 mb-2">Dataset Registries</h3>
                    
                    {debugData.debug.datasets.serviceAccount && (
                      <div className="mb-3">
                        <div className="text-sm text-gray-400">Service Account:</div>
                        <div className="text-sm">
                          <span className="text-white">Count: {debugData.debug.datasets.serviceAccount.count || 0}</span>
                          {debugData.debug.datasets.serviceAccount.error && (
                            <span className="text-red-400 ml-2">Error: {debugData.debug.datasets.serviceAccount.error}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {debugData.debug.datasets.moduleAddress && (
                      <div>
                        <div className="text-sm text-gray-400">Module Address:</div>
                        <div className="text-sm">
                          <span className="text-white">Count: {debugData.debug.datasets.moduleAddress.count || 0}</span>
                          {debugData.debug.datasets.moduleAddress.error && (
                            <span className="text-red-400 ml-2">Error: {debugData.debug.datasets.moduleAddress.error}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-gray-700/30 rounded-xl p-4">
                  <h3 className="font-medium text-blue-300 mb-2">Raw Response</h3>
                  <pre className="text-xs text-gray-300 overflow-auto max-h-40">
                    {JSON.stringify(debugData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading blockchain debug data...</p>
              </div>
            )}
          </Card>

          {/* Datasets API Debug */}
          <Card className="bg-gray-800/50 border-gray-700 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Datasets API</h2>
              <Button
                onClick={fetchDatasetsData}
                disabled={loading}
                variant="outline"
                className="border-green-600 text-green-300 hover:bg-green-700/20"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {datasetsData ? (
              <div className="space-y-4">
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <h3 className="font-medium text-green-300 mb-2">API Response</h3>
                  <div className="text-sm space-y-1">
                    <div><span className="text-gray-400">Success:</span> <span className="text-white">{datasetsData.success ? 'Yes' : 'No'}</span></div>
                    <div><span className="text-gray-400">Datasets:</span> <span className="text-white">{datasetsData.datasets?.length || 0}</span></div>
                    {datasetsData.error && (
                      <div><span className="text-gray-400">Error:</span> <span className="text-red-400">{datasetsData.error}</span></div>
                    )}
                  </div>
                </div>

                {datasetsData.datasets && datasetsData.datasets.length > 0 && (
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h3 className="font-medium text-blue-300 mb-2">Datasets Found</h3>
                    <div className="space-y-2">
                      {datasetsData.datasets.map((dataset: any, index: number) => (
                        <div key={index} className="text-sm border-l-2 border-purple-500 pl-3">
                          <div className="text-white font-medium">{dataset.title}</div>
                          <div className="text-gray-400">Creator: {dataset.creator}</div>
                          <div className="text-gray-400">ID: {dataset.id}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-700/30 rounded-xl p-4">
                  <h3 className="font-medium text-orange-300 mb-2">Raw Response</h3>
                  <pre className="text-xs text-gray-300 overflow-auto max-h-40">
                    {JSON.stringify(datasetsData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading datasets data...</p>
              </div>
            )}
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">
            Use this page to debug blockchain connectivity and dataset fetching issues.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => window.open('/explore', '_blank')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Open Explore Page
            </Button>
            <Button
              onClick={() => window.open('/test-backend', '_blank')}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Open Test Backend
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}