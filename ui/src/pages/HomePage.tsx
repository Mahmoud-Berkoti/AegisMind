import React from 'react';
import Threads from '@/components/Threads';

interface HomePageProps {
  onEnter: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 relative overflow-hidden">
      {/* Animated WebGL Background */}
      <div className="absolute inset-0 opacity-30">
        <Threads 
          color={[0.4, 0.5, 1.0]}  // Indigo color
          amplitude={1.5}
          distance={0.3}
          enableMouseInteraction={true}
        />
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/40 to-transparent"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo and Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <svg className="w-20 h-20 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            AegisMind
          </h1>
          
          <p className="text-xl text-indigo-300 font-medium mb-2">
            Cognitive Security Information and Event Management
          </p>
          
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mb-8"></div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mb-12 animate-slide-up">
          {/* Real-Time Monitoring */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all hover:scale-105">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-Time Visibility</h3>
            <p className="text-sm text-gray-400">
              Stream and analyze security events in real-time with MongoDB Change Streams for instant threat detection.
            </p>
          </div>

          {/* Intelligent Clustering */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all hover:scale-105">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Intelligent Clustering</h3>
            <p className="text-sm text-gray-400">
              Advanced LSH algorithms automatically group related events into actionable incidents using similarity detection.
            </p>
          </div>

          {/* Enterprise Grade */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all hover:scale-105">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Enterprise Grade</h3>
            <p className="text-sm text-gray-400">
              Built with C++20, MongoDB, and production-ready architecture for mission-critical security operations.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="max-w-3xl mb-12 text-center animate-fade-in-delay">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">Powered By</h3>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-blue-400">C++</span>
              </div>
              <span className="text-sm">C++20</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-8 h-8 bg-green-500/10 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-green-400">DB</span>
              </div>
              <span className="text-sm">MongoDB</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-8 h-8 bg-cyan-500/10 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-cyan-400">TS</span>
              </div>
              <span className="text-sm">TypeScript</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-8 h-8 bg-purple-500/10 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-purple-400">WS</span>
              </div>
              <span className="text-sm">WebSocket</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onEnter}
          className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/50 animate-pulse-slow"
        >
          <span className="flex items-center gap-3">
            Enter Security Operations Center
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>Production-grade SIEM built for modern security operations</p>
          <p className="mt-2">Real-time incident detection • Automated correlation • Enterprise scalability</p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulseSlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fadeIn 0.8s ease-out 0.3s both;
        }
        
        .animate-slide-up {
          animation: slideUp 0.8s ease-out 0.2s both;
        }
        
        .animate-pulse-slow {
          animation: pulseSlow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

