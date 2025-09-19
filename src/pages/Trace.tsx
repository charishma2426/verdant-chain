import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  QrCode, 
  Leaf, 
  MapPin, 
  Calendar,
  User,
  Package,
  Shield,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const Trace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [traceResult, setTraceResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock traceability data
  const mockTraceData = {
    productId: 'PRD-001',
    productName: 'Ashwagandha Supreme',
    batchNumber: 'ASH2024001',
    qrCode: 'QR-ASH-001',
    blockchainHash: '0x7f4e9c2a...',
    chain: [
      {
        id: 1,
        type: 'Collection',
        title: 'Herb Collection',
        timestamp: '2024-01-15T08:30:00Z',
        location: 'Village Khandwa, Madhya Pradesh',
        actor: 'Rajesh Kumar (Farmer)',
        data: {
          herbName: 'Ashwagandha',
          quantity: '250 kg',
          qualityGrade: 'Premium',
          moisture: '8.5%',
          coordinates: '22.0797, 76.3662'
        },
        status: 'completed',
        hash: '0x1a2b3c4d...'
      },
      {
        id: 2,
        type: 'Transport',
        title: 'Transport to Facility',
        timestamp: '2024-01-16T14:20:00Z',
        location: 'En route to Indore Processing Center',
        actor: 'Green Logistics Pvt Ltd',
        data: {
          vehicle: 'TRK-001',
          temperature: '25°C',
          humidity: '45%',
          duration: '6 hours'
        },
        status: 'completed',
        hash: '0x2b3c4d5e...'
      },
      {
        id: 3,
        type: 'Processing',
        title: 'Drying & Cleaning',
        timestamp: '2024-01-17T09:15:00Z',
        location: 'Indore Processing Center, MP',
        actor: 'Ayur Processing Ltd',
        data: {
          process: 'Solar Drying',
          duration: '48 hours',
          finalMoisture: '6.2%',
          yield: '195 kg'
        },
        status: 'completed',
        hash: '0x3c4d5e6f...'
      },
      {
        id: 4,
        type: 'Quality Check',
        title: 'Quality Testing',
        timestamp: '2024-01-18T11:00:00Z',
        location: 'Quality Lab, Indore',
        actor: 'Dr. Priya Singh (Quality Inspector)',
        data: {
          contaminants: 'None detected',
          potency: '95% active compounds',
          microbiological: 'Pass',
          heavyMetals: 'Within limits'
        },
        status: 'completed',
        hash: '0x4d5e6f7a...'
      },
      {
        id: 5,
        type: 'Formulation',
        title: 'Product Formulation',
        timestamp: '2024-01-19T10:30:00Z',
        location: 'Formulation Unit, Mumbai',
        actor: 'Ayurveda Innovations Pvt Ltd',
        data: {
          formula: 'ASH-SUPREME-001',
          batchSize: '1000 units',
          ingredients: 'Ashwagandha 95%, Ginger 3%, Black Pepper 2%',
          encapsulation: 'Vegetarian capsules'
        },
        status: 'completed',
        hash: '0x5e6f7a8b...'
      },
      {
        id: 6,
        type: 'Packaging',
        title: 'Final Packaging',
        timestamp: '2024-01-20T16:45:00Z',
        location: 'Packaging Facility, Mumbai',
        actor: 'BioPackaging Solutions',
        data: {
          packagingType: 'Eco-friendly bottles',
          unitsPerBottle: '60 capsules',
          totalBottles: '1000',
          qrCodes: 'Generated & applied'
        },
        status: 'completed',
        hash: '0x6f7a8b9c...'
      }
    ]
  };

  const handleTrace = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      if (searchQuery.toLowerCase().includes('ash') || searchQuery.includes('QR-ASH-001')) {
        setTraceResult(mockTraceData);
      } else {
        setTraceResult(null);
      }
      setIsLoading(false);
    }, 1000);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'Collection': return Leaf;
      case 'Transport': return MapPin;
      case 'Processing': return Package;
      case 'Quality Check': return Shield;
      case 'Formulation': return Package;
      case 'Packaging': return Package;
      default: return CheckCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-primary';
      case 'in-progress': return 'text-amber';
      case 'pending': return 'text-muted-foreground';
      case 'failed': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Product Traceability</h1>
        <p className="text-muted-foreground">
          Enter a product code, QR code, or batch number to trace its complete journey
        </p>
      </div>

      {/* Search */}
      <Card className="botanical-card max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter product code, QR code, or batch number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                onKeyPress={(e) => e.key === 'Enter' && handleTrace()}
              />
            </div>
            <Button 
              onClick={handleTrace}
              disabled={isLoading}
              className="bg-primary hover:bg-primary-hover"
            >
              {isLoading ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2">Trace</span>
            </Button>
          </div>
          <div className="flex justify-center mt-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <QrCode className="h-4 w-4" />
              <span>Scan QR Code</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sample Codes */}
      <Card className="botanical-card max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Try Sample Codes</CardTitle>
          <CardDescription className="text-center">
            Use these sample codes to explore the traceability system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery('QR-ASH-001')}
              className="flex flex-col items-center p-4 h-auto"
            >
              <QrCode className="h-6 w-6 mb-2 text-primary" />
              <span className="font-medium">QR-ASH-001</span>
              <span className="text-xs text-muted-foreground">Ashwagandha Supreme</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => setSearchQuery('ASH2024001')}
              className="flex flex-col items-center p-4 h-auto"
            >
              <Package className="h-6 w-6 mb-2 text-accent" />
              <span className="font-medium">ASH2024001</span>
              <span className="text-xs text-muted-foreground">Batch Number</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => setSearchQuery('PRD-001')}
              className="flex flex-col items-center p-4 h-auto"
            >
              <Leaf className="h-6 w-6 mb-2 text-earth" />
              <span className="font-medium">PRD-001</span>
              <span className="text-xs text-muted-foreground">Product ID</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trace Result */}
      {traceResult && (
        <div className="space-y-6">
          {/* Product Info */}
          <Card className="botanical-card">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-primary" />
                    <span>{traceResult.productName}</span>
                  </CardTitle>
                  <CardDescription>
                    Batch: {traceResult.batchNumber} • QR: {traceResult.qrCode}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Blockchain Verified</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <span>Blockchain Hash: </span>
                <span className="font-mono text-primary">{traceResult.blockchainHash}</span>
              </div>
            </CardContent>
          </Card>

          {/* Traceability Chain */}
          <Card className="botanical-card">
            <CardHeader>
              <CardTitle>Traceability Chain</CardTitle>
              <CardDescription>
                Complete journey from farm to final product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {traceResult.chain.map((step: any, index: number) => {
                  const StepIcon = getStepIcon(step.type);
                  const isLast = index === traceResult.chain.length - 1;
                  
                  return (
                    <div key={step.id} className="relative">
                      {/* Timeline Line */}
                      {!isLast && (
                        <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
                      )}
                      
                      <div className="flex space-x-4">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20">
                            <StepIcon className={`h-5 w-5 ${getStatusColor(step.status)}`} />
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">{step.title}</h4>
                            <Badge 
                              variant={step.status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {step.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(step.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{step.location}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>{step.actor}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Shield className="h-4 w-4" />
                              <span className="font-mono text-xs">{step.hash}</span>
                            </div>
                          </div>
                          
                          {/* Step Data */}
                          <div className="bg-muted/30 rounded-lg p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {Object.entries(step.data).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-muted-foreground capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                                  </span>
                                  <span className="font-medium text-foreground">{value as string}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Result */}
      {searchQuery && !traceResult && !isLoading && (
        <Card className="botanical-card max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No traceability data found</h3>
            <p className="text-muted-foreground">
              The code "{searchQuery}" was not found in our system. Please check the code and try again.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Trace;