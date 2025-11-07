'use client';

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'on track':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'delayed':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function ActiveTeams() {
  const teams = [
    {
      name: 'Project Phoenix',
      lead: 'Ben Carter',
      members: '5 Members',
      status: 'On Track'
    },
    {
      name: 'Data Platform',
      lead: 'David Lee',
      members: '3 Members',
      status: 'On Track'
    },
    {
      name: 'Mobile App Refresh',
      lead: 'Carla Rodriguez',
      members: '4 Members',
      status: 'Delayed'
    },
    {
      name: 'AI Integration',
      lead: 'Aisha Sharma',
      members: '3 Members',
      status: 'On Track'
    },
    {
      name: 'HR Portal Update',
      lead: 'Emily White',
      members: '2 Members',
      status: 'Completed'
    }
  ];

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Active Teams / Projects</h2>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {teams.map((team, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div>
                <h3 className="text-gray-900 font-medium">{team.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Lead: {team.lead}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{team.members}</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(team.status)}`}>
                  {team.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}