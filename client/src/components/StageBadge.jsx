import React from 'react';

const colorMap = {
  Idea: 'bg-gray-100 text-gray-800 border-gray-200',
  Script: 'bg-blue-100 text-blue-800 border-blue-200',
  Production: 'bg-purple-100 text-purple-800 border-purple-200',
  Social: 'bg-green-100 text-green-800 border-green-200',
};

export default function StageBadge({ stage }){
  const cls = colorMap[stage] || colorMap.Idea;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded-full ${cls}`}>
      {stage}
    </span>
  );
}