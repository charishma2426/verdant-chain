import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Leaf, 
  Users, 
  Package, 
  TrendingUp, 
  MapPin,
  Clock,
  Shield,
  ExternalLink
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Active Collections',
      value: '2,847',
      change: '+12%',
      icon: Leaf,
      color: 'text-primary'
    },
    {
      title: 'Verified Farmers',
      value: '156',
      change: '+3%',
      icon: Users,
      color: 'text-accent'
    },
    {
      title: 'Products Traced',
      value: '1,293',
      change: '+18%',
      icon: Package,
      color: 'text-earth'
    },
    {
      title: 'Supply Chain Events',
      value: '8,921',
      change: '+25%',
      icon: TrendingUp,
      color: 'text-amber'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'Collection',
      herb: 'Ashwagandha',
      farmer: 'Rajesh Kumar',
      location: 'Madhya Pradesh',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'Processing',
      herb: 'Turmeric',
      facility: 'Ayur Processing Ltd',
      location: 'Kerala',
      time: '4 hours ago',
      status: 'in-progress'
    },
    {
      id: 3,
      type: 'Quality Check',
      herb: 'Brahmi',
      inspector: 'Dr. Priya Singh',
      location: 'Gujarat',
      time: '6 hours ago',
      status: 'passed'
    }
  ];

  const supplyChainMap = [
    { region: 'Madhya Pradesh', collections: 892, farmers: 45, status: 'active' },
    { region: 'Kerala', collections: 654, farmers: 32, status: 'active' },
    { region: 'Gujarat', collections: 543, farmers: 28, status: 'active' },
    { region: 'Rajasthan', collections: 387, farmers: 23, status: 'active' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Supply Chain Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time traceability of Ayurvedic herbs from farm to final product
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>Blockchain Secured</span>
          </Badge>
          <Badge variant="outline">Live Updates</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="botanical-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary font-medium">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="botanical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest supply chain events and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex-shrink-0">
                    {activity.type === 'Collection' && <Leaf className="h-4 w-4 text-primary mt-1" />}
                    {activity.type === 'Processing' && <Package className="h-4 w-4 text-accent mt-1" />}
                    {activity.type === 'Quality Check' && <Shield className="h-4 w-4 text-earth mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {activity.type}: {activity.herb}
                      </p>
                      <Badge 
                        variant={activity.status === 'completed' ? 'default' : 
                                activity.status === 'in-progress' ? 'secondary' : 'outline'}
                        className="ml-2 text-xs"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {'farmer' in activity ? activity.farmer : 
                       'facility' in activity ? activity.facility : activity.inspector}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {activity.location}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4">
              View All Activity
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Supply Chain Map */}
        <Card className="botanical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Supply Chain Map</span>
            </CardTitle>
            <CardDescription>
              Regional distribution and activity overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supplyChainMap.map((region) => (
                <div key={region.region} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">{region.region}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{region.collections} collections</span>
                      <span>{region.farmers} farmers</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{region.status}</Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4">
              View Full Map
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;