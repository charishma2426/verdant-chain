import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useGeolocation, LocationData } from '@/hooks/useGeolocation';
import { useBlockchain } from '@/hooks/useBlockchain';
import { supabase } from '@/integrations/supabase/client';
import {
  MapPin,
  Leaf,
  Camera,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  Upload,
  RefreshCw
} from 'lucide-react';

interface CollectionEvent {
  id?: string;
  species: string;
  botanicalName: string;
  quantity: number;
  harvestTimestamp: string;
  coordinates: LocationData;
  qualityMetrics: {
    freshness: number;
    maturity: number;
    damage: number;
  };
  photos?: string[];
  notes?: string;
  collectorId: string;
}

const CollectorPortal = () => {
  const { toast } = useToast();
  const { location, isTracking, error: locationError, getCurrentLocation, startTracking, stopTracking } = useGeolocation();
  const { createTransaction, isProcessing } = useBlockchain();
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [collections, setCollections] = useState<CollectionEvent[]>([]);
  const [pendingSync, setPendingSync] = useState<CollectionEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<CollectionEvent>>({
    species: '',
    botanicalName: '',
    quantity: 0,
    qualityMetrics: {
      freshness: 5,
      maturity: 5,
      damage: 0,
    },
    notes: '',
  });

  // Available species from database
  const [availableSpecies] = useState([
    { name: 'Ashwagandha', botanical: 'Withania somnifera' },
    { name: 'Turmeric', botanical: 'Curcuma longa' },
    { name: 'Brahmi', botanical: 'Bacopa monnieri' },
    { name: 'Neem', botanical: 'Azadirachta indica' },
    { name: 'Tulsi', botanical: 'Ocimum tenuiflorum' },
    { name: 'Amla', botanical: 'Phyllanthus emblica' }
  ]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (pendingSync.length > 0) {
        syncPendingCollections();
      }
    };
    
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSync]);

  // Load pending collections from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('pendingCollections');
    if (stored) {
      setPendingSync(JSON.parse(stored));
    }
  }, []);

  const handleSpeciesChange = (species: string) => {
    const selected = availableSpecies.find(s => s.name === species);
    setFormData(prev => ({
      ...prev,
      species,
      botanicalName: selected?.botanical || '',
    }));
  };

  const handleLocationCapture = async () => {
    try {
      const currentLocation = await getCurrentLocation();
      toast({
        title: "Location captured",
        description: `Accuracy: ${currentLocation.accuracy.toFixed(0)}m`,
      });
    } catch (error) {
      toast({
        title: "Location error",
        description: "Could not capture current location",
        variant: "destructive",
      });
    }
  };

  const validateCollection = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.species) errors.push('Species is required');
    if (!formData.quantity || formData.quantity <= 0) errors.push('Quantity must be greater than 0');
    if (!location) errors.push('Location data is required');
    
    return errors;
  };

  const saveCollectionOffline = (collection: CollectionEvent) => {
    const updated = [...pendingSync, collection];
    setPendingSync(updated);
    localStorage.setItem('pendingCollections', JSON.stringify(updated));
  };

  const createCollectionEvent = async () => {
    const errors = validateCollection();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    const collection: CollectionEvent = {
      id: crypto.randomUUID(),
      species: formData.species!,
      botanicalName: formData.botanicalName!,
      quantity: formData.quantity!,
      harvestTimestamp: new Date().toISOString(),
      coordinates: location!,
      qualityMetrics: formData.qualityMetrics!,
      notes: formData.notes,
      collectorId: 'current-user-id', // Replace with actual user ID
    };

    try {
      if (isOnline) {
        // Create blockchain transaction
        const transaction = await createTransaction('collection', collection);
        
        // Save to Supabase
        const { error } = await supabase
          .from('collection_events')
          .insert({
            species: collection.species,
            botanical_name: collection.botanicalName,
            quantity: collection.quantity,
            harvest_timestamp: collection.harvestTimestamp,
            coordinates: collection.coordinates as any,
            quality_metrics: collection.qualityMetrics,
            block_hash: transaction.hash,
            previous_hash: transaction.previousHash,
          });

        if (error) throw error;

        toast({
          title: "Collection recorded",
          description: "Event saved to blockchain and synced",
        });
      } else {
        // Save offline
        saveCollectionOffline(collection);
        toast({
          title: "Collection saved offline",
          description: "Will sync when connection is restored",
        });
      }

      // Reset form
      setFormData({
        species: '',
        botanicalName: '',
        quantity: 0,
        qualityMetrics: { freshness: 5, maturity: 5, damage: 0 },
        notes: '',
      });
      
    } catch (error) {
      console.error('Error creating collection:', error);
      
      // Fallback to offline storage
      saveCollectionOffline(collection);
      toast({
        title: "Saved offline",
        description: "Could not sync immediately, saved locally",
        variant: "destructive",
      });
    }
  };

  const syncPendingCollections = async () => {
    if (pendingSync.length === 0 || !isOnline) return;
    
    setIsSyncing(true);
    let synced = 0;
    
    try {
      for (const collection of pendingSync) {
        try {
          // Create blockchain transaction
          const transaction = await createTransaction('collection', collection);
          
          // Save to Supabase
          const { error } = await supabase
            .from('collection_events')
            .insert({
              species: collection.species,
              botanical_name: collection.botanicalName,
              quantity: collection.quantity,
              harvest_timestamp: collection.harvestTimestamp,
              coordinates: collection.coordinates as any,
              quality_metrics: collection.qualityMetrics,
              block_hash: transaction.hash,
              previous_hash: transaction.previousHash,
            });

          if (!error) {
            synced++;
          }
        } catch (error) {
          console.error('Error syncing collection:', error);
        }
      }
      
      // Clear synced collections
      setPendingSync([]);
      localStorage.removeItem('pendingCollections');
      
      toast({
        title: "Collections synced",
        description: `${synced} collections uploaded to blockchain`,
      });
      
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Collector Portal</h1>
          <p className="text-muted-foreground mt-1">
            Record herb collection events with GPS verification
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center space-x-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </Badge>
          
          {pendingSync.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={syncPendingCollections}
              disabled={!isOnline || isSyncing}
              className="flex items-center space-x-2"
            >
              {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>Sync ({pendingSync.length})</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Form */}
        <div className="lg:col-span-2">
          <Card className="botanical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Leaf className="h-5 w-5 text-primary" />
                <span>New Collection Event</span>
              </CardTitle>
              <CardDescription>
                Record herb collection with GPS verification
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Species Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="species">Species</Label>
                  <Select 
                    value={formData.species} 
                    onValueChange={handleSpeciesChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select herb species" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSpecies.map((species) => (
                        <SelectItem key={species.name} value={species.name}>
                          {species.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="botanical">Botanical Name</Label>
                  <Input
                    id="botanical"
                    value={formData.botanicalName}
                    placeholder="Auto-filled from species"
                    disabled
                  />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <Label htmlFor="quantity">Quantity (kg)</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                  placeholder="Enter harvested quantity"
                />
              </div>

              {/* Quality Metrics */}
              <div className="space-y-3">
                <Label>Quality Assessment (1-10 scale)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="freshness" className="text-sm">Freshness</Label>
                    <Input
                      id="freshness"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.qualityMetrics?.freshness}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        qualityMetrics: { ...prev.qualityMetrics!, freshness: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maturity" className="text-sm">Maturity</Label>
                    <Input
                      id="maturity"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.qualityMetrics?.maturity}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        qualityMetrics: { ...prev.qualityMetrics!, maturity: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="damage" className="text-sm">Damage (0-10)</Label>
                    <Input
                      id="damage"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.qualityMetrics?.damage}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        qualityMetrics: { ...prev.qualityMetrics!, damage: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Collection Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional observations or notes"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  onClick={handleLocationCapture}
                  variant="outline"
                  className="flex items-center space-x-2"
                  disabled={isTracking}
                >
                  <MapPin className="h-4 w-4" />
                  <span>{isTracking ? 'Tracking...' : 'Capture Location'}</span>
                </Button>
                
                <Button
                  onClick={createCollectionEvent}
                  disabled={isProcessing}
                  className="flex items-center space-x-2"
                >
                  {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  <span>Record Collection</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Panel */}
        <div className="space-y-6">
          {/* Location Status */}
          <Card className="botanical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Location Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {location ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Latitude:</span>
                    <span className="text-sm font-mono">{location.latitude.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Longitude:</span>
                    <span className="text-sm font-mono">{location.longitude.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Accuracy:</span>
                    <span className="text-sm">{location.accuracy.toFixed(0)}m</span>
                  </div>
                  <Badge variant="default" className="w-full justify-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Location Locked
                  </Badge>
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertTriangle className="h-8 w-8 text-amber mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No location data</p>
                  {locationError && (
                    <p className="text-xs text-destructive mt-1">{locationError}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sync Status */}
          {pendingSync.length > 0 && (
            <Card className="botanical-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-amber" />
                  <span>Pending Sync</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-2">
                  <div className="text-2xl font-bold text-amber">{pendingSync.length}</div>
                  <p className="text-sm text-muted-foreground">Collections awaiting sync</p>
                  {!isOnline && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Will sync automatically when online
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectorPortal;