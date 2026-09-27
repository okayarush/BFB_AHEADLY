import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const LSTLegend = ({ active }) => {
  const map = useMap();
  const [lstData, setLstData] = useState(null);

  useEffect(() => {
    // Fetch LST metadata when component mounts
    fetch('/data/dhaka_lst_metadata.json')
      .then((response) => response.json())
      .then((data) => {
        setLstData(data);
      })
      .catch((error) => {
        console.error('Error fetching LST metadata:', error);
      });
  }, []);

  useEffect(() => {
    if (!active || !lstData) return;

    const legend = L.control({ position: 'topright' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.backgroundColor = 'white';
      div.style.padding = '10px';
      div.style.border = '2px solid grey';
      div.style.opacity = '0.9';
      div.style.fontSize = '12px';
      div.style.maxWidth = '250px';
      div.style.borderRadius = '5px';
      div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';

      let legendHTML = '<b style="font-size: 14px;">Land Surface Temperature</b><br><br>';
      
      // Add temperature ranges with colors
      if (lstData.color_legend && lstData.color_legend.temperature_ranges) {
        lstData.color_legend.temperature_ranges.forEach((range) => {
          legendHTML += `
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <div style="
                background: ${range.color}; 
                width: 18px; 
                height: 12px; 
                margin-right: 8px; 
                border: 1px solid #ccc;
                border-radius: 2px;
              "></div>
              <span style="font-size: 11px; line-height: 1.2;">
                <strong>${range.range_celsius}</strong>
              </span>
            </div>
          `;
        });
      }

      // Add data source information
      legendHTML += `
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd;">
          <span style="font-size: 10px; color: #666;">
            Source: ${lstData.data_source?.satellite || 'ECOSTRESS/MODIS'}<br>
            Colormap: ${lstData.processing_info?.colormap || 'Inferno'}
          </span>
        </div>
      `;

      div.innerHTML = legendHTML;
      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map, active, lstData]);

  return null;
};

export default LSTLegend;