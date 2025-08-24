import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card';

const pipelineTabs = [
  {
    key: 'ideas',
    label: 'New Creative Ideas',
    icon: '💡',
    path: '/content-pipeline/ideas',
    description: 'Manage and review new content ideas'
  },
  {
    key: 'scripts',
    label: 'Content Management',
    icon: '📝',
    path: '/content-pipeline/scripts',
    description: 'Script development and content creation'
  },
  {
    key: 'production',
    label: 'Production Workflow',
    icon: '🎬',
    path: '/content-pipeline/production',
    description: 'Video production and editing'
  },
  {
    key: 'social',
    label: 'Social Media',
    icon: '📱',
    path: '/content-pipeline/social',
    description: 'Social media posting and publishing'
  }
];

const PipelineLayout = ({ children, title, description, stage }) => {
  const location = useLocation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Production Pipeline</h1>
              <p className="text-gray-600 mt-1">Manage content from idea to publication</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{pipelineTabs.find(tab => tab.key === stage)?.icon}</span>
              <div>
                <h2 className="font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {pipelineTabs.map((tab) => (
              <NavLink
                key={tab.key}
                to={tab.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`
                }
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="px-6">
        <Card className="p-0">
          {children}
        </Card>
      </div>
    </div>
  );
};

export default PipelineLayout;