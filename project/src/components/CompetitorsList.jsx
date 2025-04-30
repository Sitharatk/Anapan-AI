import React, { useState } from 'react';
import CompetitorCard from './CompetitorCard';
import Filters from './Filters';

const CompetitorsList = ({ competitors }) => {
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedStrength, setSelectedStrength] = useState('All');
  const [selectedEngagement, setSelectedEngagement] = useState('All');

  const filteredCompetitors = competitors.filter((competitor) => {
    const industryMatch = selectedIndustry === 'All' || competitor.industry === selectedIndustry;
    const strengthMatch = selectedStrength === 'All' || competitor.relationshipStrength === selectedStrength;
    const engagementMatch = selectedEngagement === 'All' || competitor.engagementStatus === selectedEngagement;
    
    return industryMatch && strengthMatch && engagementMatch;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <Filters
        selectedIndustry={selectedIndustry}
        setSelectedIndustry={setSelectedIndustry}
        selectedStrength={selectedStrength}
        setSelectedStrength={setSelectedStrength}
        selectedEngagement={selectedEngagement}
        setSelectedEngagement={setSelectedEngagement}
      />
      
      {filteredCompetitors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No competitors found matching the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 animate-fadeIn">
          {filteredCompetitors.map((competitor) => (
            <CompetitorCard key={competitor.id} competitor={competitor} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompetitorsList