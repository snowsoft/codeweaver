// web/app/marketplace/page.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Download,
  Star,
  GitBranch,
  Package,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { api } from '@/lib/api';

interface MarketplacePlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  icon?: string;
  downloads: number;
  rating: number;
  reviews: number;
  lastUpdated: string;
  categories: string[];
  tags: string[];
  price: number | 'free';
  installed?: boolean;
}

export default function MarketplacePage() {
  const [plugins, setPlugins] = useState<MarketplacePlugin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular');

  useEffect(() => {
    loadPlugins();
  }, [selectedCategory, sortBy]);

  const loadPlugins = async () => {
    try {
      const response = await api.get('/api/v1/marketplace/plugins', {
        params: {
          category: selectedCategory,
          sort: sortBy,
          search: searchQuery
        }
      });
      setPlugins(response.data);
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  };

  const installPlugin = async (pluginId: string) => {
    try {
      await api.post(`/api/v1/marketplace/install/${pluginId}`);
      // Update UI
      setPlugins(prev => prev.map(p => 
        p.id === pluginId ? { ...p, installed: true } : p
      ));
    } catch (error) {
      console.error('Failed to install plugin:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Plugin Marketplace</h1>
        <p className="text-muted-foreground">
          Extend CodeWeaver with powerful plugins from the community
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plugins..."
            className="pl-10"
          />
        </div>
        
        <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <TabsList>
            <TabsTrigger value="popular">
              <TrendingUp className="h-4 w-4 mr-2" />
              Popular
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Clock className="h-4 w-4 mr-2" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="rating">
              <Star className="h-4 w-4 mr-2" />
              Top Rated
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'templates', 'ai-prompts', 'themes', 'languages', 'tools'].map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
          </Button>
        ))}
      </div>

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.map((plugin) => (
          <Card key={plugin.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {plugin.icon ? (
                    <img 
                      src={plugin.icon} 
                      alt={plugin.name}
                      className="w-12 h-12 rounded"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-lg">{plugin.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{plugin.author.name}</span>
                      {plugin.author.verified && (
                        <CheckCircle className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
                
                {plugin.price === 'free' ? (
                  <Badge variant="secondary">Free</Badge>
                ) : (
                  <Badge>${plugin.price}</Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {plugin.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {plugin.downloads.toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                  {plugin.rating.toFixed(1)} ({plugin.reviews})
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap mb-4">
                {plugin.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <Button 
                className="w-full"
                variant={plugin.installed ? 'secondary' : 'default'}
                disabled={plugin.installed}
                onClick={() => installPlugin(plugin.id)}
              >
                {plugin.installed ? 'Installed' : 'Install'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}