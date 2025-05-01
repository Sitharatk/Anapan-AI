import React, { useState, useEffect } from 'react';
import CompetitorCard from './CompetitorCard';
import Filters from './Filters';

const CompetitorsList = () => {
  const [competitors, setCompetitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedStrength, setSelectedStrength] = useState('All');
  const [selectedEngagement, setSelectedEngagement] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/competitors/intel');
        const data = await response.json();
        setCompetitors(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to hardcoded data if API fails
        import('../data/competitors.js').then(module => {
          setCompetitors(module.default);
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredCompetitors = competitors.filter((competitor) => {
    const industryMatch = selectedIndustry === 'All' || competitor.industry === selectedIndustry;
    const strengthMatch = selectedStrength === 'All' || competitor.relationshipStrength === selectedStrength;
    const engagementMatch = selectedEngagement === 'All' || competitor.engagementStatus === selectedEngagement;
    
    return industryMatch && strengthMatch && engagementMatch;
  });

  if (isLoading) return <div>Loading competitor data...</div>;

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
      
      {/* Rest of your component */}
    </div>
  );
};

export default CompetitorsList;