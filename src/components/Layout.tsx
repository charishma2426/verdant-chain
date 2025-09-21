import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Leaf, 
  Users, 
  Package, 
  Search, 
  Settings,
  Bell,
  User,
  LogOut,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Collection', href: '/collection', icon: Leaf },
    { name: 'Farmers', href: '/farmers', icon: Users },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Trace', href: '/trace', icon: Search },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                HerbTrace
              </span>
              {profile && (
                <Badge variant="outline" className="ml-2">
                  {profile.role.replace('_', ' ').toUpperCase()}
                </Badge>
              )}
            </div>
            <Badge variant="secondary" className="hidden md:flex">
              <Shield className="h-3 w-3 mr-1" />
              Blockchain Verified
            </Badge>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className="flex items-center space-x-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            {profile && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground hidden lg:block">
                  {profile.full_name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:ml-2 sm:block">Sign Out</span>
                </Button>
              </div>
            )}
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-b border-border bg-background">
        <div className="container px-4">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {navigation.map((item) => (
              <Link key={item.href} to={item.href} className="flex-shrink-0">
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;