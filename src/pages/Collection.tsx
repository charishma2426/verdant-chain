import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  Leaf, 
  MapPin, 
  Calendar,
  Scale,
  User,
  ExternalLink,
  Eye
} from 'lucide-react';

const Collection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for collections
  const collections = [
    {
      id: 'COL-001',
      herbName: 'Ashwagandha',
      botanicalName: 'Withania somnifera',
      farmer: 'Rajesh Kumar',
      quantity: 250,
      unit: 'kg',
      harvestDate: '2024-01-15',
      location: 'Madhya Pradesh',
      qualityGrade: 'premium',
      status: 'processing',
      blockchainHash: '0x7f4e...',
      moisture: 8.5
    },
    {
      id: 'COL-002',
      herbName: 'Turmeric',
      botanicalName: 'Curcuma longa',
      farmer: 'Priya Sharma',
      quantity: 180,
      unit: 'kg',
      harvestDate: '2024-01-14',
      location: 'Kerala',
      qualityGrade: 'standard',
      status: 'collected',
      blockchainHash: '0x8a3c...',
      moisture: 12.2
    },
    {
      id: 'COL-003',
      herbName: 'Brahmi',
      botanicalName: 'Bacopa monnieri',
      farmer: 'Arjun Patel',
      quantity: 85,
      unit: 'kg',
      harvestDate: '2024-01-13',
      location: 'Gujarat',
      qualityGrade: 'premium',
      status: 'completed',
      blockchainHash: '0x9b2d...',
      moisture: 7.8
    },
    {
      id: 'COL-004',
      herbName: 'Neem',
      botanicalName: 'Azadirachta indica',
      farmer: 'Sunita Devi',
      quantity: 320,
      unit: 'kg',
      harvestDate: '2024-01-12',
      location: 'Rajasthan',
      qualityGrade: 'standard',
      status: 'in-transit',
      blockchainHash: '0xa5f7...',
      moisture: 9.1
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collected': return 'bg-accent/20 text-accent-foreground border-accent/30';
      case 'in-transit': return 'bg-amber/20 text-amber-foreground border-amber/30';
      case 'processing': return 'bg-primary/20 text-primary-foreground border-primary/30';
      case 'completed': return 'bg-earth/20 text-earth-foreground border-earth/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'premium': return 'bg-primary text-primary-foreground';
      case 'standard': return 'bg-secondary text-secondary-foreground';
      case 'basic': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.herbName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         collection.botanicalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         collection.farmer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || collection.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Herb Collections</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage herb collections with GPS verification
          </p>
        </div>
        <Button className="flex items-center space-x-2 bg-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4" />
          <span>New Collection</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="botanical-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by herb name, botanical name, or farmer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="collected">Collected</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCollections.map((collection) => (
          <Card key={collection.id} className="botanical-card hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-foreground">{collection.herbName}</CardTitle>
                  <CardDescription className="italic">
                    {collection.botanicalName}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getStatusColor(collection.status)}>
                    {collection.status.replace('-', ' ')}
                  </Badge>
                  <Badge className={getGradeColor(collection.qualityGrade)}>
                    {collection.qualityGrade}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Collection Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {collection.quantity} {collection.unit}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{collection.harvestDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{collection.farmer}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{collection.location}</span>
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Moisture Content</span>
                  <span className="font-medium text-foreground">{collection.moisture}%</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-muted-foreground">Blockchain Hash</span>
                  <span className="font-mono text-xs text-primary">{collection.blockchainHash}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <ExternalLink className="h-4 w-4" />
                  <span>Trace Chain</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCollections.length === 0 && (
        <Card className="botanical-card">
          <CardContent className="py-12 text-center">
            <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No collections found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start by adding your first herb collection'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Collection;