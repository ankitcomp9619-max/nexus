import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function CompletionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #f1f5f9)" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--chart-tick, #94a3b8)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--chart-tick, #94a3b8)' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: '1px solid var(--chart-border, #e2e8f0)',
            backgroundColor: 'var(--chart-bg, #ffffff)',
            color: 'var(--chart-text, #1e293b)',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        />
        <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={2} fill="url(#colorCompleted)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
