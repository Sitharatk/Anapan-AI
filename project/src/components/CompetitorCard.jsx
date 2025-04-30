import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const CompetitorCard = ({ competitor }) => {
  const [expanded, setExpanded] = useState(false);

  const getRelationshipBadgeColor = (strength) => {
    switch (strength) {
      case 'strong':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'weak':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getEvidenceTypeIcon = (type) => {
    switch (type) {
      case 'article':
        return 'Article';
      case 'case_study':
        return 'Case Study';
      case 'press_release':
        return 'Press Release';
      case 'job_posting':
        return 'Job Posting';
      case 'linkedin':
        return 'LinkedIn';
      default:
        return 'Evidence';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 mr-4">
              <img src={competitor.logo} alt={`${competitor.name} logo`} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{competitor.name}</h3>
              <p className="text-sm text-gray-600">{competitor.industry}</p>
            </div>
          </div>

          <div className="mt-2 sm:mt-0 flex items-center">
            <span className={`text-xs px-3 py-1 rounded-full border ${getRelationshipBadgeColor(competitor.relationshipStrength)} capitalize`}>
              {competitor.relationshipStrength} relationship
            </span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-700">
            {competitor.relationshipDetails[0].description.substring(0, 100)}
            {competitor.relationshipDetails[0].description.length > 100 ? '...' : ''}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
        >
          {expanded ? (
            <>
              <span>View less</span>
              <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              <span>View all {competitor.relationshipDetails.length} collaborations</span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="bg-blue-50 p-6 border-t border-blue-100 animate-fadeIn">
          <h4 className="font-semibold text-gray-900 mb-4">Collaboration Details</h4>
          <div className="space-y-4">
            {competitor.relationshipDetails.map((detail) => (
              <div key={detail.id} className="bg-white p-4 rounded-md border border-blue-200">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">{detail.title}</h5>
                  <span className="text-sm text-gray-500">{detail.year}</span>
                </div>
                <p className="text-gray-700 mb-3">{detail.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {getEvidenceTypeIcon(detail.evidenceType)}
                  </span>
                  {detail.evidenceUrl && (
                    <a
                      href={detail.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      View evidence
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  )}
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