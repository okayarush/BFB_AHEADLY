import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { MapContainer, TileLayer, GeoJSON, useMapEvents, Marker } from "react-leaflet";
import L from "leaflet";
import { FiTrash2, FiDroplet, FiAlertTriangle, FiAlertCircle, FiMapPin, FiCamera, FiArrowRight } from "react-icons/fi";
import { toast } from "react-hot-toast";

import { CommunitySanitationManager } from "../utils/CommunitySanitationManager";
import { CommunityIntelligenceManager } from "../utils/CommunityIntelligenceManager";
import { getSectorID } from "../utils/HospitalRegistry";
import "leaflet/dist/leaflet.css";
import CommunityLayout from "../components/layout/CommunityLayout";
import CommunityHeader from "../components/common/CommunityHeader";

const PORTAL_COLOR = '#00d4aa';
const CARTO_KEY = process.env.REACT_APP_CARTO_API_KEY || "cb1_3hlv_1_982b84f1e84c5c6d42d8bd17";


/* ===================== STYLES ===================== */

const PageContainer = styled.div`
  padding: 2rem 5%;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 70px);
  background-color: #0d0f14;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  display: flex;
  flex-direction: column;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  flex: 1;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const MapSection = styled.div`
  min-height: 500px;
  height: 100%;
  width: 100%;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
`;

const MapOverlayText = styled.div`
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: rgba(30, 33, 40, 0.8);
  backdrop-filter: blur(8px);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #e2e8f0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255,255,255,0.1);
`;

const FormSection = styled.div`
  flex: 1;
  background: rgba(30, 33, 40, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
`;

const Title = styled.h2`
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #94a3b8;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.4;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 800;
  color: #cbd5e1;
  font-size: 0.9rem;
`;

const Select = styled.select`
  padding: 1rem;
  border: 2px solid #1e2128;
  border-radius: 12px;
  font-size: 1rem;
  background: #111318;
  color: #e2e8f0;
  font-weight: 600;
  &:focus { outline: none; border-color: ${PORTAL_COLOR}; }
`;

const FileUploadBtn = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 1rem;
  background: #111318;
  border: 2px dashed #475569;
  border-radius: 12px;
  color: #94a3b8;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${PORTAL_COLOR};
    color: ${PORTAL_COLOR};
    background: rgba(0, 212, 170, 0.1);
  }
  
  input {
    display: none;
  }
`;

const LocationBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 1rem;
  background: ${props => props.$active ? 'rgba(0, 212, 170, 0.1)' : '#111318'};
  border: 2px solid ${props => props.$active ? PORTAL_COLOR : '#1e2128'};
  border-radius: 12px;
  color: ${props => props.$active ? '#ffffff' : '#94a3b8'};
  font-weight: 700;
`;

const SubmitButton = styled.button`
  background: ${PORTAL_COLOR};
  color: white;
  border: none;
  padding: 1.2rem;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  box-shadow: 0 4px 15px rgba(58,175,169,0.3);
  transition: transform 0.2s;

  &:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(58,175,169,0.4); }
