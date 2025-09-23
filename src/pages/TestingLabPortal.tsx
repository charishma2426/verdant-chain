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
  Beaker,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  QrCode,
  Camera,
  Download,
  RefreshCw,
  Microscope,
  FlaskConical
} from 'lucide-react';

interface QualityTest {
  id?: string;
  testType: 'purity' | 'potency' | 'heavy_metals' | 'pesticides' | 'microbial' | 'moisture' | 'ash_content';
  sampleId: string;
  testResult: {
    value: number;
    unit: string;
    method: string;
    equipment: string;
  };
  thresholdMin?: number;
  thresholdMax?: number;
  passed: boolean;
  testTimestamp: string;
  labId: string;
  certificate: {
    number: string;
    hash: string;
    issuedAt: string;
  };
  notes?: string;
}

interface TestBatch {
  id: string;
  samples: string[];
  testTypes: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  results: QualityTest[];
  certificateGenerated: boolean;
}

const TestingLabPortal = () => {
  const { toast } = useToast();
  const { scanFromImage, startScanning, stopScanning, isScanning, videoRef, canvasRef } = useQRCode();
  const { createTransaction, isProcessing } = useBlockchain();
  
  const [tests, setTests] = useState<QualityTest[]>([]);
  const [batches, setBatches] = useState<TestBatch[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  
  const [formData, setFormData] = useState<Partial<QualityTest>>({
    testType: 'purity',
    testResult: {
      value: 0,
      unit: '%',
      method: 'HPLC',
      equipment: 'Lab Equipment ID',
    },
    passed: false,
  });

  const testTypes = [
    { value: 'purity', label: 'Purity Analysis', unit: '%', min: 95, max: 100 },
    { value: 'potency', label: 'Active Compound Potency', unit: 'mg/g', min: 10, max: 50 },
    { value: 'heavy_metals', label: 'Heavy Metals', unit: 'ppm', min: 0, max: 10 },
    { value: 'pesticides', label: 'Pesticide Residue', unit: 'ppm', min: 0, max: 0.1 },
    { value: 'microbial', label: 'Microbial Content', unit: 'CFU/g', min: 0, max: 1000 },
    { value: 'moisture', label: 'Moisture Content', unit: '%', min: 8, max: 12 },
    { value: 'ash_content', label: 'Ash Content', unit: '%', min: 2, max: 8 },
  ];

  // Load available samples for testing
  useEffect(() => {
    loadSamples();
  }, []);

  const loadSamples = async () => {
    try {
      const { data, error } = await supabase
        .from('processing_steps')
        .select(`
          *,
          collection_events (*)
        `)
        .eq('is_validated', true)
        .order('start_timestamp', { ascending: false });

      if (error) throw error;
      setSamples(data || []);
    } catch (error) {
      console.error('Error loading samples:', error);
    }
  };

  const handleTestTypeChange = (testType: string) => {
    const selectedTest = testTypes.find(t => t.value === testType);
    setFormData(prev => ({
      ...prev,
      testType: testType as QualityTest['testType'],
      testResult: {
        ...prev.testResult!,
        unit: selectedTest?.unit || '',
      },
      thresholdMin: selectedTest?.min,
      thresholdMax: selectedTest?.max,
    }));
  };

  const validateTestResult = (result: number, min?: number, max?: number): boolean => {
    if (min !== undefined && result < min) return false;
    if (max !== undefined && result > max) return false;
    return true;
  };

  const conductTest = async () => {
    if (!formData.sampleId || !formData.testType || !formData.testResult?.value) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const passed = validateTestResult(
      formData.testResult.value,
      formData.thresholdMin,
      formData.thresholdMax
    );

    const test: QualityTest = {
      id: crypto.randomUUID(),
      testType: formData.testType!,
      sampleId: formData.sampleId!,
      testResult: formData.testResult!,
      thresholdMin: formData.thresholdMin,
      thresholdMax: formData.thresholdMax,
      passed,
      testTimestamp: new Date().toISOString(),
      labId: 'current-lab-id', // Replace with actual lab ID
      certificate: {
        number: `CERT-${Date.now()}`,
        hash: '',
        issuedAt: new Date().toISOString(),
      },
      notes: formData.notes,
    };

    try {
      // Create blockchain transaction
      const transaction = await createTransaction('testing', test);
      test.certificate.hash = transaction.hash;

      // Save to Supabase
      const { error } = await supabase
        .from('quality_tests')
        .insert({
          test_type: test.testType,
          collection_event_id: test.sampleId.startsWith('collection') ? test.sampleId : null,
          processing_step_id: test.sampleId.startsWith('processing') ? test.sampleId : null,
          lab_id: test.labId,
          test_result: test.testResult,
          threshold_min: test.thresholdMin,
          threshold_max: test.thresholdMax,
          passed: test.passed,
          test_timestamp: test.testTimestamp,
          certificate_hash: test.certificate.hash,
          block_hash: transaction.hash,
          previous_hash: transaction.previousHash,
        });

      if (error) throw error;

      setTests(prev => [...prev, test]);

      toast({
        title: passed ? "Test passed" : "Test failed",
        description: `${test.testType} test completed with ${passed ? 'acceptable' : 'unacceptable'} results`,
        variant: passed ? "default" : "destructive",
      });

      // Reset form
      setFormData({
        testType: 'purity',
        testResult: {
          value: 0,
          unit: '%',
          method: 'HPLC',
          equipment: 'Lab Equipment ID',
        },
        passed: false,
      });

    } catch (error) {
      console.error('Error conducting test:', error);
      toast({
        title: "Error",
        description: "Failed to record test results",
        variant: "destructive",
      });
    }
  };

  const generateCertificate = async (test: QualityTest) => {
    const certificateData = {
      testId: test.id!,
      certificateNumber: test.certificate.number,
      testType: test.testType,
      result: test.testResult,
      passed: test.passed,
      issuedAt: test.certificate.issuedAt,
      labId: test.labId,
      hash: test.certificate.hash,
    };

    // Create PDF certificate (mock implementation)
    const certificateText = `
QUALITY TEST CERTIFICATE

Certificate Number: ${test.certificate.number}
Test Type: ${test.testType.toUpperCase()}
Sample ID: ${test.sampleId}
Test Result: ${test.testResult.value} ${test.testResult.unit}
Status: ${test.passed ? 'PASSED' : 'FAILED'}
Method: ${test.testResult.method}
Equipment: ${test.testResult.equipment}
Test Date: ${new Date(test.testTimestamp).toLocaleDateString()}
Issued Date: ${new Date(test.certificate.issuedAt).toLocaleDateString()}

Blockchain Hash: ${test.certificate.hash}

This certificate is cryptographically secured and verifiable on the blockchain.
    `;

    // Download as text file (in real implementation, this would be a PDF)
    const blob = new Blob([certificateText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${test.certificate.number}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Certificate generated",
      description: `Test certificate downloaded`,
    });
  };

  const handleQRScan = (qrData: any) => {
    if (qrData.type === 'batch' || qrData.type === 'product') {
      setFormData(prev => ({ ...prev, sampleId: qrData.id }));
      setShowScanner(false);
      toast({
        title: "Sample identified",
        description: `Loaded sample: ${qrData.id}`,
      });
    } else {
      toast({
        title: "Invalid QR code",
        description: "QR code does not contain sample information",
        variant: "destructive",
      });
    }
  };

  const handleImageScan = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      scanFromImage(
        file,
        handleQRScan,
        (error) => {
          toast({
            title: "Scan error",
            description: error,
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Testing Lab Portal</h1>
          <p className="text-muted-foreground mt-1">
            Conduct quality tests and generate certificates
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Beaker className="h-3 w-3" />
            <span>{tests.length} Tests Completed</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Testing Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* QR Scanner */}
          {showScanner && (
            <Card className="botanical-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <QrCode className="h-5 w-5" />
                    <span>QR Code Scanner</span>
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      stopScanning();
                      setShowScanner(false);
                    }}
                  >
                    Close
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <video ref={videoRef} className="w-full max-w-md mx-auto rounded-lg" />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Position QR code in camera view or upload image
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageScan}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Form */}
          <Card className="botanical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Microscope className="h-5 w-5 text-primary" />
                <span>Quality Test</span>
              </CardTitle>
              <CardDescription>
                Conduct quality analysis and record results
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Sample Selection */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="sample">Sample ID</Label>
                  <Select 
                    value={formData.sampleId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sampleId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sample or scan QR code" />
                    </SelectTrigger>
                    <SelectContent>
                      {samples.map((sample) => (
                        <SelectItem key={sample.id} value={sample.id}>
                          {sample.step_type} - {sample.collection_events?.species} - {new Date(sample.start_timestamp).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowScanner(true);
                    startScanning(handleQRScan, (error) => {
                      toast({
                        title: "Scanner error",
                        description: error,
                        variant: "destructive",
                      });
                    });
                  }}
                  disabled={isScanning}
                  className="mt-6"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>

              {/* Test Type */}
              <div>
                <Label htmlFor="test-type">Test Type</Label>
                <Select 
                  value={formData.testType} 
                  onValueChange={handleTestTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    {testTypes.map((test) => (
                      <SelectItem key={test.value} value={test.value}>
                        {test.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Test Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-value">Test Result</Label>
                  <div className="flex gap-2">
                    <Input
                      id="test-value"
                      type="number"
                      step="0.01"
                      value={formData.testResult?.value}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        testResult: { ...prev.testResult!, value: parseFloat(e.target.value) }
                      }))}
                      placeholder="Enter result"
                    />
                    <div className="flex items-center px-3 bg-muted rounded-md">
                      <span className="text-sm text-muted-foreground">
                        {formData.testResult?.unit}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="method">Method</Label>
                  <Select
                    value={formData.testResult?.method}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      testResult: { ...prev.testResult!, method: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Test method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HPLC">HPLC</SelectItem>
                      <SelectItem value="GC-MS">GC-MS</SelectItem>
                      <SelectItem value="UV-Vis">UV-Vis Spectroscopy</SelectItem>
                      <SelectItem value="ICP-MS">ICP-MS</SelectItem>
                      <SelectItem value="Gravimetric">Gravimetric Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Thresholds */}
              {(formData.thresholdMin !== undefined || formData.thresholdMax !== undefined) && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <Label className="text-sm">Acceptable Range</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.thresholdMin !== undefined && formData.thresholdMax !== undefined
                      ? `${formData.thresholdMin} - ${formData.thresholdMax} ${formData.testResult?.unit}`
                      : formData.thresholdMin !== undefined
                      ? `≥ ${formData.thresholdMin} ${formData.testResult?.unit}`
                      : `≤ ${formData.thresholdMax} ${formData.testResult?.unit}`
                    }
                  </p>
                  {formData.testResult?.value !== undefined && (
                    <Badge 
                      variant={validateTestResult(formData.testResult.value, formData.thresholdMin, formData.thresholdMax) ? "default" : "destructive"}
                      className="mt-2"
                    >
                      {validateTestResult(formData.testResult.value, formData.thresholdMin, formData.thresholdMax) ? "Within Range" : "Out of Range"}
                    </Badge>
                  )}
                </div>
              )}

              {/* Equipment */}
              <div>
                <Label htmlFor="equipment">Equipment ID</Label>
                <Input
                  id="equipment"
                  value={formData.testResult?.equipment}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    testResult: { ...prev.testResult!, equipment: e.target.value }
                  }))}
                  placeholder="Equipment identifier"
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Test Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional observations or comments"
                  rows={3}
                />
              </div>

              {/* Action Button */}
              <Button
                onClick={conductTest}
                disabled={isProcessing}
                className="flex items-center space-x-2 w-full"
              >
                {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
                <span>Record Test Results</span>
              </Button>
            </CardContent>
          </Card>

          {/* Test Results */}
          {tests.length > 0 && (
            <Card className="botanical-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Recent Test Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tests.slice(-5).map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium capitalize">{test.testType.replace('_', ' ')}</h4>
                          {test.passed ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Result: {test.testResult.value} {test.testResult.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(test.testTimestamp).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={test.passed ? "default" : "destructive"}>
                          {test.passed ? "Passed" : "Failed"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateCertificate(test)}
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
          {/* Test Statistics */}
          <Card className="botanical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Beaker className="h-5 w-5 text-primary" />
                <span>Test Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Tests:</span>
                  <span className="font-medium">{tests.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Passed:</span>
                  <span className="font-medium text-primary">
                    {tests.filter(t => t.passed).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Failed:</span>
                  <span className="font-medium text-destructive">
                    {tests.filter(t => !t.passed).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pass Rate:</span>
                  <span className="font-medium">
                    {tests.length > 0 ? Math.round((tests.filter(t => t.passed).length / tests.length) * 100) : 0}%
                  </span>
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
                onClick={() => {
                  setShowScanner(true);
                  startScanning(handleQRScan, (error) => {
                    toast({
                      title: "Scanner error",
                      description: error,
                      variant: "destructive",
                    });
                  });
                }}
              >
                <Camera className="h-4 w-4 mr-2" />
                Scan Sample QR
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={loadSamples}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Samples
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestingLabPortal;