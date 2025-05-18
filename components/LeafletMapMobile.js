// LeafletMapMobile.js
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { useAppContext } from "../contexts/AppContext";

const customIcon = L.icon({
  iconUrl: "/pin.png",
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -40],
});

let clickedOnFeature = false;

function ZoomToPass({ selectedPass, autoZoom, isMobile }) {
  const map = useMap();
  useEffect(() => {
    if (selectedPass && selectedPass.marker_lat && selectedPass.marker_lng && autoZoom) {
      const zoomLevel = isMobile ? 10 : 14;
      map.setView([selectedPass.marker_lat, selectedPass.marker_lng], zoomLevel);
    }
  }, [selectedPass, autoZoom, map, isMobile]);
  return null;
}

function DeselectOnMapClick({ setSelectedPass, overlayOpen }) {
  useMapEvents({
    click: () => {
      if (overlayOpen) return;
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === 'INPUT' || active.closest('.village-search-container'))
      ) return;
      if (!clickedOnFeature && setSelectedPass) {
        setSelectedPass(null);
      }
      clickedOnFeature = false;
    },
  });
  return null;
}

function ExposeMapRef() {
  const map = useMap();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.leafletMapRef = map;
    }
  }, [map]);
  return null;
}

export default function LeafletMap({ passes, selectedPass, autoZoom, setSelectedPass, darkMode, isMobile, overlayOpen }) {
  return (
    <>
      <MapContainer
        center={[47.0, 8.0]}
        zoom={isMobile ? 7 : 8}
        scrollWheelZoom={!overlayOpen}
        zoomControl={false}
        style={{ height: "100%", width: "100%", pointerEvents: overlayOpen ? "none" : "auto" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {selectedPass && selectedPass.marker_lat && selectedPass.marker_lng && (
          <Marker key={selectedPass.id} position={[selectedPass.marker_lat, selectedPass.marker_lng]} icon={customIcon}>
            <Tooltip direction="top" offset={[0, -10]} permanent>{selectedPass.name}</Tooltip>
          </Marker>
        )}

        {passes.map((pass) => (
          pass.coords && pass.coords.length > 1 && (
            <Polyline
              key={pass.id + "_line"}
              positions={Array.isArray(pass.coords) ? pass.coords : []}
              pathOptions={{
                color:
                  (pass.status || 'open') === "open" ? "green" :
                  pass.status === "closed" ? "red" :
                  pass.type === "transit" ? "gold" :
                  pass.type === "road" ? "blue" :
                  pass.type === "scenic" ? "orange" :
                  "gray",
                weight: 8,
              }}
              eventHandlers={{
                click: () => {
                  if (overlayOpen) return;
                  clickedOnFeature = true;
                  const found = passes.find(p => p.id === pass.id || p.name === pass.name);
                  if (found && setSelectedPass) setSelectedPass(found);
                }
              }}
            />
          )
        ))}

        <ZoomToPass selectedPass={selectedPass} autoZoom={autoZoom} isMobile={isMobile} />
        <DeselectOnMapClick setSelectedPass={setSelectedPass} overlayOpen={overlayOpen} />
        <ExposeMapRef />
      </MapContainer>
    </>
  );
}