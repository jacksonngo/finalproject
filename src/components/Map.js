import React, { useEffect, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography
} from 'react-simple-maps';
import { feature } from 'topojson-client';
import * as d3 from 'd3';

const geoUrl = '/data/counties-10m.json'; // Make sure this exists and is correct

const Map = ({ data, colorBy = 'RISK_SCORE', onCountyHover }) => {
  const [geographies, setGeographies] = useState([]);
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [tooltipColor, setTooltipColor] = useState('rgba(0, 102, 204, 0.6)'); // Default blue color
  const [tooltipTextColor, setTooltipTextColor] = useState('#000000'); // Default text color (black)

  useEffect(() => {
    fetch(geoUrl)
      .then(res => res.json())
      .then(usTopo => {
        const counties = feature(usTopo, usTopo.objects.counties).features;
        const texasCounties = counties.filter(d => d.id.startsWith('48')); // Texas FIPS: 48
        setGeographies(texasCounties);
      });
  }, []);

  const valueMap = {};
  data.forEach(d => {
    valueMap[d.COUNTY?.toUpperCase()] = d[colorBy];
  });

  const values = data.map(d => d[colorBy]).filter(v => !isNaN(v));
  const colorScale = d3.scaleSequential()
    .domain([0, 100]) // Fixed to range from 0 to 100
    .interpolator(d3.interpolateBlues);

  // Function to calculate luminance of a color
  const calculateLuminance = (color) => {
    const d3Color = d3.color(color);
    if (!d3Color) return 0;
    const rgb = d3Color.rgb();
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    // Use the luminance formula
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const handleMouseMove = (event) => {
    setCursorPosition({ x: event.clientX + 10, y: event.clientY + 10 });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: 'auto', display: 'flex', justifyContent: 'space-between' }}>
      {/* Background container with opaque grey */}
      <div
        style={{
          backgroundColor: 'rgba(128, 128, 128, 0.2)',
          padding: '20px',
          borderRadius: '10px',
          flex: 1
        }}
      >
        {/* Title */}
        <h2 style={{
          textAlign: 'center',
          fontWeight: 'bold',
          textDecoration: 'underline'
        }}>
          Texas Counties Heatmap ({colorBy})
        </h2>

        {/* Heatmap Map Section */}
        <div style={{ flex: 1, paddingRight: '20px' }}>
          <div style={{ overflow: 'hidden' }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                center: [-99.5, 31.0],
                scale: 3000
              }}
              width={1000}
              height={800}
            >
              <Geographies geography={{ type: 'FeatureCollection', features: geographies }}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const countyName = geo.properties.name?.toUpperCase();
                    const value = valueMap[countyName];
                    const roundedValue = value ? value.toFixed(2) : null;
                    const countyColor = value ? colorScale(value) : '#EEE';

                    // Calculate luminance to adjust text color based on brightness
                    const luminance = calculateLuminance(countyColor);
                    const textColor = luminance < 0.5 ? '#FFFFFF' : '#000000'; // White text for dark counties, black for light ones

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={countyColor}
                        stroke="#FFF"
                        onMouseEnter={() => {
                          setHoveredCounty({ name: countyName, value: roundedValue });
                          setTooltipColor(countyColor); // Set tooltip color based on the county color
                          setTooltipTextColor(textColor); // Set tooltip text color based on luminance
                          onCountyHover?.(countyName);
                        }}
                        onMouseLeave={() => {
                          setHoveredCounty(null);
                          setTooltipColor('rgba(0, 102, 204, 0.6)'); // Reset tooltip color when not hovering
                          setTooltipTextColor('#000000'); // Reset text color to black
                          onCountyHover?.(null);
                        }}
                        onMouseMove={handleMouseMove}  // Update cursor position
                        style={{
                          default: { outline: 'none' },
                          hover: { fill: '#2a9df4', outline: 'none' },
                          pressed: { outline: 'none' }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>

          {/* Legend below the map */}
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 8 }}>0</span>
            <div style={{
              flex: 1,
              height: '20px',
              background: `linear-gradient(to right, ${[...Array(11).keys()]
                .map(i => colorScale(i * 10))
                .join(', ')})`,
              border: '1px solid #aaa'
            }} />
            <span style={{ marginLeft: 8 }}>100</span>
          </div>
        </div>
      </div>

      {/* Hover Data Section */}
      <div style={{ width: '300px', padding: '20px', borderLeft: '1px solid #ddd' }}>
        {hoveredCounty && (
          <div style={{
            backgroundColor: 'rgba(240, 240, 240, 0.9)',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            fontWeight: 'bold'
          }}>
            {/* County Name */}
            <div style={{
              backgroundColor: 'rgba(0, 102, 204, 0.6)',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '10px',
              fontSize: '22px'
            }}>
              County: {hoveredCounty.name}
            </div>

            {/* Risk Score */}
            <div style={{
              backgroundColor: 'rgba(255, 165, 0, 0.6)',
              padding: '10px',
              borderRadius: '5px',
              fontSize: '18px'
            }}>
              {colorBy === 'RISK_SCORE'
                ? `Risk Score: ${hoveredCounty.value}`
                : `Value: ${hoveredCounty.value?.toLocaleString()}`}
            </div>
          </div>
        )}
      </div>

      {/* Tooltip next to cursor */}
      {hoveredCounty && (
        <div
          style={{
            position: 'absolute',
            top: cursorPosition.y,
            left: cursorPosition.x,
            backgroundColor: tooltipColor,  // Set the tooltip background to county color
            color: tooltipTextColor, // Text color based on luminance
            padding: '8px',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: 'bold',
            pointerEvents: 'none',  // Prevent the tooltip from interfering with map interaction
            zIndex: 10
          }}
        >
          <div>County: {hoveredCounty.name}</div>
          <div>Risk Score: {hoveredCounty.value}</div>
        </div>
      )}
    </div>
  );
};

export default Map;















