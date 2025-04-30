import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">CompetitorIntel</h3>
            <p className="text-sm">
              Comprehensive competitive intelligence for strategic business decisions.
            </p>
          </div>
          
         
          
         
          
          
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">© 2025 CompetitorIntel. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;