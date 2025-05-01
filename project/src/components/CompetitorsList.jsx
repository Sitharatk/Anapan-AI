import React, { useState, useEffect } from 'react';
import CompetitorCard from './CompetitorCard'; // Make sure this exists
import Filters from './Filters'; // Make sure this exists

const CompetitorsList = () => {
  const [competitors, setCompetitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedStrength, setSelectedStrength] = useState('All');
  const [selectedEngagement, setSelectedEngagement] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null); // Clear previous errors
      try {
        const response = await fetch('http://localhost:5000/api/competitors/intel');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCompetitors(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error); // Set error state
        // Removed fallback to hardcoded data.  Handle error and let user know.
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCompetitors = competitors.filter((competitor) => {
    const industryMatch =
      selectedIndustry === 'All' || competitor.industry === selectedIndustry;
    const strengthMatch =
      selectedStrength === 'All' || competitor.relationshipStrength === selectedStrength;
    const engagementMatch =
      selectedEngagement === 'All' || competitor.engagementStatus === selectedEngagement;

    return industryMatch && strengthMatch && engagementMatch;
  });

  if (isLoading) return <div>Loading competitor data...</div>;
  if (error) return <div>Error: {error.message}</div>; // Display error message

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
      {filteredCompetitors.length > 0 ? (
        filteredCompetitors.map((competitor) => (
          <CompetitorCard key={competitor.id} competitor={competitor} /> // Make sure this component exists
        ))
      ) : (
        <div>No competitors found matching your criteria.</div> //Added message when there are no matching competitors
      )}
    </div>
  );
};

export default CompetitorsList;