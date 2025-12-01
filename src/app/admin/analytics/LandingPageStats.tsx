'use client';

interface LandingPageData {
  source: string;
  registrations: number;
  trials: number;
  paid: number;
  trialRate: string;
  paidRate: string;
}

interface Props {
  data: LandingPageData[];
}

const sourceLabels: Record<string, string> = {
  'apply': 'Euphoria (/apply)',
  'tyler-perry': 'Tyler Perry (/apply-tyler-perry)',
  'hunting-wives': 'Hunting Wives (/apply-hunting-wives)',
  'dune': 'Dune 3 (/apply-dune)',
  'direct': 'Direct / Other',
};

const sourceColors: Record<string, string> = {
  'apply': 'bg-purple-500',
  'tyler-perry': 'bg-red-500',
  'hunting-wives': 'bg-emerald-500',
  'dune': 'bg-amber-500',
  'direct': 'bg-gray-500',
};

export default function LandingPageStats({ data }: Props) {
  const totalRegistrations = data.reduce((sum, d) => sum + d.registrations, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">📊 Landing Page Performance</h2>
      
      <div className="mb-6">
        <div className="flex h-8 rounded-lg overflow-hidden">
          {data.map((item) => {
            const percentage = totalRegistrations > 0 ? (item.registrations / totalRegistrations) * 100 : 0;
            if (percentage === 0) return null;
            return (
              <div key={item.source} className={`${sourceColors[item.source] || 'bg-gray-400'} flex items-center justify-center text-white text-xs font-medium`} style={{ width: `${percentage}%` }} title={`${sourceLabels[item.source] || item.source}: ${item.registrations} (${percentage.toFixed(1)}%)`}>
                {percentage > 10 && `${percentage.toFixed(0)}%`}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-2">
          {data.map((item) => (
            <div key={item.source} className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded ${sourceColors[item.source] || 'bg-gray-400'}`}></div>
              <span className="text-gray-600">{sourceLabels[item.source] || item.source}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3 font-semibold">Landing Page</th>
              <th className="text-center py-2 px-3 font-semibold">Registrations</th>
              <th className="text-center py-2 px-3 font-semibold">Trials Started</th>
              <th className="text-center py-2 px-3 font-semibold">Trial Rate</th>
              <th className="text-center py-2 px-3 font-semibold">Paid Customers</th>
              <th className="text-center py-2 px-3 font-semibold">Paid Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.source} className="border-b hover:bg-gray-50">
                <td className="py-3 px-3"><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded ${sourceColors[item.source] || 'bg-gray-400'}`}></div><span className="font-medium">{sourceLabels[item.source] || item.source}</span></div></td>
                <td className="text-center py-3 px-3 font-semibold">{item.registrations}</td>
                <td className="text-center py-3 px-3"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">{item.trials}</span></td>
                <td className="text-center py-3 px-3"><span className={`px-2 py-1 rounded text-xs font-medium ${parseFloat(item.trialRate) >= 50 ? 'bg-green-100 text-green-800' : parseFloat(item.trialRate) >= 25 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{item.trialRate}</span></td>
                <td className="text-center py-3 px-3"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">{item.paid}</span></td>
                <td className="text-center py-3 px-3"><span className={`px-2 py-1 rounded text-xs font-medium ${parseFloat(item.paidRate) >= 10 ? 'bg-green-100 text-green-800' : parseFloat(item.paidRate) >= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{item.paidRate}</span></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td className="py-3 px-3">Total</td>
              <td className="text-center py-3 px-3">{data.reduce((s, d) => s + d.registrations, 0)}</td>
              <td className="text-center py-3 px-3">{data.reduce((s, d) => s + d.trials, 0)}</td>
              <td className="text-center py-3 px-3">-</td>
              <td className="text-center py-3 px-3">{data.reduce((s, d) => s + d.paid, 0)}</td>
              <td className="text-center py-3 px-3">-</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
