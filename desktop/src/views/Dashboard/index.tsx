import { IconCode, IconRefresh, IconFileText, IconTestPipe } from '@tabler/icons-react';

export function Dashboard() {
  const stats = [
    { label: 'Code Generated', value: '0', icon: IconCode, color: 'bg-blue-500' },
    { label: 'Files Refactored', value: '0', icon: IconRefresh, color: 'bg-green-500' },
    { label: 'Docs Created', value: '0', icon: IconFileText, color: 'bg-purple-500' },
    { label: 'Tests Written', value: '0', icon: IconTestPipe, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Welcome to CodeWeaver Desktop
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={p-3 rounded-lg text-white ${stat.color}}>
                  <Icon size={24} />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Getting Started
        </h2>
        <ul className="space-y-3 text-gray-600 dark:text-gray-400">
          <li>â€¢ Use the sidebar to navigate between different features</li>
          <li>â€¢ Generate new code files with AI assistance</li>
          <li>â€¢ Refactor existing code to improve quality</li>
          <li>â€¢ Automatically generate documentation</li>
          <li>â€¢ Create comprehensive test suites</li>
        </ul>
      </div>
    </div>
  );
}