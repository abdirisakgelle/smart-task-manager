import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useGetSocialMediaQuery, useCreateSocialMediaMutation, useDeleteSocialMediaMutation, useGetContentQuery } from '@/store/api/apiSlice';

const SocialMedia = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [formData, setFormData] = useState({
    content_id: '',
    platforms: '',
    post_type: 'video',
    post_date: '',
    post_time: '',
    caption: '',
    status: 'draft',
    approved: false,
    notes: ''
  });

  // API hooks
  const { data: socialMedia = [], isLoading, error, refetch } = useGetSocialMediaQuery();
  const { data: content = [] } = useGetContentQuery();
  const [createSocialMedia, { isLoading: isCreating }] = useCreateSocialMediaMutation();
  const [deleteSocialMedia, { isLoading: isDeleting }] = useDeleteSocialMediaMutation();

  const filteredSocialMedia = socialMedia.filter(item => {
    const matchesSearch = (item.content_title && item.content_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (item.caption && item.caption.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesPlatform = filterPlatform === 'all' || item.platforms.toLowerCase().includes(filterPlatform.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Combine date and time into a single datetime string
      let post_date = null;
      if (formData.post_date && formData.post_time) {
        post_date = `${formData.post_date}T${formData.post_time}`;
      } else if (formData.post_date) {
        // If only date is provided, set time to end of day
        post_date = `${formData.post_date}T23:59`;
      }

      const submissionData = {
        ...formData,
        post_date
      };

      await createSocialMedia(submissionData).unwrap();
      setFormData({
        content_id: '',
        platforms: '',
        post_type: 'video',
        post_date: '',
        post_time: '',
        caption: '',
        status: 'draft',
        approved: false,
        notes: ''
      });
      setShowModal(false);
      refetch();
    } catch (error) {
      console.error('Failed to create social media post:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this social media post?')) {
      try {
        await deleteSocialMedia(id).unwrap();
        refetch();
      } catch (error) {
        console.error('Failed to delete social media post:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      published: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      pending_review: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return `px-2 py-1 rounded-full text-xs font-medium border ${statusClasses[status] || statusClasses.draft}`;
  };

  const getPostTypeBadge = (type) => {
    const typeClasses = {
      video: 'bg-purple-100 text-purple-800 border-purple-200',
      image: 'bg-pink-100 text-pink-800 border-pink-200',
      carousel: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      story: 'bg-orange-100 text-orange-800 border-orange-200',
      reel: 'bg-red-100 text-red-800 border-red-200'
    };
    return `px-2 py-1 rounded-full text-xs font-medium border ${typeClasses[type] || typeClasses.video}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-2">Error Loading Social Media</div>
          <div className="text-gray-600 mb-4">Failed to load social media data. Please check your connection.</div>
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Media Management</h1>
          <p className="text-gray-600">Manage and track social media posts and campaigns</p>
          <p className="text-sm text-gray-500 mt-1">Total Posts: {socialMedia.length} | Showing: {filteredSocialMedia.length}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Post
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
            <option value="pending_review">Pending Review</option>
          </select>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSocialMedia.map((post) => (
          <Card key={post.post_id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {post.content_title || 'Untitled Post'}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className={getStatusBadge(post.status)}>
                    {post.status.replace('_', ' ')}
                  </span>
                  <span className={getPostTypeBadge(post.post_type)}>
                    {post.post_type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Platforms:</strong> {post.platforms}
                </p>
                {post.caption && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {post.caption}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  <strong>Posted:</strong> {formatDateTime(post.post_date)}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {/* View post details */}}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {/* Edit post */}}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(post.post_id)}
                  className="p-1 text-red-400 hover:text-red-600 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredSocialMedia.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg font-medium mb-2">No social media posts found</div>
          <div className="text-gray-500">Create your first post to get started</div>
        </div>
      )}

      {/* Modal for New Post */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Social Media Post</h2>
              <p className="text-sm text-gray-600 mt-1">Enter post details</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <select
                    required
                    value={formData.content_id}
                    onChange={(e) => setFormData({...formData, content_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select Content</option>
                    {content.map((item) => (
                      <option key={item.content_id} value={item.content_id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platforms *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.platforms}
                    onChange={(e) => setFormData({...formData, platforms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g., Instagram, Facebook"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Post Type
                  </label>
                  <select
                    value={formData.post_type}
                    onChange={(e) => setFormData({...formData, post_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                    <option value="carousel">Carousel</option>
                    <option value="story">Story</option>
                    <option value="reel">Reel</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                    <option value="pending_review">Pending Review</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Post Date
                  </label>
                  <input
                    type="date"
                    value={formData.post_date}
                    onChange={(e) => setFormData({...formData, post_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Post Time
                  </label>
                  <input
                    type="time"
                    value={formData.post_time}
                    onChange={(e) => setFormData({...formData, post_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption
                </label>
                <textarea
                  rows="3"
                  value={formData.caption}
                  onChange={(e) => setFormData({...formData, caption: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Write your post caption..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Add notes about this post..."
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMedia;
