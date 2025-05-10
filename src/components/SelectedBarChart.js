import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Label,
  Cell
} from 'recharts';
import * as d3 from 'd3';

const SelectedBarChart = ({ data, selected, colorBy, setSelected }) => {
  // Sort selected data by value in descending order
  const selectedData = data
    .filter(d => selected.includes(d.COUNTY?.toUpperCase()))
    .map(d => ({
      name: d.COUNTY,
      value: Number(d[colorBy]) || 0
    }))
    .sort((a, b) => b.value - a.value); // Sort in descending order

  const formatValue = (value) => value.toFixed(3);

  const colorScale = d3.scaleSequential()
    .domain([0, 100])
    .interpolator(d3.interpolateBlues);

  const handleBarClick = (countyName) => {
    const upper = countyName.toUpperCase();
    setSelected(prev => prev.filter(name => name !== upper));
  };

  const handleClearAll = () => {
    setSelected([]);
  };

  return (
    <div style={{
      width: '500px',
      height: '500px',
      marginLeft: '20px',
      backgroundColor: '#e0e0e0',
      borderRadius: '10px',
      padding: '10px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ textAlign: 'center', flex: 1 }}>Selected Counties (select up to 15)</h3>
        <button onClick={handleClearAll} style={{
          backgroundColor: '#ff6666',
          border: 'none',
          borderRadius: '5px',
          padding: '5px 10px',
          cursor: 'pointer',
          marginLeft: '10px'
        }}>Clear</button>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={selectedData}
          layout="vertical"
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number">
            <Label value={colorBy === 'RISK_SCORE' ? 'Risk Score' : 'Value'} position="insideBottom" offset={-10} />
          </XAxis>
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ angle: -30, style: { fontStyle: 'italic' } }}
          >
            <Label value="County" angle={-90} position="insideLeft" offset={-5} />
          </YAxis>
          <Tooltip formatter={(value) => formatValue(value)} />
          <Bar dataKey="value">
            {selectedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colorScale(entry.value)}
                onClick={() => handleBarClick(entry.name)}
                cursor="pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SelectedBarChart;



