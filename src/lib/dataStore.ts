// Simple in-memory data store for development
// In production, this would be replaced with a proper database

interface Dataset {
  id: string;
  creator: string;
  cid: string;
  hash: string;
  name: string;
  description: string;
  license: string;
  category: string;
  tags: string[];
  status: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  size: number;
  downloads: number;
  views: number;
  trustScore: number;
}

interface AccessRecord {
  datasetId: string;
  purchasers: string[];
}

class DataStore {
  private datasets: Map<string, Dataset> = new Map();
  private accessRecords: Map<string, AccessRecord> = new Map();
  private nextId: number = 1;

  // Generate a unique dataset ID
  generateId(): string {
    return `dataset_${this.nextId++}`;
  }

  // Store a dataset
  storeDataset(dataset: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt' | 'downloads' | 'views' | 'trustScore'>): Dataset {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    const fullDataset: Dataset = {
      ...dataset,
      id,
      createdAt: now,
      updatedAt: now,
      downloads: 0,
      views: 0,
      trustScore: Math.floor(Math.random() * 20) + 80, // Random trust score between 80-100
    };

    this.datasets.set(id, fullDataset);
    
    // Initialize access record for gated datasets
    if (dataset.status === 'NFT_Gated') {
      this.accessRecords.set(id, {
        datasetId: id,
        purchasers: []
      });
    }

    return fullDataset;
  }

  // Get a dataset by ID
  getDataset(id: string): Dataset | null {
    return this.datasets.get(id) || null;
  }

  // Get datasets by creator
  getDatasetsByCreator(creator: string): Dataset[] {
    return Array.from(this.datasets.values()).filter(dataset => dataset.creator === creator);
  }

  // Get all datasets
  getAllDatasets(): Dataset[] {
    return Array.from(this.datasets.values());
  }

  // Update dataset views
  incrementViews(id: string): void {
    const dataset = this.datasets.get(id);
    if (dataset) {
      dataset.views++;
      dataset.updatedAt = new Date().toISOString();
    }
  }

  // Update dataset downloads
  incrementDownloads(id: string): void {
    const dataset = this.datasets.get(id);
    if (dataset) {
      dataset.downloads++;
      dataset.updatedAt = new Date().toISOString();
    }
  }

  // Add purchaser to access record
  addPurchaser(datasetId: string, purchaser: string): void {
    const accessRecord = this.accessRecords.get(datasetId);
    if (accessRecord && !accessRecord.purchasers.includes(purchaser)) {
      accessRecord.purchasers.push(purchaser);
    }
  }

  // Check if user has access
  hasAccess(datasetId: string, user: string): boolean {
    const dataset = this.datasets.get(datasetId);
    if (!dataset) return false;

    // Public datasets are accessible to everyone
    if (dataset.status === 'Public') return true;

    // Private datasets only accessible to creator
    if (dataset.status === 'Private') return user === dataset.creator;

    // NFT gated datasets require purchase or ownership
    if (dataset.status === 'NFT_Gated') {
      if (user === dataset.creator) return true;
      
      const accessRecord = this.accessRecords.get(datasetId);
      return accessRecord ? accessRecord.purchasers.includes(user) : false;
    }

    return false;
  }

  // Get access record
  getAccessRecord(datasetId: string): AccessRecord | null {
    return this.accessRecords.get(datasetId) || null;
  }

  // Clear all data (for testing)
  clear(): void {
    this.datasets.clear();
    this.accessRecords.clear();
    this.nextId = 1;
  }

  // Get statistics
  getStats() {
    const datasets = this.getAllDatasets();
    return {
      totalDatasets: datasets.length,
      totalDownloads: datasets.reduce((sum, d) => sum + d.downloads, 0),
      totalViews: datasets.reduce((sum, d) => sum + d.views, 0),
      uniqueCreators: new Set(datasets.map(d => d.creator)).size,
      verifiedDatasets: datasets.filter(d => d.trustScore >= 90).length,
    };
  }
}

// Export a singleton instance
export const dataStore = new DataStore();

// Export types
export type { Dataset, AccessRecord };