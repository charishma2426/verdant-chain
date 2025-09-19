// Data models for Ayurvedic herb traceability system

export interface Farmer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  certification: 'organic' | 'conventional' | 'wild-harvest';
  joinDate: string;
  totalCollections: number;
  rating: number;
  avatar?: string;
}

export interface HerbCollection {
  id: string;
  farmerId: string;
  herbName: string;
  botanicalName: string;
  quantity: number;
  unit: 'kg' | 'lbs' | 'tons';
  harvestDate: string;
  location: {
    coordinates: {
      lat: number;
      lng: number;
    };
    region: string;
  };
  qualityGrade: 'premium' | 'standard' | 'basic';
  moisture: number;
  contaminants: boolean;
  images: string[];
  blockchainHash: string;
  status: 'collected' | 'in-transit' | 'processing' | 'completed';
}

export interface ProcessingStage {
  id: string;
  collectionId: string;
  stage: 'drying' | 'testing' | 'grinding' | 'formulation' | 'packaging';
  startDate: string;
  endDate?: string;
  facility: string;
  operator: string;
  parameters: Record<string, any>;
  qualityChecks: QualityCheck[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  blockchainHash: string;
}

export interface QualityCheck {
  id: string;
  parameter: string;
  value: number | string;
  unit?: string;
  acceptable: boolean;
  timestamp: string;
  inspector: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  ingredients: {
    collectionId: string;
    herbName: string;
    percentage: number;
  }[];
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  qrCode: string;
  certifications: string[];
  blockchainHash: string;
}

export interface TraceabilityRecord {
  id: string;
  timestamp: string;
  type: 'collection' | 'processing' | 'quality-check' | 'transfer' | 'formulation';
  actor: string;
  location: string;
  data: Record<string, any>;
  previousHash: string;
  hash: string;
}