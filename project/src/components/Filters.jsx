// Filters.jsx
import React from 'react';

const Filters = ({
  selectedIndustry,
  setSelectedIndustry,
  selectedStrength,
  setSelectedStrength,
  selectedEngagement,
  setSelectedEngagement,
}) => {

  const FilterButton = ({ label, isActive, onClick }) => (
    <button
      className={`px-4 py-2 rounded-md transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Industry Filter */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Industry</h3>
          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="All"
              isActive={selectedIndustry === 'All'}
              onClick={() => setSelectedIndustry('All')}
            />
            <FilterButton
              label="IT Services"
              isActive={selectedIndustry === 'IT Services'}
              onClick={() => setSelectedIndustry('IT Services')}
            />
            <FilterButton
              label="Consulting"
              isActive={selectedIndustry === 'Consulting'}
              onClick={() => setSelectedIndustry('Consulting')}
            />
            <FilterButton
              label="Technology"
              isActive={selectedIndustry === 'Technology'}
              onClick={() => setSelectedIndustry('Technology')}
            />
          </div>
        </div>

        {/* Strength Filter */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Strength</h3>
          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="All"
              isActive={selectedStrength === 'All'}
              onClick={() => setSelectedStrength('All')}
            />
            <FilterButton
              label="Strong"
              isActive={selectedStrength === 'strong'}
              onClick={() => setSelectedStrength('strong')}
            />
            <FilterButton
              label="Moderate"
              isActive={selectedStrength === 'moderate'}
              onClick={() => setSelectedStrength('moderate')}
            />
            <FilterButton
              label="Weak"
              isActive={selectedStrength === 'weak'}
              onClick={() => setSelectedStrength('weak')}
            />
          </div>
        </div>

        {/* Engagement Filter */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Engagement</h3>
          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="All"
              isActive={selectedEngagement === 'All'}
              onClick={() => setSelectedEngagement('All')}
            />
            <FilterButton
              label="Current"
              isActive={selectedEngagement === 'current'}
              onClick={() => setSelectedEngagement('current')}
            />
            <FilterButton
              label="Past"
              isActive={selectedEngagement === 'past'}
              onClick={() => setSelectedEngagement('past')}
            />
          </div>
        </div>
      </div>
      
      {/* Reset Filters Button */}
      <div className="mt-4 text-right">
        <button
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          onClick={() => {
            setSelectedIndustry('All');
            setSelectedStrength('All');
            setSelectedEngagement('All');
          }}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default Filters;