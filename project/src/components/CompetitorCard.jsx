// CompetitorCard.jsx
import React, { useState } from 'react';

const CompetitorCard = ({ competitor }) => {
  const [expanded, setExpanded] = useState(false);

  // Determine relationship strength styles
  const getRelationshipBadge = (strength) => {
    const styles = {
      strong: 'bg-green-100 text-green-800 border-green-500',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-500',
      weak: 'bg-red-100 text-red-800 border-red-500'
    };
    
    return `px-3 py-1 text-sm font-medium rounded-full border ${styles[strength] || 'bg-gray-100 text-gray-800 border-gray-500'}`;
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }).format(date);
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Logo placeholder - you would replace this with actual logos */}
         
          <div>
            <h3 className="text-xl font-semibold">{competitor.name}</h3>
            <p className="text-gray-600">{competitor.industry}</p>
          </div>
        </div>
        <div>
          <span className={getRelationshipBadge(competitor.relationshipStrength)}>
            {competitor.relationshipStrength.charAt(0).toUpperCase() + competitor.relationshipStrength.slice(1)} Relationship
          </span>
        </div>
      </div>

      {/* Summary displayed for all cards */}
      <div className="mt-4">
        {competitor.relationshipDetails && competitor.relationshipDetails[0]?.title !== 'No public evidence found' ? (
          <p className="text-gray-700">
{(competitor.relationshipDetails?.length || 0)} partnership{(competitor.relationshipDetails?.length !== 1 ? 's' : '')} found...

          </p>
        ) : (
          <p className="text-gray-700">No collaboration evidence found through public sources</p>
        )}
      </div>

      {/* Toggle button */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="mt-4 text-blue-600 hover:text-blue-800 flex items-center"
      >
        <span>View {expanded ? 'less' : 'all'} {competitor.relationshipDetails.length} collaboration{competitor.relationshipDetails.length !== 1 ? 's' : ''}</span>
        <svg 
          className={`ml-1 h-5 w-5 transform ${expanded ? 'rotate-180' : ''} transition-transform`}
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {/* Expanded details */}
      {expanded && competitor.relationshipDetails[0]?.title !== 'No public evidence found' && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-lg font-medium mb-2">Partnership Details</h4>
          <div className="space-y-4">
            {competitor.relationshipDetails.map((detail, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-md">
                <h5 className="font-medium text-blue-700 hover:underline">
                  <a href={detail.url} target="_blank" rel="noopener noreferrer">
                    {detail.title}
                  </a>
                </h5>
                <p className="text-sm text-gray-600 mt-1">{detail.snippet}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Last updated: {formatDate(detail.lastScraped)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorCard;