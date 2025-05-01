// DashboardHeader.jsx
import React, { useState } from 'react';
import {  Calendar, RefreshCw } from 'lucide-react';

const DashboardHeader = ({ 
  competitorCount,
  lastUpdated = new Date().toISOString() 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  // Format the date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Simulate export functionality
  const handleExport = (format) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`Report exported as ${format}`);
    }, 1500);
  };
  
  

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Virgin Media Competitor Analysis</h1>
            <span className="ml-3 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              LIVE DATA
            </span>
          </div>
          
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <Calendar size={14} className="mr-1" />
            <span>Last updated: {formatDate(lastUpdated)}</span>
           
          </div>
        </div>
    
         
      </div>
      
  
    </div>
  );
};

export default DashboardHeader;