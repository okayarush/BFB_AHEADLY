import React, { useState, useEffect } from 'react';
import { GeoJSON } from 'react-leaflet';
import BoundaryService from '../services/boundaryService';

/**
 * Reusable component for rendering Dhaka boundary with red glow effect
 * This component handles loading, error states, and provides consistent styling
 */
const DhakaBoundary = ({
    showGlow = true,
    onLoad = null,
    onError = null,
    style = null
}) => {
    const [boundaryData, setBoundaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadBoundary = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await BoundaryService.loadBoundaryData();
                setBoundaryData(data);

                if (onLoad) {
                    onLoad(data);
                }
            } catch (err) {
                console.error('Failed to load Dhaka boundary:', err);
                setError(err.message);

                if (onError) {
                    onError(err);
                }
            } finally {
                setLoading(false);
            }
        };

        loadBoundary();
    }, [onLoad, onError]);

    if (loading || !boundaryData) {
        return null;
    }

    if (error) {
        console.warn('DhakaBoundary: Error loading boundary data:', error);
        return null;
    }

    const layers = [];

    // Add glow effect layers if requested
    if (showGlow) {
        // Outer glow layer
        layers.push(
            <GeoJSON
                key="boundary-glow-outer"
                data={boundaryData}
                style={() => BoundaryService.getBoundaryStyle('glow-outer')}
            />
        );

        // Middle glow layer
        layers.push(
            <GeoJSON
                key="boundary-glow-middle"
                data={boundaryData}
                style={() => BoundaryService.getBoundaryStyle('glow-middle')}
            />
        );
    }

    // Main boundary layer
    layers.push(
        <GeoJSON
            key="boundary-main"
            data={boundaryData}
            style={style ? () => style : () => BoundaryService.getBoundaryStyle('main')}
            onEachFeature={(feature, layer) => {
                // Add popup with boundary name if available
                if (feature.properties && feature.properties.shapeName) {
                    layer.bindPopup(
                        `<div style="font-weight: 800; color: #fff; background: #0f172a; padding: 10px 14px; border-radius: 8px; border: 1px solid #DC143C; font-size: 0.85rem; font-family: 'Inter', sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                            ${feature.properties.shapeName}
                        </div>`,
                        {
                            className: 'custom-dhaka-popup',
                            offset: [0, -10]
                        }
                    );
                }

                // Add hover effect
                // layer.on({
                //     mouseover: function (e) {
                //         const layer = e.target;
                //         layer.setStyle({
                //             weight: showGlow ? 5 : 6, // Slightly thicker on hover
                //             opacity: 1,
                //             fillOpacity: 0 // Keep fill completely transparent even on hover
                //         });
                //     },
                //     mouseout: function (e) {
                //         const layer = e.target;
                //         // Reset to original style
                //         const originalStyle = style ? style : BoundaryService.getBoundaryStyle('main');
                //         layer.setStyle(originalStyle);
                //     }
                // });
            }}
        />
    );

    return <>{layers}</>;
};

export default DhakaBoundary;