`;

/* ===================== MAP LOGIC ===================== */

// Custom pin icon — avoids broken default Leaflet image paths in webpack
const pinIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:22px;height:22px;
    background:#ff4444;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:3px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,0.6);
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

// Simple ray-casting point-in-polygon (GeoJSON coords are [lng, lat])
function pointInRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function findWardName(lat, lng, wardsGeoJSON) {
  if (!wardsGeoJSON?.features) return null;
  for (const feature of wardsGeoJSON.features) {
    const { type, coordinates } = feature.geometry;
    const polygons = type === 'Polygon' ? [coordinates] : coordinates;
    for (const poly of polygons) {
      if (pointInRing(lng, lat, poly[0])) return feature.properties.Name;
    }
  }
  return null;
}

function LocationMarker({ position, wards, onMapClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const wardName = findWardName(lat, lng, wards);
      onMapClick(e.latlng, wardName);
    },
  });

  return position === null ? null : <Marker position={position} icon={pinIcon} />;
}

const CommunitySanitation = () => {
    const [wards, setWards] = useState(null);
    const [cityBoundary, setCityBoundary] = useState(null);
    const [activeSector, setActiveSector] = useState(null);
    
    // Form States
    const [formData, setFormData] = useState({
        sector: "",
        issue_type: "Uncollected Garbage",
        latitude: null,
        longitude: null,
        image: null
    });

    const solapurCenter = [17.6599, 75.9064];

    useEffect(() => {
        CommunitySanitationManager.initializeData();
        fetch("/solapur_wards.geojson").then(res => res.json()).then(setWards);
        fetch("/solapur_city_boundary.geojson").then(res => res.json()).then(setCityBoundary);
    }, []);

    const getWardStyle = (feature) => {
        return {
            fillColor: "#00d4aa",
            weight: 1,
            color: "#1e2128",
            fillOpacity: 0.2
        };
    };

    const handleMapClick = (latlng, wardName) => {
      const sectorId = getSectorID(wardName);
      setActiveSector(sectorId);
      setFormData(prev => ({
          ...prev,
          sector: sectorId,
          latitude: latlng.lat,
          longitude: latlng.lng
      }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.latitude) {
            toast.error("Please click on the map to pin a location.");
            return;
        }

        const newReport = {
            sector: formData.sector,
            issue_type: formData.issue_type,
            note: "Citizen mobile report",
            latitude: formData.latitude,
            longitude: formData.longitude,
            has_proof: !!formData.image
        };

        CommunitySanitationManager.addReport(newReport);
        CommunityIntelligenceManager.refresh(); // invalidate merged risk cache
        toast.success("Issue Reported Successfully!");

        setFormData({
            sector: "",
            issue_type: "Uncollected Garbage",
            latitude: null,
            longitude: null,
            image: null
        });
        setActiveSector(null);
    };

    return (
        <CommunityLayout>
          <PageContainer>
            <CommunityHeader 
              title="Report a Sanitation Issue"
              subtitle="Spotted garbage, stagnant water, or an open drain? Pin it on the map and we'll alert the municipal team. Takes 30 seconds."
              trustLine="🗂 147 issues reported this month · ⚡ Avg. municipal response: 48 hours"
            />
            <ContentGrid>
            <MapSection>
              <MapOverlayText>
                <FiMapPin color="#ff4444" /> Tap map to pin location
              </MapOverlayText>
              <MapContainer center={solapurCenter} zoom={13} style={{ height: "100%", width: "100%", background: "#0a0c10" }} zoomControl={false}>
                  <TileLayer
                    url={CARTO_KEY
                      ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`
                      : "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"}
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    maxZoom={16}
                  />
                  {cityBoundary && <GeoJSON data={cityBoundary} style={{ color: "#94a3b8", weight: 2, fill: false }} />}
                  {wards && <GeoJSON data={wards} style={getWardStyle} />}
                  <LocationMarker
                    position={formData.latitude ? { lat: formData.latitude, lng: formData.longitude } : null}
                    wards={wards}
                    onMapClick={handleMapClick}
                  />
              </MapContainer>
            </MapSection>

            <FormSection>
              <Title>Report Details</Title>
              <Subtitle>Help keep our city clean by providing accurate information.</Subtitle>
              
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label>What is the issue?</Label>
                    <Select
                        value={formData.issue_type}
                        onChange={e => setFormData({ ...formData, issue_type: e.target.value })}
                    >
                        <option>Uncollected Garbage</option>
                        <option>Open Drain / Sewage</option>
                        <option>Stagnant Water</option>
                        <option>Overflowing Public Bin</option>
                        <option>Broken Public Toilet</option>
                    </Select>
                </FormGroup>

                <FormGroup>
                    <Label>Location</Label>
                    <LocationBadge $active={!!formData.latitude}>
                      <FiMapPin size={20} />
                      {formData.sector ? `${formData.sector}` : "Tap on the map above"}
                    </LocationBadge>
                </FormGroup>

                <FormGroup>
                    <Label>Photo Evidence</Label>
                    <FileUploadBtn>
                      <FiCamera size={20} />
                      {formData.image ? "Photo Added" : "Take a Photo"}
                      <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} />
                    </FileUploadBtn>
                </FormGroup>

                <SubmitButton type="submit">Submit Report <FiArrowRight /></SubmitButton>
              </Form>
            </FormSection>
            </ContentGrid>
          </PageContainer>
        </CommunityLayout>
    );
};

export default CommunitySanitation;
