import React, { useEffect, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography
} from 'react-simple-maps';
import { feature } from 'topojson-client';
import * as d3 from 'd3';

const geoUrl = '/data/counties-10m.json';

const Map = ({ data, colorBy = 'RISK_SCORE', onCountyHover, onCountyClick, viewMode }) => {
  const [geographies, setGeographies] = useState([]);
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [lastActiveCounty, setLastActiveCounty] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [tooltipColor, setTooltipColor] = useState('rgba(0, 102, 204, 0.6)');
  const [tooltipTextColor, setTooltipTextColor] = useState('#000000');

  useEffect(() => {
    fetch(geoUrl)
      .then(res => res.json())
      .then(usTopo => {
        const counties = feature(usTopo, usTopo.objects.counties).features;
        const texasCounties = counties.filter(d => d.id.startsWith('48'));
        setGeographies(texasCounties);
      });
  }, []);

  useEffect(() => {
    if (data.length > 0 && !lastActiveCounty) {
      const first = data[0];
      setLastActiveCounty({
        name: first.COUNTY?.toUpperCase(),
        value: first[colorBy]?.toFixed(2)
      });
    }
  }, [data, colorBy, lastActiveCounty]);

  const valueMap = {};
  data.forEach(d => {
    valueMap[d.COUNTY?.toUpperCase()] = d[colorBy];
  });

  const colorScale = d3.scaleSequential()
    .domain([0, 100])
    .interpolator(d3.interpolateBlues);

  const calculateLuminance = (color) => {
    const d3Color = d3.color(color);
    if (!d3Color) return 0;
    const rgb = d3Color.rgb();
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const handleMouseMove = (event) => {
    const padding = 10;
    const tooltipWidth = 200;
    const tooltipHeight = 60;
    const x = Math.min(event.clientX + padding, window.innerWidth - tooltipWidth);
    const y = Math.min(event.clientY + padding, window.innerHeight - tooltipHeight);
    setCursorPosition({ x, y });
  };

  return (
    <div style={{
      display: 'flex',
      position: 'relative',
      justifyContent: viewMode === 'top10' ? 'center' : 'flex-start',
      overflow: 'hidden',
      maxWidth: '100%'
    }}>
      {/* Map Container */}
      <div style={{
        padding: '20px',
        borderRadius: '10px',
        backgroundColor: 'rgba(128, 128, 128, 0.2)',
        flex: '1 1 auto',
        width: viewMode === 'top10' ? '80%' : '100%',
        margin: viewMode === 'top10' ? '0 auto' : '0',
        overflow: 'hidden'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontWeight: 'bold',
          textDecoration: 'underline'
        }}>
          Texas Counties Heatmap ({colorBy})
        </h2>

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [-99.5, 31.0], scale: 3000 }}
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
                const luminance = calculateLuminance(countyColor);
                const textColor = luminance < 0.5 ? '#FFFFFF' : '#000000';

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={countyColor}
                    stroke="#FFF"
                    onMouseEnter={() => {
                      setHoveredCounty({ name: countyName, value: roundedValue });
                      setTooltipColor(countyColor);
                      setTooltipTextColor(textColor);
                      setLastActiveCounty({ name: countyName, value: roundedValue });
                      onCountyHover?.(countyName);
                    }}
                    onMouseLeave={() => {
                      setHoveredCounty(null);
                      setTooltipColor('rgba(0, 102, 204, 0.6)');
                      setTooltipTextColor('#000000');
                      onCountyHover?.(null);
                    }}
                    onMouseMove={handleMouseMove}
                    onClick={() => onCountyClick?.(countyName)}
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

        {/* Legend */}
        <div style={{
          marginTop: '40px', // Increased the top margin
          marginLeft: '30px', // Added left margin
          marginRight: '50px', // Added right margin
          display: 'flex',
          alignItems: 'center',
          maxWidth: '100%'
        }}>
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

      {/* Sidebar Info Panel */}
      <div style={{
        width: '350px', // Increased the width to allow more space
        padding: '20px',
        borderLeft: '1px solid #ddd',
        overflow: 'hidden', // Prevents the sidebar from resizing
        maxHeight: '500px', // Increased height for more room
        boxSizing: 'border-box',
        overflowY: 'auto' // Allows scrolling if content exceeds the box height
      }}>
        {lastActiveCounty && (
          <div style={{
            backgroundColor: 'rgba(240, 240, 240, 0.9)',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            fontWeight: 'bold',
            maxWidth: '100%' // Ensure the content does not exceed the container's width
          }}>
            <div style={{
              backgroundColor: tooltipColor,
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '10px',
              fontSize: '22px',
              color: tooltipTextColor,
            }}>
              County: {lastActiveCounty.name}
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 165, 0, 0.6)',
              padding: '10px',
              borderRadius: '5px',
              fontSize: '18px',
            }}>
              {colorBy === 'RISK_SCORE'
                ? `Risk Score: ${lastActiveCounty.value}`
                : `Value: ${Number(lastActiveCounty.value).toLocaleString()}`}
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {hoveredCounty && (
        <div
          style={{
            position: 'absolute',
            top: cursorPosition.y,
            left: cursorPosition.x,
            backgroundColor: tooltipColor,
            color: tooltipTextColor,
            padding: '8px',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            zIndex: 10,
            maxWidth: '220px',
            wordWrap: 'break-word'
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



