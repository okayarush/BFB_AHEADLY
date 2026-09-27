import React, { useState, useEffect } from 'react';
import { GeoJSON } from 'react-leaflet';
import BoundaryService from '../services/boundaryService';

/**
 * Reusable component for rendering Solapur boundary with red glow effect
 * This component handles loading, error states, and provides consistent styling
 */
const SolapurBoundary = ({
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
                console.error('Failed to load Solapur boundary:', err);
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
        console.warn('SolapurBoundary: Error loading boundary data:', error);
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
            interactive={false} // Disable pointer events completely
            style={style ? () => style : () => BoundaryService.getBoundaryStyle('main')}
        />
    );

    return <>{layers}</>;
};

export default SolapurBoundary;
