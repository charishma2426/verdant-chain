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
  Thermometer,
  Droplets,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Beaker,
  Truck
} from 'lucide-react';

interface ProcessingStep {
  id?: string;
  collectionEventId: string;
  facilityId: string;
  stepType: 'washing' | 'drying' | 'grinding' | 'extraction' | 'distillation' | 'packaging';
  startTimestamp: string;
  endTimestamp?: string;
  parameters: {
    temperature?: number;
    humidity?: number;
    duration?: number;
    pressure?: number;
    ph?: number;
  };
  environmentalConditions: {
    temperature: number;
    humidity: number;
    airQuality: number;
  };
  operatorId: string;
  qualityChecksPassed: boolean;
  notes?: string;
}

interface BatchAggregation {
  id: string;
  processingSteps: string[];
  finalProduct: {
    type: string;
    quantity: number;
    concentration?: number;
    purity?: number;
  };
  batchCode: string;
  qrCode?: string;
}

const ProcessorPortal = () => {
  const { toast } = useToast();
  const { generateBatchQR, isGenerating } = useQRCode();
  const { createTransaction, isProcessing } = useBlockchain();
  
  const [activeStep, setActiveStep] = useState<ProcessingStep | null>(null);
  const [processingHistory, setProcessingHistory] = useState<ProcessingStep[]>([]);
  const [batches, setBatches] = useState<BatchAggregation[]>([]);
  const [collectionEvents, setCollectionEvents] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<Partial<ProcessingStep>>({
    stepType: 'washing',
    parameters: {},
    environmentalConditions: {
      temperature: 25,
      humidity: 50,
      airQuality: 90,
    },
    qualityChecksPassed: true,
  });

  const processingStepTypes = [
    { value: 'washing', label: 'Washing & Cleaning' },
    { value: 'drying', label: 'Drying' },
    { value: 'grinding', label: 'Grinding/Crushing' },
    { value: 'extraction', label: 'Extraction' },
    { value: 'distillation', label: 'Distillation' },
    { value: 'packaging', label: 'Primary Packaging' },
  ];

  // Load collection events for processing
  useEffect(() => {
    loadCollectionEvents();
  }, []);

  const loadCollectionEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('collection_events')
        .select('*')
        .eq('is_validated', true)
        .order('harvest_timestamp', { ascending: false });

      if (error) throw error;
      setCollectionEvents(data || []);
    } catch (error) {
      console.error('Error loading collection events:', error);
    }
  };

  const startProcessingStep = async () => {
    if (!formData.collectionEventId || !formData.stepType) {
      toast({
        title: "Validation Error",
        description: "Please select a collection event and step type",
        variant: "destructive",
      });
      return;
    }

    const step: ProcessingStep = {
      id: crypto.randomUUID(),
      collectionEventId: formData.collectionEventId!,
      facilityId: 'current-facility-id', // Replace with actual facility ID
      stepType: formData.stepType!,
      startTimestamp: new Date().toISOString(),
      parameters: formData.parameters || {},
      environmentalConditions: formData.environmentalConditions!,
      operatorId: 'current-user-id', // Replace with actual operator ID
      qualityChecksPassed: formData.qualityChecksPassed!,
      notes: formData.notes,
    };

    try {
      // Create blockchain transaction
      const transaction = await createTransaction('processing', step);

      // Save to Supabase
      const { error } = await supabase
        .from('processing_steps')
        .insert({
          collection_event_id: step.collectionEventId,
          facility_id: step.facilityId,
          step_type: step.stepType,
          start_timestamp: step.startTimestamp,
          parameters: step.parameters,
          environmental_conditions: step.environmentalConditions,
          operator_id: step.operatorId,
          block_hash: transaction.hash,
          previous_hash: transaction.previousHash,
        });

      if (error) throw error;

      setActiveStep(step);
      
      toast({
        title: "Processing step started",
        description: `${step.stepType} process initiated`,
      });

    } catch (error) {
      console.error('Error starting processing step:', error);
      toast({
        title: "Error",
        description: "Failed to start processing step",
        variant: "destructive",
      });
    }
  };

  const completeProcessingStep = async () => {
    if (!activeStep) return;

    const updatedStep = {
      ...activeStep,
      endTimestamp: new Date().toISOString(),
    };

    try {
      // Update blockchain
      const transaction = await createTransaction('processing', updatedStep);

      // Update Supabase
      const { error } = await supabase
        .from('processing_steps')
        .update({
          end_timestamp: updatedStep.endTimestamp,
          is_validated: true,
        })
        .eq('id', activeStep.id);

      if (error) throw error;

      setProcessingHistory(prev => [...prev, updatedStep]);
      setActiveStep(null);

      toast({
        title: "Processing step completed",
        description: `${activeStep.stepType} process finished`,
      });

    } catch (error) {
      console.error('Error completing processing step:', error);
      toast({
        title: "Error",
        description: "Failed to complete processing step",
        variant: "destructive",
      });
    }
  };

  const createBatch = async (processingStepIds: string[]) => {
    const batchCode = `BATCH-${Date.now()}`;
    
    const batchData = {
      batchId: crypto.randomUUID(),
      productName: 'Processed Herb Extract',
      manufacturingDate: new Date().toISOString(),
      provenanceHash: await createTransaction('processing', { 
        type: 'batch_creation',
        processingSteps: processingStepIds,
        batchCode 
      }).then(tx => tx.hash),
    };

    try {
      // Generate QR code
      const qrCodeDataURL = await generateBatchQR(batchData);

      const batch: BatchAggregation = {
        id: batchData.batchId,
        processingSteps: processingStepIds,
        finalProduct: {
          type: 'extract',
          quantity: 100, // Calculate from processing steps
          concentration: 95,
          purity: 98,
        },
        batchCode,
        qrCode: qrCodeDataURL,
      };

      setBatches(prev => [...prev, batch]);

      toast({
        title: "Batch created",
        description: `Batch ${batchCode} with QR code generated`,
      });

      return batch;
    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: "Error",
        description: "Failed to create batch",
        variant: "destructive",
      });
    }
  };

  const downloadQRCode = (batch: BatchAggregation) => {
    if (!batch.qrCode) return;
    
    const link = document.createElement('a');
    link.download = `batch-${batch.batchCode}-qr.png`;
    link.href = batch.qrCode;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Processor Portal</h1>
          <p className="text-muted-foreground mt-1">
            Record processing steps and generate batch QR codes
          </p>
        </div>
        
        <Badge variant="secondary" className="flex items-center space-x-1">
          <Package className="h-3 w-3" />
          <span>{processingHistory.length} Steps Completed</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Processing Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Processing Step */}
          <Card className="botanical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Beaker className="h-5 w-5 text-primary" />
                <span>Processing Step</span>
              </CardTitle>
              <CardDescription>
                Start a new processing step for collected herbs
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Collection Event Selection */}
              <div>
                <Label htmlFor="collection-event">Collection Event</Label>
                <Select 
                  value={formData.collectionEventId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, collectionEventId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select collection event to process" />
                  </SelectTrigger>
                  <SelectContent>
                    {collectionEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.species} - {event.quantity}kg - {new Date(event.harvest_timestamp).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Step Type */}
              <div>
                <Label htmlFor="step-type">Processing Step</Label>
                <Select 
                  value={formData.stepType} 
                  onValueChange={(value: ProcessingStep['stepType']) => setFormData(prev => ({ ...prev, stepType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select processing step" />
                  </SelectTrigger>
                  <SelectContent>
                    {processingStepTypes.map((step) => (
                      <SelectItem key={step.value} value={step.value}>
                        {step.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Parameters */}
              <div className="space-y-3">
                <Label>Process Parameters</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="temperature" className="text-sm">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      value={formData.parameters?.temperature || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, temperature: parseFloat(e.target.value) }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration" className="text-sm">Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.parameters?.duration || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, duration: parseFloat(e.target.value) }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Environmental Conditions */}
              <div className="space-y-3">
                <Label>Environmental Conditions</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="env-temp" className="text-sm flex items-center">
                      <Thermometer className="h-3 w-3 mr-1" />
                      Temp (°C)
                    </Label>
                    <Input
                      id="env-temp"
                      type="number"
                      value={formData.environmentalConditions?.temperature}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        environmentalConditions: { 
                          ...prev.environmentalConditions!, 
                          temperature: parseFloat(e.target.value) 
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="humidity" className="text-sm flex items-center">
                      <Droplets className="h-3 w-3 mr-1" />
                      Humidity (%)
                    </Label>
                    <Input
                      id="humidity"
                      type="number"
                      value={formData.environmentalConditions?.humidity}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        environmentalConditions: { 
                          ...prev.environmentalConditions!, 
                          humidity: parseFloat(e.target.value) 
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="air-quality" className="text-sm">Air Quality</Label>
                    <Input
                      id="air-quality"
                      type="number"
                      value={formData.environmentalConditions?.airQuality}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        environmentalConditions: { 
                          ...prev.environmentalConditions!, 
                          airQuality: parseFloat(e.target.value) 
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Process Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional process observations"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                {!activeStep ? (
                  <Button
                    onClick={startProcessingStep}
                    disabled={isProcessing}
                    className="flex items-center space-x-2"
                  >
                    {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    <span>Start Processing</span>
                  </Button>
                ) : (
                  <Button
                    onClick={completeProcessingStep}
                    disabled={isProcessing}
                    className="flex items-center space-x-2"
                  >
                    {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    <span>Complete Step</span>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => createBatch(processingHistory.map(h => h.id!).filter(Boolean))}
                  disabled={processingHistory.length === 0 || isGenerating}
                  className="flex items-center space-x-2"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Create Batch</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Batches */}
          {batches.length > 0 && (
            <Card className="botanical-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span>Generated Batches</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batches.map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{batch.batchCode}</h4>
                        <p className="text-sm text-muted-foreground">
                          {batch.finalProduct.type} - {batch.finalProduct.quantity}kg
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Purity: {batch.finalProduct.purity}%
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {batch.qrCode && (
                          <div className="w-16 h-16 border rounded">
                            <img 
                              src={batch.qrCode} 
                              alt="QR Code" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadQRCode(batch)}
                          disabled={!batch.qrCode}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Status Panel */}
        <div className="space-y-6">
          {/* Active Step */}
          {activeStep && (
            <Card className="botanical-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-amber" />
                  <span>Active Step</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium capitalize">{activeStep.stepType}</p>
                    <p className="text-sm text-muted-foreground">
                      Started: {new Date(activeStep.startTimestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Temperature:</span>
                      <span>{activeStep.environmentalConditions.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Humidity:</span>
                      <span>{activeStep.environmentalConditions.humidity}%</span>
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className="w-full justify-center">
                    In Progress
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing History */}
          <Card className="botanical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-primary" />
                <span>Recent Steps</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {processingHistory.slice(-5).map((step, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <div>
                      <p className="text-sm font-medium capitalize">{step.stepType}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(step.startTimestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                ))}
                
                {processingHistory.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No processing steps completed yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProcessorPortal;