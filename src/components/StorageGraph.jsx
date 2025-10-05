import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import getStorageByType from '../facilities/getStorageByType';

function StorageGraph({files}) {
  const data = getStorageByType(files);

  return (
    <div className="w-[70%] h-72 bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Storage Usage by File Type</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00c6ff" />   {/* Light Blue */}
              <stop offset="100%" stopColor="#7b2ff7" /> {/* Purple */}
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis label={{ value: 'MB', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="size" fill="url(#barGradient)" name="Size (MB)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default StorageGraph