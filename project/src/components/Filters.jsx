import React from 'react';

const Filters = ({
  selectedIndustry,
  setSelectedIndustry,
  selectedStrength,
  setSelectedStrength,
  selectedEngagement,
  setSelectedEngagement
}) => {
  const industries = [
    'All',
    'IT Services',
    'Consulting',
    'Technology'
  ];

  const strengths = [
   
    'Strong',
    'Moderate',
    'Weak'
  ];

  const engagementStatuses = [

    'Current',
    'Past'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
      <div className="flex flex-col md:flex-row md:items-start md:space-x-4 md:space-y-0 space-y-4">
        {/* Industry Filter */}
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
          <div className="flex flex-wrap gap-2">
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-full transition-colors ${
                  selectedIndustry === industry
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

      

        {/* Relationship Strength Filter */}
        <div className="flex-1 min-w-[160px] md:border-l md:pl-4 md:border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Strength</label>
          <div className="flex flex-wrap gap-2">
            {strengths.map((strength) => (
              <button
                key={strength}
                onClick={() => setSelectedStrength(strength.toLowerCase())}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-full transition-colors ${
                  selectedStrength === strength
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {strength}
              </button>
            ))}
          </div>
        </div>
          {/* Engagement Status Filter */}
          <div className="flex-1 min-w-[160px] md:border-l md:pl-4 md:border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Engagement</label>
          <div className="flex flex-wrap gap-2">
            {engagementStatuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedEngagement(status.toLowerCase())}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-full transition-colors ${
                  selectedEngagement === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;