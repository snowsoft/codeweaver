import React from 'react';

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Total Files', value: '24', color: 'bg-blue-500', icon: 'F' },
    { label: 'Code Generated', value: '156', color: 'bg-green-500', icon: 'G' },
    { label: 'Tests Created', value: '89', color: 'bg-purple-500', icon: 'T' },
    { label: 'Reviews Done', value: '45', color: 'bg-orange-500', icon: 'R' }
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        CodeWeaver Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg text-white ${stat.color}`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
