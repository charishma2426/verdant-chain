import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  MapPin, 
  Star,
  Phone,
  Mail,
  Calendar,
  Leaf
} from 'lucide-react';

const Farmers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCertification, setFilterCertification] = useState('all');

  // Mock data for farmers
  const farmers = [
    {
      id: 'FAR-001',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@email.com',
      phone: '+91 98765 43210',
      location: {
        address: 'Village Khandwa, Madhya Pradesh',
        coordinates: { lat: 22.0797, lng: 76.3662 }
      },
      certification: 'organic',
      joinDate: '2023-03-15',
      totalCollections: 45,
      rating: 4.8,
      avatar: null
    },
    {
      id: 'FAR-002',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 87654 32109',
      location: {
        address: 'Wayanad District, Kerala',
        coordinates: { lat: 11.6854, lng: 76.1320 }
      },
      certification: 'wild-harvest',
      joinDate: '2023-05-22',
      totalCollections: 32,
      rating: 4.9,
      avatar: null
    },
    {
      id: 'FAR-003',
      name: 'Arjun Patel',
      email: 'arjun.patel@email.com',
      phone: '+91 76543 21098',
      location: {
        address: 'Kutch District, Gujarat',
        coordinates: { lat: 23.7337, lng: 69.8597 }
      },
      certification: 'organic',
      joinDate: '2023-01-08',
      totalCollections: 67,
      rating: 4.7,
      avatar: null
    },
    {
      id: 'FAR-004',
      name: 'Sunita Devi',
      email: 'sunita.devi@email.com',
      phone: '+91 65432 10987',
      location: {
        address: 'Jodhpur District, Rajasthan',
        coordinates: { lat: 26.2389, lng: 73.0243 }
      },
      certification: 'conventional',
      joinDate: '2023-07-12',
      totalCollections: 28,
      rating: 4.6,
      avatar: null
    }
  ];

  const getCertificationColor = (certification: string) => {
    switch (certification) {
      case 'organic': return 'bg-primary text-primary-foreground';
      case 'wild-harvest': return 'bg-earth text-earth-foreground';
      case 'conventional': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         farmer.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         farmer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCertification = filterCertification === 'all' || farmer.certification === filterCertification;
    return matchesSearch && matchesCertification;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-3 w-3 ${
          index < Math.floor(rating) 
            ? 'text-amber fill-amber' 
            : 'text-muted-foreground'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Farmer Network</h1>
          <p className="text-muted-foreground mt-1">
            Certified farmers and collectors in our supply chain
          </p>
        </div>
        <Button className="flex items-center space-x-2 bg-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4" />
          <span>Add Farmer</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="botanical-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{farmers.length}</p>
                <p className="text-sm text-muted-foreground">Total Farmers</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="botanical-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {farmers.filter(f => f.certification === 'organic').length}
                </p>
                <p className="text-sm text-muted-foreground">Organic Certified</p>
              </div>
              <Leaf className="h-8 w-8 text-earth" />
            </div>
          </CardContent>
        </Card>
        <Card className="botanical-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {farmers.reduce((sum, f) => sum + f.totalCollections, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Collections</p>
              </div>
              <Calendar className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card className="botanical-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {(farmers.reduce((sum, f) => sum + f.rating, 0) / farmers.length).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
              <Star className="h-8 w-8 text-amber fill-amber" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="botanical-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search farmers by name, location, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterCertification} onValueChange={setFilterCertification}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Certification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Certifications</SelectItem>
                  <SelectItem value="organic">Organic</SelectItem>
                  <SelectItem value="wild-harvest">Wild Harvest</SelectItem>
                  <SelectItem value="conventional">Conventional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farmers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredFarmers.map((farmer) => (
          <Card key={farmer.id} className="botanical-card hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={farmer.avatar || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {farmer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg text-foreground">{farmer.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getCertificationColor(farmer.certification)}>
                      {farmer.certification.replace('-', ' ')}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {renderStars(farmer.rating)}
                      <span className="text-sm text-muted-foreground ml-1">
                        ({farmer.rating})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{farmer.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{farmer.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{farmer.location.address}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="border-t border-border pt-3">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{farmer.totalCollections}</p>
                    <p className="text-xs text-muted-foreground">Collections</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(farmer.joinDate).getFullYear()}
                    </p>
                    <p className="text-xs text-muted-foreground">Member Since</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Profile
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFarmers.length === 0 && (
        <Card className="botanical-card">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No farmers found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterCertification !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by adding farmers to your network'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Farmers;