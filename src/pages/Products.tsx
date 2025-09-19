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
  Package, 
  Calendar, 
  Shield,
  QrCode,
  Leaf,
  ExternalLink,
  Eye
} from 'lucide-react';

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for products
  const products = [
    {
      id: 'PRD-001',
      name: 'Ashwagandha Supreme',
      description: 'Premium organic Ashwagandha formulation for stress relief and vitality',
      batchNumber: 'ASH2024001',
      manufacturingDate: '2024-01-10',
      expiryDate: '2026-01-10',
      ingredients: [
        { herbName: 'Ashwagandha', percentage: 95 },
        { herbName: 'Ginger', percentage: 3 },
        { herbName: 'Black Pepper', percentage: 2 }
      ],
      certifications: ['Organic', 'GMP', 'AYUSH'],
      qrCode: 'QR-ASH-001',
      blockchainHash: '0x7f4e9c2a...',
      status: 'active'
    },
    {
      id: 'PRD-002',
      name: 'Turmeric Gold Blend',
      description: 'High-curcumin turmeric with black pepper for maximum bioavailability',
      batchNumber: 'TUR2024002',
      manufacturingDate: '2024-01-12',
      expiryDate: '2026-01-12',
      ingredients: [
        { herbName: 'Turmeric', percentage: 90 },
        { herbName: 'Black Pepper', percentage: 5 },
        { herbName: 'Ginger', percentage: 5 }
      ],
      certifications: ['Organic', 'FDA', 'AYUSH'],
      qrCode: 'QR-TUR-002',
      blockchainHash: '0x8a3c5d1b...',
      status: 'active'
    },
    {
      id: 'PRD-003',
      name: 'Brahmi Memory Boost',
      description: 'Traditional Brahmi formula for cognitive enhancement and mental clarity',
      batchNumber: 'BRA2024003',
      manufacturingDate: '2024-01-15',
      expiryDate: '2026-01-15',
      ingredients: [
        { herbName: 'Brahmi', percentage: 80 },
        { herbName: 'Shankhpushpi', percentage: 15 },
        { herbName: 'Mandukaparni', percentage: 5 }
      ],
      certifications: ['Organic', 'GMP', 'AYUSH'],
      qrCode: 'QR-BRA-003',
      blockchainHash: '0x9b2d7e4c...',
      status: 'discontinued'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary text-primary-foreground';
      case 'discontinued': return 'bg-muted text-muted-foreground';
      case 'recalled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Catalog</h1>
          <p className="text-muted-foreground mt-1">
            Finished products with complete traceability chains
          </p>
        </div>
        <Button className="flex items-center space-x-2 bg-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4" />
          <span>New Product</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="botanical-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{products.length}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="botanical-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {products.filter(p => p.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active Products</p>
              </div>
              <Shield className="h-8 w-8 text-earth" />
            </div>
          </CardContent>
        </Card>
        <Card className="botanical-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {products.reduce((sum, p) => sum + p.certifications.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Certifications</p>
              </div>
              <Calendar className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card className="botanical-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">100%</p>
                <p className="text-sm text-muted-foreground">Traceability</p>
              </div>
              <QrCode className="h-8 w-8 text-amber" />
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
                placeholder="Search products by name, description, or batch number..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                  <SelectItem value="recalled">Recalled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="botanical-card hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-foreground">{product.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {product.description}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(product.status)}>
                  {product.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Batch Number:</span>
                  <p className="font-medium text-foreground">{product.batchNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Manufacturing:</span>
                  <p className="font-medium text-foreground">{product.manufacturingDate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expiry Date:</span>
                  <p className="font-medium text-foreground">{product.expiryDate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">QR Code:</span>
                  <p className="font-mono text-xs text-primary">{product.qrCode}</p>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h4 className="font-medium text-foreground mb-2 flex items-center">
                  <Leaf className="h-4 w-4 mr-2 text-primary" />
                  Ingredients
                </h4>
                <div className="space-y-1">
                  {product.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{ingredient.herbName}</span>
                      <span className="font-medium text-foreground">{ingredient.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h4 className="font-medium text-foreground mb-2">Certifications</h4>
                <div className="flex flex-wrap gap-1">
                  {product.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Blockchain */}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Blockchain Hash</span>
                  <span className="font-mono text-xs text-primary">{product.blockchainHash}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </Button>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                    <QrCode className="h-4 w-4" />
                    <span>QR Code</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                    <ExternalLink className="h-4 w-4" />
                    <span>Trace</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="botanical-card">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by creating your first product'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Products;