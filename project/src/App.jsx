import React from 'react';
import Header from './components/Header';
import DashboardHeader from './components/DashboardHeader';
import CompetitorsList from './components/CompetitorsList';
import Footer from './components/Footer';
import { competitors } from './data/competitors';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader competitorCount={competitors.length} />
          <CompetitorsList competitors={competitors} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;