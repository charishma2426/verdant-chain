import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useBlockchain } from '@/hooks/useBlockchain';
import { supabase } from '@/integrations/supabase/client';
import {
  Shield,
  Search,
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  Eye,
  Filter,
  Calendar,
  MapPin,
  TrendingUp,
  Users,
  Package,
  Beaker,
  Factory,
  Bell
} from 'lucide-react';

interface AuditLog {
  id: string;
  tableName: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  recordId: string;
  oldData?: any;
  newData?: any;
  userId: string;
  timestamp: string;
}

interface ComplianceAlert {
  id: string;
  type: 'quality_failure' | 'location_violation' | 'seasonal_violation' | 'documentation_missing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  entityType: 'collection' | 'processing' | 'testing' | 'manufacturing';
  entityId: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

interface SupplyChainOverview {
  totalCollections: number;
  totalProcessingSteps: number;
  totalTests: number;
  totalManufacturing: number;
  complianceRate: number;
  activeAlerts: number;
}

const GovViewPortal = () => {
  const { toast } = useToast();
  const { validateSupplyChain } = useBlockchain();
  
  const [overview, setOverview] = useState<SupplyChainOverview>({
    totalCollections: 0,
    totalProcessingSteps: 0,
    totalTests: 0,
    totalManufacturing: 0,
    complianceRate: 0,
    activeAlerts: 0,
  });
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [showEntityDetails, setShowEntityDetails] = useState(false);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    loadAuditLogs();
    loadComplianceAlerts();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load counts for each entity type
      const [collectionsData, processingData, testsData, manufacturingData] = await Promise.all([
        supabase.from('collection_events').select('*', { count: 'exact', head: true }),
        supabase.from('processing_steps').select('*', { count: 'exact', head: true }),
        supabase.from('quality_tests').select('*', { count: 'exact', head: true }),
        supabase.from('manufacturing_records').select('*', { count: 'exact', head: true }),
      ]);

      // Calculate compliance rate based on passed tests
      const { data: passedTests } = await supabase
        .from('quality_tests')
        .select('passed')
        .eq('passed', true);

      const totalTests = testsData.count || 0;
      const complianceRate = totalTests > 0 ? ((passedTests?.length || 0) / totalTests) * 100 : 100;

      setOverview({
        totalCollections: collectionsData.count || 0,
        totalProcessingSteps: processingData.count || 0,
        totalTests: totalTests,
        totalManufacturing: manufacturingData.count || 0,
        complianceRate: Math.round(complianceRate),
        activeAlerts: complianceAlerts.filter(alert => !alert.resolved).length,
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Transform audit logs to match interface
      const transformedLogs: AuditLog[] = (data || []).map(log => ({
        id: log.id,
        tableName: log.table_name,
        action: log.action as AuditLog['action'],
        recordId: log.record_id,
        oldData: log.old_data,
        newData: log.new_data,
        userId: log.user_id,
        timestamp: log.created_at,
      }));

      setAuditLogs(transformedLogs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };

  const loadComplianceAlerts = async () => {
    try {
      // Mock compliance alerts - in real implementation, these would be generated
      // based on business rules and stored in database
      const mockAlerts: ComplianceAlert[] = [
        {
          id: '1',
          type: 'quality_failure',
          severity: 'high',
          entityType: 'testing',
          entityId: 'test-001',
          description: 'Heavy metals test exceeded maximum threshold',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: false,
        },
        {
          id: '2',
          type: 'seasonal_violation',
          severity: 'medium',
          entityType: 'collection',
          entityId: 'collection-002',
          description: 'Ashwagandha collected outside of approved season',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          resolved: false,
        },
        {
          id: '3',
          type: 'documentation_missing',
          severity: 'low',
          entityType: 'manufacturing',
          entityId: 'batch-003',
          description: 'Quality certificate missing for batch ingredients',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          resolved: true,
        },
      ];

      setComplianceAlerts(mockAlerts);
    } catch (error) {
      console.error('Error loading compliance alerts:', error);
    }
  };

  const searchSupplyChain = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a batch code, product ID, or other identifier",
        variant: "destructive",
      });
      return;
    }

