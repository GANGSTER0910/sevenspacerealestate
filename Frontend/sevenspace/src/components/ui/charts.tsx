
import * as React from "react";
import { 
  ResponsiveContainer, 
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./chart";

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Bar Chart Component
interface BarChartProps {
  data: any[];
  xAxis: string;
  series: string[];
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  xAxis, 
  series,
  className 
}) => {
  return (
    <ChartContainer className={className} config={{}} id="bar-chart">
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxis} />
        <YAxis />
        <ChartTooltip 
          content={<ChartTooltipContent />}
        />
        <Legend />
        {series.map((key, index) => (
          <Bar 
            key={key} 
            dataKey={key} 
            fill={COLORS[index % COLORS.length]} 
            stackId={key === 'inquiries' ? "a" : undefined}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
};

// Line Chart Component
interface LineChartProps {
  data: any[];
  xAxis: string;
  yAxis?: string;
  series?: string[];
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  xAxis, 
  yAxis,
  series,
  className 
}) => {
  return (
    <ChartContainer className={className} config={{}} id="line-chart">
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxis} />
        <YAxis />
        <ChartTooltip 
          content={<ChartTooltipContent />}
        />
        <Legend />
        {series ? (
          // Multiple lines
          series.map((key, index) => (
            <Line 
              key={key} 
              type="monotone" 
              dataKey={key} 
              stroke={COLORS[index % COLORS.length]} 
              activeDot={{ r: 8 }} 
            />
          ))
        ) : (
          // Single line
          <Line 
            type="monotone" 
            dataKey={yAxis} 
            stroke={COLORS[0]} 
            activeDot={{ r: 8 }} 
          />
        )}
      </RechartsLineChart>
    </ChartContainer>
  );
};

// Pie Chart Component
interface PieChartProps {
  data: any[];
  className?: string;
}

export const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  className 
}) => {
  return (
    <ChartContainer className={className} config={{}} id="pie-chart">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
      </RechartsPieChart>
    </ChartContainer>
  );
};
