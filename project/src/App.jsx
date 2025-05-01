import React from 'react';
import Header from './components/Header';
import DashboardHeader from './components/DashboardHeader';
import CompetitorsList from './components/CompetitorsList';
import Footer from './components/Footer';

function App() {
 
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader />
          <CompetitorsList />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;