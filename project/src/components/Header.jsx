import React from 'react';
import { Search } from 'lucide-react';

const Header = ({ searchTerm, setSearchTerm }) => {
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-4 px-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-blue-200">Infosys</span> CompetitorIntel
          </div>
        </div>

        
      </div>
    </header>
  );
};

export default Header;