import React from 'react';
import { PieChart as ReChartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = [
  '#f59e0b', // Food - Amber
  '#3b82f6', // Transport - Blue
  '#8b5cf6', // Shopping - Violet
  '#6366f1', // Education - Indigo
  '#f43f5e', // Entertainment - Rose
  '#f97316', // Bills - Orange
  '#64748b', // Other - Slate
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 p-3 shadow-lg rounded-xl backdrop-blur-md">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          {payload[0].name}
        </p>
        <p className="text-base font-bold text-slate-800 dark:text-slate-100">
          ₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
          {payload[0].payload.percentage}% of expenses
        </p>
      </div>
    );
  }
  return null;
};

const PieChart = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        No expense data for this period.
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ReChartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
        </ReChartsPie>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
