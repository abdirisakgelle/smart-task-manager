import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, FileText } from 'lucide-react';
import PipelineLayout from './PipelineLayout';
import PipelineItemCard from '../../components/pipeline/PipelineItemCard';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const ScriptsPage = () => {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useSelector((state) => state.auth);

  const fetchScripts = async () => {
    try {
      const response = await fetch('/api/ideas?stage=Script', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch scripts');
      }

      const data = await response.json();
      setScripts(data);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      toast.error('Failed to load scripts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchScripts();
  };

  const handleMoveForward = (data) => {
    // Remove the item from the current list since it moved to the next stage
    setScripts(prev => prev.filter(script => script.idea_id !== data.idea.idea.idea_id));
    toast.success('Item moved to Production stage successfully!');
  };

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (script.contributor_name && script.contributor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (script.director_name && script.director_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || script.script_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <PipelineLayout 
        title="Content Management" 
        description="Script development and content creation"
        stage="scripts"
      >
        <div className="p-6">
          <Loading />
        </div>
      </PipelineLayout>
    );
  }

  return (
    <PipelineLayout 
      title="Content Management" 
      description="Script development and content creation"
      stage="scripts"
    >
      <div className="p-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search scripts..."
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
              <option value="draft">Draft</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </Select>
          </div>

          <div className="flex items-center space-x-3">
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{filteredScripts.length}</div>
            <div className="text-sm text-blue-600">Total Scripts</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {filteredScripts.filter(script => script.canMoveForward).length}
            </div>
            <div className="text-sm text-green-600">Ready for Production</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {filteredScripts.filter(script => script.script_status === 'completed').length}
            </div>
            <div className="text-sm text-purple-600">Completed Scripts</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredScripts.filter(script => script.script_status === 'in progress').length}
            </div>
            <div className="text-sm text-yellow-600">In Progress</div>
          </div>
        </div>

        {/* Scripts Grid */}
        {filteredScripts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No scripts found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'Scripts will appear here when ideas are moved from the Ideas stage'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredScripts.map((script) => (
              <PipelineItemCard
                key={script.idea_id}
                item={script}
                stage="Script"
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

export default ScriptsPage;