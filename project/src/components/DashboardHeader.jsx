import React from 'react';
import { FileText, Download, Share2 } from 'lucide-react';

const DashboardHeader = ({ competitorCount }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Virgin Media Competitor Analysis</h1>
          <p className="text-gray-600 mt-1">
            Intelligence report on {competitorCount} competitors who have collaborated with Virgin Media
          </p>
        </div>
        
        
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
          <div className="text-sm text-blue-700 font-medium mb-1">Strong Relationships</div>
          <div className="text-2xl font-bold text-blue-900">5</div>
          <div className="text-xs text-blue-600 mt-1">Active strategic partnerships</div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
          <div className="text-sm text-yellow-700 font-medium mb-1">Moderate Relationships</div>
          <div className="text-2xl font-bold text-yellow-900">3</div>
          <div className="text-xs text-yellow-600 mt-1">Project-based collaborations</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="text-sm text-gray-700 font-medium mb-1">Weak Relationships</div>
          <div className="text-2xl font-bold text-gray-900">2</div>
          <div className="text-xs text-gray-600 mt-1">Limited or historical engagements</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;