import React from 'react';
import {
  BarChart as ReChartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 p-3 shadow-lg rounded-xl backdrop-blur-md">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          {payload[0].payload.month}
        </p>
        <p className="text-base font-bold text-rose-500 dark:text-rose-450">
          Expenses: ₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const BarChart = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        No expense data found.
      </div>
    );
  }

  // BarChart shows the last 6 months expenses.
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ReChartsBar data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/60" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
          <Bar
            dataKey="expense"
            fill="#f43f5e"
            radius={[6, 6, 0, 0]}
            maxBarSize={45}
          />
        </ReChartsBar>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
