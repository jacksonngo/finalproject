import { useEffect, useState } from 'react';
import { loadCSV } from '../Utils/parseCSV';
import Map from '../components/Map';
import BarChart from '../components/BarChart';
import SelectedBarChart from '../components/SelectedBarChart';

export default function HomePage() {
  const [data, setData] = useState([]);
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [colorBy, setColorBy] = useState('RISK_SCORE');
  const [selectedCounties, setSelectedCounties] = useState([]);
  const [viewMode, setViewMode] = useState('interactive'); // 'interactive' or 'top10'

  useEffect(() => {
    loadCSV().then(setData).catch(console.error);
  }, []);

  const handleCountyClick = (countyName) => {
    if (!countyName || viewMode !== 'interactive') return;

    setSelectedCounties(prev => {
      const updated = [...new Set([countyName, ...prev])]; // Ensure uniqueness
      return updated.slice(0, 15); // Limit to 15
    });
  };

  if (data.length === 0) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ backgroundColor: '#ADD8E6', padding: '10px', marginBottom: '20px' }}>
        <h1 style={{ textAlign: 'center', color: '#004080' }}>Texas County Risk Assessment</h1>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
        <label>
          Color map by:&nbsp;
          <select onChange={(e) => setColorBy(e.target.value)} value={colorBy}>
            <option value="RISK_SCORE">Risk Score</option>
            <option value="POPULATION">Population</option>
          </select>
        </label>

        <label>
          View mode:&nbsp;
          <select onChange={(e) => setViewMode(e.target.value)} value={viewMode}>
            <option value="interactive">Interactive</option>
            <option value="top10">Top 10</option>
          </select>
        </label>
      </div>

      {/* Main layout row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '20px' }}>
        <Map
          data={data}
          colorBy={colorBy}
          onCountyHover={setHoveredCounty}
          onCountyClick={handleCountyClick}
        />

        {viewMode === 'interactive' ? (
          <SelectedBarChart
            data={data}
            selected={selectedCounties}
            colorBy={colorBy}
            setSelected={setSelectedCounties}
          />
        ) : null}
      </div>

      {viewMode === 'top10' && (
        <div style={{ marginTop: '40px' }}>
          <BarChart data={data} colorBy={colorBy} />
        </div>
      )}
    </div>
  );
} 