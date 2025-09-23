import { useState, useCallback } from 'react';
import CryptoJS from 'crypto-js';

export interface BlockchainTransaction {
  id: string;
  timestamp: string;
  data: any;
  hash: string;
  previousHash: string;
  merkleRoot?: string;
  signature?: string;
}

export interface ProvenanceRecord {
  transactionId: string;
  entityType: 'collection' | 'processing' | 'testing' | 'manufacturing' | 'packaging';
  entityId: string;
  data: any;
  location?: { lat: number; lng: number };
  timestamp: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  blockHash: string;
}

export const useBlockchain = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const generateHash = useCallback((data: any, previousHash: string = ''): string => {
    const dataString = JSON.stringify(data);
    const timestamp = Date.now().toString();
    const nonce = Math.random().toString(36).substring(7);
    
    return CryptoJS.SHA256(dataString + previousHash + timestamp + nonce).toString();
  }, []);

  const generateMerkleRoot = useCallback((transactions: any[]): string => {
    if (transactions.length === 0) return '';
    if (transactions.length === 1) return CryptoJS.SHA256(JSON.stringify(transactions[0])).toString();
    
    let level = transactions.map(tx => CryptoJS.SHA256(JSON.stringify(tx)).toString());
    
    while (level.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = i + 1 < level.length ? level[i + 1] : left;
        nextLevel.push(CryptoJS.SHA256(left + right).toString());
      }
      level = nextLevel;
    }
    
    return level[0];
  }, []);

  const createTransaction = useCallback(async (
    entityType: ProvenanceRecord['entityType'],
    entityData: any,
    previousHash?: string
  ): Promise<BlockchainTransaction> => {
    setIsProcessing(true);
    
    try {
      const transaction: BlockchainTransaction = {
        id: CryptoJS.lib.WordArray.random(16).toString(),
        timestamp: new Date().toISOString(),
        data: {
          entityType,
          ...entityData,
          location: entityData.coordinates || null,
        },
        hash: '',
        previousHash: previousHash || '',
      };
      
      transaction.hash = generateHash(transaction.data, transaction.previousHash);
      
      // Simulate blockchain processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return transaction;
    } finally {
      setIsProcessing(false);
    }
  }, [generateHash]);

  const verifyTransaction = useCallback((transaction: BlockchainTransaction): boolean => {
    const computedHash = generateHash(transaction.data, transaction.previousHash);
    return computedHash === transaction.hash;
  }, [generateHash]);

  const createProvenanceChain = useCallback((records: ProvenanceRecord[]): string => {
    const merkleRoot = generateMerkleRoot(records);
    return merkleRoot;
  }, [generateMerkleRoot]);

  const validateSupplyChain = useCallback((chain: ProvenanceRecord[]): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];
    
    // Check chronological order
    for (let i = 1; i < chain.length; i++) {
      const prev = new Date(chain[i - 1].timestamp);
      const curr = new Date(chain[i].timestamp);
      
      if (curr < prev) {
        errors.push(`Invalid timestamp order at index ${i}`);
      }
    }
    
    // Validate entity type progression
    const validProgression = ['collection', 'processing', 'testing', 'manufacturing', 'packaging'];
    const chainTypes = chain.map(r => r.entityType);
    
    for (let i = 1; i < chainTypes.length; i++) {
      const prevIndex = validProgression.indexOf(chainTypes[i - 1]);
      const currIndex = validProgression.indexOf(chainTypes[i]);
      
      if (currIndex < prevIndex) {
        errors.push(`Invalid supply chain progression: ${chainTypes[i - 1]} -> ${chainTypes[i]}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return {
    isProcessing,
    createTransaction,
    verifyTransaction,
    createProvenanceChain,
    validateSupplyChain,
    generateHash,
    generateMerkleRoot,
  };
};