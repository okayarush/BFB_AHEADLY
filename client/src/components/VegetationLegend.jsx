import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const VegetationLegend = ({ active }) => {
  const map = useMap();

  useEffect(() => {
    if (!active) return;

    const legend = L.control({ position: 'topright' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.backgroundColor = 'white';
      div.style.padding = '10px';
      div.style.border = '2px solid grey';
      div.style.opacity = '0.9';
      div.style.fontSize = '14px';
      div.innerHTML = `
        <b>Land Cover</b><br>
        <i style="background:skyblue; width:15px; height:15px; float:left; margin-right:8px;"></i> Water/River<br>
        <i style="background:red; width:15px; height:15px; float:left; margin-right:8px;"></i> Built-up<br>
        <i style="background:tan; width:15px; height:15px; float:left; margin-right:8px;"></i> Barren<br>
        <i style="background:green; width:15px; height:15px; float:left; margin-right:8px;"></i> Vegetation<br>
        <i style="background:darkgreen; width:15px; height:15px; float:left; margin-right:8px;"></i> Forest
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

export default VegetationLegend;
