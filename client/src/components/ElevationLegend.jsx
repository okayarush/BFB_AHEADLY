import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const ElevationLegend = ({ active }) => {
  const map = useMap();

  useEffect(() => {
    if (!active) return;

    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.backgroundColor = 'white';
      div.style.padding = '10px';
      div.style.border = '2px solid grey';
      div.style.opacity = '0.9';
      div.style.fontSize = '12px';
      div.style.maxWidth = '200px';
      div.style.borderRadius = '5px';
      div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';

      div.innerHTML = `
        <b style="font-size: 14px;">Elevation Legend</b><br><br>
        <div style="
          height: 20px;
          background: linear-gradient(90deg, #0000ff, #00ffff, #00ff00, #ffff00, #ffa500, #ff0000);
          border-radius: 4px;
          margin-bottom: 8px;
          border: 1px solid #ccc;
        "></div>
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #666; margin-bottom: 8px;">
          <span>0-15m (Low)</span>
          <span>15-85m (High)</span>
        </div>
        <div style="font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 6px;">
          Blue: Low areas, Red: High areas<br>
          Source: NASA SRTM
        </div>
      `;
      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map, active]);

  return null;
};

export default ElevationLegend;