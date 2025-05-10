import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RiskBarChart = ({ data }) => {
  // Sort data by risk score in descending order for the highest risk scores
  const sortedDataHigh = data.sort((a, b) => b.RISK_SCORE - a.RISK_SCORE).slice(0, 20); // Top 20 counties
  // Sort data by risk score in ascending order for the lowest risk scores
  const sortedDataLow = data.sort((a, b) => a.RISK_SCORE - b.RISK_SCORE).slice(0, 20); // Bottom 20 counties

  // Custom Tooltip for rounding the risk score
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { COUNTY, RISK_SCORE } = payload[0].payload;
      return (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '5px',
        }}>
          <h4>{COUNTY}</h4>
          <p>Risk Score: {RISK_SCORE.toFixed(3)}</p> {/* Round the risk score to thousandths */}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '20px',
    }}>
      {/* Chart for Highest Risk Scores */}
      <div style={{
        backgroundColor: '#f0f0f0', // Light grey background
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '800px',
        overflow: 'visible',
        width: '48%', // Make each chart take up 48% of the width
      }}>
        <h3 style={{
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '20px',
          marginBottom: '30px',
          color: '#333',
          textDecoration: 'underline',
        }}>
          Texas Counties With the Highest Risk Scores
        </h3>

        <ResponsiveContainer width="100%" height={600}>
          <BarChart
            data={sortedDataHigh}
            margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="COUNTY"
              tick={{ angle: -45, textAnchor: 'end' }}
              tickSize={10}
              interval={0}
              height={100}
              label={{
                value: 'Counties',
                position: 'insideBottom',
                offset: -10,
                fontSize: 14,
                fill: '#333',
              }}
            />
            <YAxis
              label={{
                value: 'Risk Score',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                fontSize: 14,
                fill: '#333',
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              layout="horizontal"
              wrapperStyle={{
                top: '10px',
                right: '10px',
              }}
            />
            <Bar
              dataKey="RISK_SCORE"
              fill="#3b82f6"
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart for Lowest Risk Scores */}
      <div style={{
        backgroundColor: '#f0f0f0',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '800px',
        overflow: 'visible',
        width: '48%',
      }}>
        <h3 style={{
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '20px',
          marginBottom: '30px',
          color: '#333',
          textDecoration: 'underline',
        }}>
          Texas Counties With the Lowest Risk Scores
        </h3>

        <ResponsiveContainer width="100%" height={600}>
          <BarChart
            data={sortedDataLow}
            margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="COUNTY"
              tick={{ angle: -45, textAnchor: 'end' }}
              tickSize={10}
              interval={0}
              height={100}
              label={{
                value: 'Counties',
                position: 'insideBottom',
                offset: -10,
                fontSize: 14,
                fill: '#333',
              }}
            />
            <YAxis
              label={{
                value: 'Risk Score',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                fontSize: 14,
                fill: '#333',
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              layout="horizontal"
              wrapperStyle={{
                top: '10px',
                right: '10px',
              }}
            />
            <Bar
              dataKey="RISK_SCORE"
              fill="#f97316" // Orange color for the bars
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RiskBarChart;           