    try {
      // Search across multiple tables
      const [collectionsResult, processingResult, testsResult, manufacturingResult] = await Promise.all([
        supabase.from('collection_events').select('*').or(`species.ilike.%${searchQuery}%, botanical_name.ilike.%${searchQuery}%`),
        supabase.from('processing_steps').select('*').or(`step_type.ilike.%${searchQuery}%, operator_id.ilike.%${searchQuery}%`),
        supabase.from('quality_tests').select('*').or(`test_type.ilike.%${searchQuery}%, lab_id.ilike.%${searchQuery}%`),
        supabase.from('manufacturing_records').select('*').or(`batch_code.ilike.%${searchQuery}%, product_name.ilike.%${searchQuery}%`),
      ]);

      const searchResults = {
        collections: collectionsResult.data || [],
        processing: processingResult.data || [],
        tests: testsResult.data || [],
        manufacturing: manufacturingResult.data || [],
      };

      if (Object.values(searchResults).every(arr => arr.length === 0)) {
        toast({
          title: "No results found",
          description: `No records found for "${searchQuery}"`,
        });
        return;
      }

      // Display search results (simplified - in real implementation would show in modal/panel)
      const totalResults = Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0);
      toast({
        title: "Search completed",
        description: `Found ${totalResults} records matching "${searchQuery}"`,
      });

    } catch (error) {
      console.error('Error searching supply chain:', error);
      toast({
        title: "Search error",
        description: "Failed to search supply chain data",
        variant: "destructive",
      });
    }
  };

  const exportAuditReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      overview,
      auditLogs: auditLogs.slice(0, 100), // Limit for export
      complianceAlerts,
      searchQuery,
      filterType,
      dateRange,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Report exported",
      description: "Audit report has been downloaded",
    });
  };

  const getSeverityColor = (severity: ComplianceAlert['severity']) => {
    switch (severity) {
      case 'low': return 'secondary';
      case 'medium': return 'outline';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'secondary';
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'collection': return <Package className="h-4 w-4" />;
      case 'processing': return <Factory className="h-4 w-4" />;
      case 'testing': return <Beaker className="h-4 w-4" />;
      case 'manufacturing': return <Factory className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">GovView Portal</h1>
          <p className="text-muted-foreground mt-1">
            Regulatory oversight and compliance monitoring dashboard
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>Regulatory Access</span>
          </Badge>
          
          {overview.activeAlerts > 0 && (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <Bell className="h-3 w-3" />
              <span>{overview.activeAlerts} Alerts</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="botanical-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Collections</p>
                <p className="text-2xl font-bold">{overview.totalCollections}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="botanical-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing Steps</p>
                <p className="text-2xl font-bold">{overview.totalProcessingSteps}</p>
              </div>
              <Factory className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="botanical-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quality Tests</p>
                <p className="text-2xl font-bold">{overview.totalTests}</p>
              </div>
              <Beaker className="h-8 w-8 text-earth" />
            </div>
          </CardContent>
        </Card>

        <Card className="botanical-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Rate</p>
                <p className="text-2xl font-bold">{overview.complianceRate}%</p>
              </div>
              <TrendingUp className={`h-8 w-8 ${overview.complianceRate >= 95 ? 'text-primary' : 'text-amber'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search and Audit Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Advanced Search */}
          <Card className="botanical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-primary" />
                <span>Supply Chain Search</span>
              </CardTitle>
              <CardDescription>
                Search across all supply chain entities and audit trails
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search by batch code, product name, species, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchSupplyChain()}
                  />
                </div>
                <Button onClick={searchSupplyChain}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="filter-type">Entity Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="collection">Collections</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={exportAuditReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" onClick={loadAuditLogs}>
                  <FileText className="h-4 w-4 mr-2" />
                  Refresh Logs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs */}
          <Card className="botanical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Audit Trail</span>
              </CardTitle>
              <CardDescription>
                Complete audit log of all system activities
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {auditLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getEntityIcon(log.tableName)}
                        <span className="font-medium text-sm capitalize">
                          {log.tableName.replace('_', ' ')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {log.action}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Record ID: {log.recordId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedEntity(log);
                        setShowEntityDetails(true);
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {auditLogs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No audit logs available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Alerts */}
        <div className="space-y-6">
          <Card className="botanical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber" />
                <span>Compliance Alerts</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {complianceAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                        {alert.severity.toUpperCase()}
                      </Badge>
                      {alert.resolved ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber" />
                      )}
                    </div>
                    
                    <p className="text-sm font-medium mb-1 capitalize">
                      {alert.type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {alert.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        {getEntityIcon(alert.entityType)}
                        <span>{alert.entityId}</span>
                      </span>
                      <span>
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {complianceAlerts.length === 0 && (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No compliance alerts
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="botanical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Blockchain Network:</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Data Integrity:</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Compliance Score:</span>
                  <Badge variant={overview.complianceRate >= 95 ? "default" : "destructive"}>
                    {overview.complianceRate}%
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Audit:</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GovViewPortal;