import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQRCode } from '@/hooks/useQRCode';
import { useBlockchain } from '@/hooks/useBlockchain';
import { supabase } from '@/integrations/supabase/client';
import {
  Package,
  QrCode,
  Factory,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Layers,
  Scale,
  Timer,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ManufacturingRecord {
  id?: string;
  batchCode: string;
  productName: string;
  productType: 'capsule' | 'powder' | 'extract' | 'tablet' | 'syrup' | 'oil';
  testResultIds: string[];
  compositionDetails: {
    [herbType: string]: {
      percentage: number;
      batchId: string;
      testCertificate: string;
    };
  };
  totalHerbQuantityUsed: number;
  finalProductQuantity: number;
  manufacturingDate: string;
  sensorData: {
    temperature: number[];
    humidity: number[];
    pressure: number[];
    timestamps: string[];
  };
  manufacturingCompanyId: string;
  createdBy: string;
  status: 'manufactured' | 'quality_checked' | 'sent_to_packaging' | 'completed';
}

interface ProvenanceData {
  productId: string;
  batchCode: string;
  supplyChain: {
    collection: any[];
    processing: any[];
    testing: any[];
    manufacturing: ManufacturingRecord;
  };
  verificationHash: string;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending';
}

const ManufacturerPortal = () => {
  const { toast } = useToast();
  const { generateProductQR, isGenerating } = useQRCode();
  const { createTransaction, createProvenanceChain, isProcessing } = useBlockchain();
  
  const [manufacturingRecords, setManufacturingRecords] = useState<ManufacturingRecord[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [provenanceData, setProvenanceData] = useState<ProvenanceData[]>([]);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState<Partial<ManufacturingRecord>>({
    productType: 'capsule',
    compositionDetails: {},
    status: 'manufactured',
    sensorData: {
      temperature: [],
      humidity: [],
      pressure: [],
      timestamps: [],
    },
  });

  const productTypes = [
    { value: 'capsule', label: 'Capsules' },
    { value: 'powder', label: 'Powder' },
    { value: 'extract', label: 'Liquid Extract' },
    { value: 'tablet', label: 'Tablets' },
    { value: 'syrup', label: 'Syrup' },
    { value: 'oil', label: 'Essential Oil' },
  ];

  // Load test results for manufacturing
  useEffect(() => {
    loadTestResults();
  }, []);

  const loadTestResults = async () => {
    try {
      const { data, error } = await supabase
        .from('quality_tests')
        .select(`
          *,
          collection_events (*),
          processing_steps (*)
        `)
        .eq('passed', true)
        .order('test_timestamp', { ascending: false });

      if (error) throw error;
      setTestResults(data || []);
    } catch (error) {
      console.error('Error loading test results:', error);
    }
  };

  const addCompositionItem = () => {
    const herbType = `herb_${Object.keys(formData.compositionDetails || {}).length + 1}`;
    setFormData(prev => ({
      ...prev,
      compositionDetails: {
        ...prev.compositionDetails,
        [herbType]: {
          percentage: 0,
          batchId: '',
          testCertificate: '',
        },
      },
    }));
  };

  const updateCompositionItem = (herbType: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      compositionDetails: {
        ...prev.compositionDetails,
        [herbType]: {
          ...prev.compositionDetails![herbType],
          [field]: value,
        },
      },
    }));
  };

  const removeCompositionItem = (herbType: string) => {
    const newComposition = { ...formData.compositionDetails };
    delete newComposition[herbType];
    setFormData(prev => ({ ...prev, compositionDetails: newComposition }));
  };

  const validateManufacturing = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.productName) errors.push('Product name is required');
    if (!formData.batchCode) errors.push('Batch code is required');
    if (!formData.finalProductQuantity || formData.finalProductQuantity <= 0) {
      errors.push('Final product quantity must be greater than 0');
    }
    if (!formData.compositionDetails || Object.keys(formData.compositionDetails).length === 0) {
      errors.push('At least one composition item is required');
    }
    
    // Validate composition percentages sum to 100%
    const totalPercentage = Object.values(formData.compositionDetails || {})
      .reduce((sum, item) => sum + item.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.1) {
      errors.push('Composition percentages must sum to 100%');
    }
    
    return errors;
  };

  const createManufacturingRecord = async () => {
    const errors = validateManufacturing();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    const record: ManufacturingRecord = {
      id: crypto.randomUUID(),
      batchCode: formData.batchCode!,
      productName: formData.productName!,
      productType: formData.productType!,
      testResultIds: Object.values(formData.compositionDetails!)
        .map(item => item.testCertificate)
        .filter(Boolean),
      compositionDetails: formData.compositionDetails!,
      totalHerbQuantityUsed: formData.totalHerbQuantityUsed!,
      finalProductQuantity: formData.finalProductQuantity!,
      manufacturingDate: new Date().toISOString(),
      sensorData: {
        ...formData.sensorData!,
        timestamps: [new Date().toISOString()],
        temperature: [25], // Mock sensor data
        humidity: [45],
        pressure: [1013],
      },
      manufacturingCompanyId: 'current-company-id', // Replace with actual company ID
      createdBy: 'current-user-id', // Replace with actual user ID
      status: 'manufactured',
    };

    try {
      // Create blockchain transaction
      const transaction = await createTransaction('manufacturing', record);

      // Save to Supabase
      const { error } = await supabase
        .from('manufacturing_records')
        .insert({
          batch_code: record.batchCode,
          product_name: record.productName,
          product_type: record.productType,
          test_result_ids: record.testResultIds,
          composition_details: record.compositionDetails,
          total_herb_quantity_used_kg: record.totalHerbQuantityUsed,
          final_product_quantity: record.finalProductQuantity,
          manufacturing_date: record.manufacturingDate,
          sensor_data: record.sensorData,
          manufacturing_company_id: record.manufacturingCompanyId,
          created_by: record.createdBy,
          status: record.status,
        });

      if (error) throw error;

      setManufacturingRecords(prev => [...prev, record]);

      toast({
        title: "Manufacturing record created",
        description: `Batch ${record.batchCode} recorded on blockchain`,
      });

      // Reset form
      setFormData({
        productType: 'capsule',
        compositionDetails: {},
        status: 'manufactured',
        sensorData: {
          temperature: [],
          humidity: [],
          pressure: [],
          timestamps: [],
        },
      });

    } catch (error) {
      console.error('Error creating manufacturing record:', error);
      toast({
        title: "Error",
        description: "Failed to create manufacturing record",
        variant: "destructive",
      });
    }
  };

  const generateProvenanceData = async (record: ManufacturingRecord) => {
    try {
      // Collect all supply chain data
      const collectionData = await supabase
        .from('collection_events')
        .select('*')
        .in('id', record.testResultIds);
      
      const processingData = await supabase
        .from('processing_steps')
        .select('*')
        .in('collection_event_id', record.testResultIds);
      
      const testingData = await supabase
        .from('quality_tests')
        .select('*')
        .in('id', record.testResultIds);

      const supplyChain = {
        collection: collectionData.data || [],
        processing: processingData.data || [],
        testing: testingData.data || [],
        manufacturing: record,
      };

      // Create provenance chain hash
      const verificationHash = createProvenanceChain([
        ...supplyChain.collection.map(item => ({
          transactionId: item.id,
          entityType: 'collection' as const,
          entityId: item.id,
          data: item,
          timestamp: item.harvest_timestamp,
          verificationStatus: 'verified' as const,
          blockHash: item.block_hash,
        })),
        ...supplyChain.processing.map(item => ({
          transactionId: item.id,
          entityType: 'processing' as const,
          entityId: item.id,
          data: item,
          timestamp: item.start_timestamp,
          verificationStatus: 'verified' as const,
          blockHash: item.block_hash,
        })),
        ...supplyChain.testing.map(item => ({
          transactionId: item.id,
          entityType: 'testing' as const,
          entityId: item.id,
          data: item,
          timestamp: item.test_timestamp,
          verificationStatus: 'verified' as const,
          blockHash: item.block_hash,
        })),
        {
          transactionId: record.id!,
          entityType: 'manufacturing' as const,
          entityId: record.id!,
          data: record,
          timestamp: record.manufacturingDate,
          verificationStatus: 'verified' as const,
          blockHash: '',
        },
      ]);

      const provenance: ProvenanceData = {
        productId: record.id!,
        batchCode: record.batchCode,
        supplyChain,
        verificationHash,
        complianceStatus: 'compliant',
      };

      setProvenanceData(prev => [...prev, provenance]);

      // Generate product QR code
      const qrData = await generateProductQR({
        productId: record.id!,
        name: record.productName,
        type: record.productType,
        batchIds: [record.batchCode],
        packagingDate: new Date().toISOString(),
        verificationUrl: `https://verify.ayurtrace.com/product/${record.id}`,
      });

      // Download QR code
      const link = document.createElement('a');
      link.download = `product-${record.batchCode}-qr.png`;
      link.href = qrData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Provenance generated",
        description: `Complete supply chain trace and QR code created for ${record.batchCode}`,
      });

    } catch (error) {
      console.error('Error generating provenance:', error);
      toast({
        title: "Error",
        description: "Failed to generate provenance data",
        variant: "destructive",
      });
    }
  };

  const toggleRecordExpansion = (recordId: string) => {
    const newExpanded = new Set(expandedRecords);
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId);
    } else {
      newExpanded.add(recordId);
    }
    setExpandedRecords(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manufacturer Portal</h1>
          <p className="text-muted-foreground mt-1">
            Create manufacturing records and generate product QR codes
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Factory className="h-3 w-3" />
            <span>{manufacturingRecords.length} Batches Produced</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manufacturing Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="botanical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Factory className="h-5 w-5 text-primary" />
                <span>Manufacturing Record</span>
              </CardTitle>
              <CardDescription>
                Create a new manufacturing batch record
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    value={formData.productName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                    placeholder="Enter product name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="batch-code">Batch Code</Label>
                  <Input
                    id="batch-code"
                    value={formData.batchCode || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, batchCode: e.target.value }))}
                    placeholder="Enter unique batch code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-type">Product Type</Label>
                  <Select 
                    value={formData.productType} 
                    onValueChange={(value: ManufacturingRecord['productType']) => 
                      setFormData(prev => ({ ...prev, productType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="final-quantity">Final Product Quantity</Label>
                  <Input
                    id="final-quantity"
                    type="number"
                    step="0.1"
                    value={formData.finalProductQuantity || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      finalProductQuantity: parseFloat(e.target.value) 
                    }))}
                    placeholder="Units produced"
                  />
                </div>
              </div>

              {/* Composition Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Composition Details</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCompositionItem}
                  >
                    Add Ingredient
                  </Button>
                </div>
                
                {Object.entries(formData.compositionDetails || {}).map(([herbType, composition]) => (
                  <div key={herbType} className="p-3 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`herb-${herbType}`}>Ingredient</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCompositionItem(herbType)}
                        className="text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Percentage (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={composition.percentage}
                          onChange={(e) => updateCompositionItem(
                            herbType, 
                            'percentage', 
                            parseFloat(e.target.value)
                          )}
                          placeholder="0.0"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Batch ID</Label>
                        <Select
                          value={composition.batchId}
                          onValueChange={(value) => updateCompositionItem(herbType, 'batchId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                          <SelectContent>
                            {testResults.map((result) => (
                              <SelectItem key={result.id} value={result.id}>
                                {result.collection_events?.species || result.processing_steps?.step_type} - {result.test_type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Test Certificate</Label>
                        <Input
                          value={composition.testCertificate}
                          onChange={(e) => updateCompositionItem(herbType, 'testCertificate', e.target.value)}
                          placeholder="Certificate ID"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {Object.keys(formData.compositionDetails || {}).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No composition items added yet
                  </div>
                )}
                
                {Object.keys(formData.compositionDetails || {}).length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Total: {Object.values(formData.compositionDetails || {})
                      .reduce((sum, item) => sum + item.percentage, 0).toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Total Herb Quantity */}
              <div>
                <Label htmlFor="herb-quantity">Total Herb Quantity Used (kg)</Label>
                <Input
                  id="herb-quantity"
                  type="number"
                  step="0.1"
                  value={formData.totalHerbQuantityUsed || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    totalHerbQuantityUsed: parseFloat(e.target.value) 
                  }))}
                  placeholder="Total raw material used"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={createManufacturingRecord}
                  disabled={isProcessing}
                  className="flex items-center space-x-2"
                >
                  {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                  <span>Create Manufacturing Record</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Manufacturing Records */}
          {manufacturingRecords.length > 0 && (
            <Card className="botanical-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <span>Manufacturing Records</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {manufacturingRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg">
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => toggleRecordExpansion(record.id!)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{record.productName}</h4>
                            <Badge variant="outline">{record.batchCode}</Badge>
                            <Badge variant="secondary" className="capitalize">
                              {record.productType}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {record.finalProductQuantity} units
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(record.manufacturingDate).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              generateProvenanceData(record);
                            }}
                            disabled={isGenerating}
                            className="flex items-center space-x-1"
                          >
                            <QrCode className="h-3 w-3" />
                            <span>Generate QR</span>
                          </Button>
                          
                          {expandedRecords.has(record.id!) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      
                      {expandedRecords.has(record.id!) && (
                        <div className="px-4 pb-4 border-t">
                          <div className="mt-4 space-y-3">
                            <div>
                              <h5 className="text-sm font-medium mb-2">Composition</h5>
                              <div className="space-y-1">
                                {Object.entries(record.compositionDetails).map(([herb, details]) => (
                                  <div key={herb} className="text-sm flex justify-between">
                                    <span>{herb.replace('_', ' ')}</span>
                                    <span>{details.percentage}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium mb-2">Process Data</h5>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center space-x-1">
                                  <Timer className="h-3 w-3" />
                                  <span>Herb Used: {record.totalHerbQuantityUsed}kg</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Scale className="h-3 w-3" />
                                  <span>Final: {record.finalProductQuantity} units</span>
                                </div>
                                <div>
                                  <Badge variant={record.status === 'completed' ? 'default' : 'secondary'}>
                                    {record.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Status Panel */}
        <div className="space-y-6">
          {/* Production Statistics */}
          <Card className="botanical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Factory className="h-5 w-5 text-primary" />
                <span>Production Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Batches:</span>
                  <span className="font-medium">{manufacturingRecords.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completed:</span>
                  <span className="font-medium text-primary">
                    {manufacturingRecords.filter(r => r.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">In Progress:</span>
                  <span className="font-medium text-amber">
                    {manufacturingRecords.filter(r => r.status !== 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Units:</span>
                  <span className="font-medium">
                    {manufacturingRecords.reduce((sum, r) => sum + r.finalProductQuantity, 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card className="botanical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Compliance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Supply Chain Verified:</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Quality Standards:</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Compliant
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Blockchain Verified:</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="botanical-card">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={loadTestResults}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Test Results
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled={manufacturingRecords.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Records
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerPortal;