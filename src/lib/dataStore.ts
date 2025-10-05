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

// Create and populate the singleton instance
export const dataStore = new DataStore();

// Add some dummy datasets for demonstration
const dummyDatasets = [
  {
    creator: "0x6069bfc76f707ec5fff32d1fbced5575eb3069ef94f4ee11dd1be1a3ee5d6a6d",
    cid: "QmXNT8ps3MAv2FmCNeeXnzuudfQJR7JKMEKwdrsboyerFt",
    hash: "0x1234567890abcdef1234567890abcdef12345678",
    name: "Resume",
    description: "om resume",
    license: "MIT",
    category: "Personal",
    tags: [],
    status: "Public",
    price: 0,
    size: 1048576 // 1MB
  },
  {
    creator: "0x1234567890abcdef1234567890abcdef12345678",
    cid: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    hash: "0xabcdef1234567890abcdef1234567890abcdef12",
    name: "COVID-19 Research Dataset",
    description: "Comprehensive COVID-19 research data with patient demographics and treatment outcomes",
    license: "CC BY 4.0",
    category: "Healthcare",
    tags: ["covid-19", "healthcare", "research", "medical"],
    status: "Public",
    price: 0,
    size: 2415919104 // 2.3GB
  },
  {
    creator: "0x2345678901bcdef12345678901bcdef123456789",
    cid: "QmPreviousHashExample123456789abcdef",
    hash: "0xbcdef12345678901bcdef12345678901bcdef123",
    name: "Climate Change Satellite Data",
    description: "Satellite imagery and climate measurements from 2020-2024 for environmental research",
    license: "Open Data Commons",
    category: "Environment",
    tags: ["climate", "satellite", "environment", "research"],
    status: "Public",
    price: 0,
    size: 16859832320 // 15.7GB
  },
  {
    creator: "0x3456789012cdef123456789012cdef1234567890",
    cid: "QmFinancialDataExample987654321fedcba",
    hash: "0xcdef123456789012cdef123456789012cdef1234",
    name: "Financial Market Analysis",
    description: "Stock market data and trading patterns for machine learning training",
    license: "Commercial",
    category: "Finance",
    tags: ["finance", "trading", "machine-learning", "stocks"],
    status: "NFT_Gated",
    price: 50,
    size: 5476515840 // 5.1GB
  },
  {
    creator: "0x4567890123def1234567890123def12345678901",
    cid: "QmGenomicsDataExample456789012345abcd",
    hash: "0xdef1234567890123def1234567890123def12345",
    name: "Human Genome Variants",
    description: "Anonymized human genome variant data for genetic research and drug discovery",
    license: "Research Only",
    category: "Genomics",
    tags: ["genomics", "genetics", "research", "healthcare"],
    status: "Private",
    price: 0,
    size: 12884901888 // 12GB
  },
  {
    creator: "0x5678901234ef12345678901234ef123456789012",
    cid: "QmAITrainingDataExample789012345678efgh",
    hash: "0xef12345678901234ef12345678901234ef123456",
    name: "Computer Vision Training Set",
    description: "Large-scale image dataset with annotations for computer vision model training",
    license: "MIT",
    category: "AI/ML",
    tags: ["computer-vision", "ai", "machine-learning", "images"],
    status: "Public",
    price: 0,
    size: 53687091200 // 50GB
  },
  {
    creator: "0x6789012345f123456789012345f1234567890123",
    cid: "QmIoTSensorDataExample901234567890ijkl",
    hash: "0xf123456789012345f123456789012345f1234567",
    name: "Smart City IoT Sensor Data",
    description: "Real-time sensor data from smart city infrastructure including traffic, air quality, and energy usage",
    license: "CC BY-SA 4.0",
    category: "IoT",
    tags: ["iot", "smart-city", "sensors", "urban-planning"],
    status: "Public",
    price: 0,
    size: 8589934592 // 8GB
  },
  {
    creator: "0x7890123456f1234567890123456f12345678901234",
    cid: "QmSocialMediaDataExample012345678901mnop",
    hash: "0xf1234567890123456f1234567890123456f123456",
    name: "Social Media Sentiment Analysis",
    description: "Anonymized social media posts with sentiment labels for NLP research",
    license: "Academic Use Only",
    category: "NLP",
    tags: ["nlp", "sentiment-analysis", "social-media", "text-mining"],
    status: "NFT_Gated",
    price: 25,
    size: 3221225472 // 3GB
  },
  {
    creator: "0x8901234567f12345678901234567f123456789012",
    cid: "QmBlockchainDataExample123456789012qrst",
    hash: "0xf12345678901234567f12345678901234567f12345",
    name: "Blockchain Transaction Analysis",
    description: "Historical blockchain transaction data with privacy-preserving analytics",
    license: "Open Source",
    category: "Blockchain",
    tags: ["blockchain", "cryptocurrency", "transactions", "analytics"],
    status: "Public",
    price: 0,
    size: 21474836480 // 20GB
  },
  {
    creator: "0x9012345678f123456789012345678f1234567890",
    cid: "QmEducationDataExample234567890123uvwx",
    hash: "0xf123456789012345678f123456789012345678f123",
    name: "Educational Performance Dataset",
    description: "Anonymized student performance data for educational research and policy analysis",
    license: "Educational Use",
    category: "Education",
    tags: ["education", "student-performance", "research", "policy"],
    status: "Private",
    price: 0,
    size: 1073741824 // 1GB
  }
];

// Populate the dataStore with dummy data
dummyDatasets.forEach(dataset => {
  dataStore.storeDataset(dataset);
});

console.log(`Initialized dataStore with ${dummyDatasets.length} dummy datasets`);

// Export types
export type { Dataset, AccessRecord };