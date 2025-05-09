import { useEffect, useState } from 'react';
import { loadCSV } from '../Utils/parseCSV';
import Map from '../components/Map';
import BarChart from '../components/BarChart'; // Assuming you have the BarChart component

export default function HomePage() {
  const [data, setData] = useState([]);
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [colorBy, setColorBy] = useState('RISK_SCORE');

  useEffect(() => {
    loadCSV().then(setData).catch(console.error);
  }, []);

  if (data.length === 0) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ backgroundColor: '#ADD8E6', padding: '10px', marginBottom: '20px' }}>
        <h1 style={{ textAlign: 'center', color: '#004080' }}>Texas County Risk Assessment</h1>
      </div>

      <label>
        Color map by:&nbsp;
        <select onChange={(e) => setColorBy(e.target.value)} value={colorBy}>
          <option value="RISK_SCORE">Risk Score</option>
          <option value="POPULATION">Population</option>
        </select>
      </label>

      {/* Map component */}
      <Map
        data={data}
        colorBy={colorBy}
        onCountyHover={(name) => setHoveredCounty(name)}
      />

      {/* Bar Chart component */}
      <div style={{ marginTop: '40px' }}>
        <BarChart data={data} colorBy={colorBy} />
      </div>
    </div>
  );
}

