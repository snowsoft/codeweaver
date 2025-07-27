import React from 'react';

interface SidebarProps {
  onNavigate?: (view: string) => void;
  activeView?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeView }) => {
  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700">
      <div className="p-4">
        <h3 className="text-xs uppercase text-gray-400 mb-4">Navigation</h3>

        <nav className="space-y-2">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
              activeView === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => onNavigate?.('generate')}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
              activeView === 'generate'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Generate
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
