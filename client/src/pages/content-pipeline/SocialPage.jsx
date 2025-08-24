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

const SocialPage = () => {
  const [socialPosts, setSocialPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useSelector((state) => state.auth);

  const fetchSocialPosts = async () => {
    try {
      const response = await fetch('/api/ideas?stage=Social', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch social posts');
      }

      const data = await response.json();
      setSocialPosts(data);
    } catch (error) {
      console.error('Error fetching social posts:', error);
      toast.error('Failed to load social posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSocialPosts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSocialPosts();
  };

  const handleMoveForward = (data) => {
    // Update the item status instead of removing it since this is the final stage
    setSocialPosts(prev => prev.map(post => 
      post.idea_id === data.idea.idea.idea_id 
        ? { ...post, social_status: 'published', social_approved: true, canMoveForward: false }
        : post
    ));
    toast.success('Social media post published successfully!');
  };

  const filteredSocialPosts = socialPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.platforms && post.platforms.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || post.social_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <PipelineLayout 
        title="Social Media" 
        description="Social media posting and publishing"
        stage="social"
      >
        <div className="p-6">
          <Loading />
        </div>
      </PipelineLayout>
    );
  }

  return (
    <PipelineLayout 
      title="Social Media" 
      description="Social media posting and publishing"
      stage="social"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search social posts..."
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
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
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
            <div className="text-2xl font-bold text-blue-600">{filteredSocialPosts.length}</div>
            <div className="text-sm text-blue-600">Total Posts</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {filteredSocialPosts.filter(post => post.social_status === 'published').length}
            </div>
            <div className="text-sm text-green-600">Published</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredSocialPosts.filter(post => post.social_status === 'scheduled').length}
            </div>
            <div className="text-sm text-yellow-600">Scheduled</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {filteredSocialPosts.filter(post => post.canMoveForward).length}
            </div>
            <div className="text-sm text-purple-600">Ready to Publish</div>
          </div>
        </div>

        {filteredSocialPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No social posts found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'Social posts will appear here when productions are moved from the Production stage'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSocialPosts.map((post) => (
              <PipelineItemCard
                key={post.idea_id}
                item={post}
                stage="Social"
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

export default SocialPage;