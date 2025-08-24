import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';
import PipelineLayout from './PipelineLayout';
import PipelineItemCard from '../../components/pipeline/PipelineItemCard';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const IdeasPage = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useSelector((state) => state.auth);

  const fetchIdeas = async () => {
    try {
      const response = await fetch('/api/ideas?stage=Idea', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }

      const data = await response.json();
      setIdeas(data);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast.error('Failed to load ideas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchIdeas();
  };

  const handleMoveForward = (data) => {
    // Remove the item from the current list since it moved to the next stage
    setIdeas(prev => prev.filter(idea => idea.idea_id !== data.idea.idea.idea_id));
    toast.success('Item moved to Script stage successfully!');
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (idea.contributor_name && idea.contributor_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || idea.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  if (loading) {
    return (
      <PipelineLayout 
        title="New Creative Ideas" 
        description="Manage and review new content ideas"
        stage="ideas"
      >
        <div className="p-6">
          <Loading />
        </div>
      </PipelineLayout>
    );
  }

  return (
    <PipelineLayout 
      title="New Creative Ideas" 
      description="Manage and review new content ideas"
      stage="ideas"
    >
      <div className="p-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search ideas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-32"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
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
            
            {['admin', 'media', 'manager'].includes(user?.role) && (
              <Button
                onClick={() => window.location.href = '/ideas/create'}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>New Idea</span>
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{filteredIdeas.length}</div>
            <div className="text-sm text-blue-600">Total Ideas</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {filteredIdeas.filter(idea => idea.canMoveForward).length}
            </div>
            <div className="text-sm text-green-600">Ready to Move</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {filteredIdeas.filter(idea => idea.priority === 'high').length}
            </div>
            <div className="text-sm text-red-600">High Priority</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredIdeas.filter(idea => !idea.canMoveForward).length}
            </div>
            <div className="text-sm text-yellow-600">Need Attention</div>
          </div>
        </div>

        {/* Ideas Grid */}
        {filteredIdeas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No ideas found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || priorityFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'Start by creating your first content idea'
              }
            </p>
            {['admin', 'media', 'manager'].includes(user?.role) && (
              <Button
                onClick={() => window.location.href = '/ideas/create'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Idea
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredIdeas.map((idea) => (
              <PipelineItemCard
                key={idea.idea_id}
                item={idea}
                stage="Idea"
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

export default IdeasPage;