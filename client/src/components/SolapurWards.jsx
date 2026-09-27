import React, { useState, useEffect } from 'react';
import { GeoJSON } from 'react-leaflet';
import BoundaryService from '../services/boundaryService';

/**
 * Component for rendering Solapur Ward boundaries
 * Allows selection of wards for analysis
 */
const SolapurWards = ({ onWardSelect, selectedWardId }) => {
    const [wardData, setWardData] = useState(null);
    const [hoveredWardId, setHoveredWardId] = useState(null);

    useEffect(() => {
        const loadWards = async () => {
            try {
                const data = await BoundaryService.loadWardData();
                setWardData(data);
            } catch (err) {
                console.error('Failed to load Solapur wards:', err);
            }
        };

        loadWards();
    }, []);

    if (!wardData) return null;

    const onEachWard = (feature, layer) => {
        // Unique ID for the ward (using Name or an index-based logic if needed)
        const wardId = feature.properties?.Name || Math.random().toString();

        // Setup style
        layer.setStyle(getStyle(wardId === selectedWardId, wardId === hoveredWardId));

        layer.on({
            mouseover: () => setHoveredWardId(wardId),
            mouseout: () => setHoveredWardId(null),
            click: () => {
                if (onWardSelect) {
                    onWardSelect(feature);
                }
            }
        });

        // Add tooltip/popup
        if (feature.properties?.Name) {
            layer.bindTooltip(feature.properties.Name, {
                permanent: false,
                direction: "center",
                className: "ward-label"
            });
        }
    };

    const getStyle = (isSelected, isHovered) => {
        return {
            color: isSelected ? "#FCD34D" : isHovered ? "#60A5FA" : "rgba(255, 255, 255, 0.2)",
            weight: isSelected ? 2 : isHovered ? 2 : 1,
            opacity: 1,
            fillColor: isSelected ? "#FCD34D" : isHovered ? "#60A5FA" : "transparent",
            fillOpacity: isSelected ? 0.2 : isHovered ? 0.1 : 0,
            dashArray: isSelected || isHovered ? null : "5, 5",
        };
    };

    // We render a new GeoJSON layer when selection changes to force style update
    // Keying by selected/hovered state is a bit heavy but ensures clean updates without deep prop drilling in Leaflet
    return (
        <GeoJSON
            key={`wards-${selectedWardId}-${hoveredWardId}`}
            data={wardData}
            onEachFeature={onEachWard}
        />
    );
};

export default SolapurWards;
