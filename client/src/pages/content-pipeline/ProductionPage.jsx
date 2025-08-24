import React, { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import PipelineLayout from './PipelineLayout';
import PipelineItemCard from '../../components/pipeline/PipelineItemCard';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const ProductionPage = () => {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useSelector((state) => state.auth);

  const fetchProductions = async () => {
    try {
      const response = await fetch('/api/ideas?stage=Production', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch productions');
      }

      const data = await response.json();
      setProductions(data);
    } catch (error) {
      console.error('Error fetching productions:', error);
      toast.error('Failed to load productions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProductions();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProductions();
  };

  const handleMoveForward = (data) => {
    setProductions(prev => prev.filter(prod => prod.idea_id !== data.idea.idea.idea_id));
    toast.success('Item moved to Social stage successfully!');
  };

  const filteredProductions = productions.filter(production => {
    const matchesSearch = production.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (production.editor_name && production.editor_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || production.production_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <PipelineLayout 
        title="Production Workflow" 
        description="Video production and editing"
        stage="production"
      >
        <div className="p-6">
          <Loading />
        </div>
      </PipelineLayout>
    );
  }

  return (
    <PipelineLayout 
      title="Production Workflow" 
      description="Video production and editing"
      stage="production"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search productions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            >
              <option value="all">All Status</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </Select>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{filteredProductions.length}</div>
            <div className="text-sm text-blue-600">Total Productions</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {filteredProductions.filter(prod => prod.canMoveForward).length}
            </div>
            <div className="text-sm text-green-600">Ready for Social</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {filteredProductions.filter(prod => prod.production_status === 'completed').length}
            </div>
            <div className="text-sm text-purple-600">Completed</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {filteredProductions.filter(prod => prod.production_status === 'blocked').length}
            </div>
            <div className="text-sm text-red-600">Blocked</div>
          </div>
        </div>

        {filteredProductions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No productions found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'Productions will appear here when scripts are moved from the Content Management stage'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProductions.map((production) => (
              <PipelineItemCard
                key={production.idea_id}
                item={production}
                stage="Production"
                userRole={user?.role}
                onMoveForward={handleMoveForward}
              />
            ))}
          </div>
        )}
      </div>
    </PipelineLayout>
  );
};

export default ProductionPage;