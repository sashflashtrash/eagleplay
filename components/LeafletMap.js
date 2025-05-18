// LeafletMap.js
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

function ZoomToPass({ selectedPass, autoZoom }) {
  const map = useMap();
  useEffect(() => {
    if (selectedPass && selectedPass.coords && selectedPass.coords.length > 1 && autoZoom) {
      // Konvertiere ggf. Objekt-Format in [lat, lng]
      const latlngs = selectedPass.coords.map(coord =>
        Array.isArray(coord) ? coord : [coord.lat, coord.lng]
      );
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [selectedPass, autoZoom, map]);
  return null;
}

function DeselectOnMapClick({ setSelectedPass }) {
  useMapEvents({
    click: () => {
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

function VillageSearchZoom({ query, onSelect }) {
  const map = useMap();
  useEffect(() => {
    if (query && typeof query === 'object' && query.lat && query.lon) {
      map.setView([parseFloat(query.lat), parseFloat(query.lon)], 14);
      if (onSelect) onSelect(query);
    }
  }, [query, map, onSelect]);
  return null;
}

let debounceTimer;
let currentController;

export default function LeafletMap({ passes, selectedPass, autoZoom, centerOffset, setSelectedPass, darkMode }) {
  const [villageQuery, setVillageQuery] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { language } = useAppContext();
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem("recentVillageSearches");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load recent searches from localStorage", e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("recentVillageSearches", JSON.stringify(recentSearches));
    } catch (e) {
      console.error("Failed to save recent searches to localStorage", e);
    }
  }, [recentSearches]);

  const updateRecentSearches = (newSearch) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.display_name !== newSearch.display_name);
      const updated = [newSearch, ...filtered].slice(0, 5);
      return updated;
    });
  };

const formatDisplayName = (raw) => {
  if (!raw || typeof raw !== 'string') return raw;
  const parts = raw.split(',').map(p => p.trim());

  // Entferne Regionsnamen (zweite Position) und PLZ (rein numerisch)
  const filtered = parts.filter((part, idx, arr) => {
    const isRegion = idx === 1 && arr.length >= 4;
    const isPostalCode = /^\d{4,6}$/.test(part);
    return !isRegion && !isPostalCode;
  });

  return filtered.join(", ");
};

  return (
    <>
      <div className="village-search-container" style={{
        position: "absolute",
        top: "70px",
        right: "240px",
        zIndex: 1001,
        pointerEvents: "auto",
        backgroundColor: darkMode ? "#111" : "#fff",
        padding: "6px 8px",
        borderRadius: "6px",
        boxShadow: darkMode ? "0 1px 5px rgba(255,255,255,0.15)" : "0 1px 5px rgba(0,0,0,0.3)",
        fontSize: "14px",
        color: darkMode ? "#fff" : "#000",
        border: darkMode ? "1px solid #444" : "1px solid #ccc",
        width: "220px"
      }}>
        <div style={{ position: 'relative' }}>
          <input
            className="village-search-input"
            onFocus={() => setInputFocused(true)}
            onBlur={() => setTimeout(() => setInputFocused(false), 200)}
            type="text"
            value={typeof villageQuery === 'string' ? villageQuery : villageQuery.display_name || ""}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && suggestions.length > 0) {
                const selected = suggestions[0];
                setVillageQuery(selected);
                setSuggestions([]);
                updateRecentSearches(selected);
              }
            }}
            onChange={(e) => {
              const value = e.target.value;
              setVillageQuery(value);
              if (value.length > 2) {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                  if (currentController) currentController.abort();
                  currentController = new AbortController();
                  (async () => {
                    try {
                      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=ch,de,fr,it,at,li,lu&q=${encodeURIComponent(value)}`, { signal: currentController.signal });
                      const results = await res.json();
                      setSuggestions(results.slice(0, 5));
                    } catch (err) {
                    if (err.name === 'AbortError') return;
                    console.error("Geocoding failed", err);
                      setSuggestions([]);
                    }
                  })();
                }, 400);
              } else {
                setSuggestions([]);
              }
            }}
            placeholder={{
              DE: "Ortschaft suchen...",
              EN: "Search village...",
              FR: "Rechercher localité...",
              IT: "Cerca località..."
            }[language || 'DE']}
            style={{
              width: "100%",
              padding: "4px 28px 4px 4px",
              border: darkMode ? "1px solid #555" : "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor: darkMode ? "#000" : "#fff",
              color: darkMode ? "#fff" : "#000",
              outline: "none"
            }}
          />
          {(villageQuery && typeof villageQuery === 'string') ? (
            <span
              onClick={() => {
                setVillageQuery("");
                setSuggestions([]);
              }}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontWeight: "bold",
                color: darkMode ? "#aaa" : "#555"
              }}
            >
              ×
            </span>
          ) : null}
        </div>
        {inputFocused && suggestions.length > 0 && (
          <ul style={{
            marginTop: "4px",
            backgroundColor: darkMode ? '#111' : '#fff',
            color: darkMode ? '#fff' : '#000',
            listStyle: 'none',
            margin: 0,
            padding: '4px 0',
            border: darkMode ? '1px solid #444' : '1px solid #ccc',
            maxHeight: '150px',
            overflowY: 'auto',
            zIndex: 1002,
            borderRadius: '4px',
            pointerEvents: 'auto'
          }}>
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => {
                  setVillageQuery(s);
                  setSuggestions([]);
                  updateRecentSearches(s);
                }}
                style={{
                  padding: '6px 10px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {formatDisplayName(s.display_name)}
              </li>
            ))}
          </ul>
        )}
        {inputFocused && suggestions.length === 0 && recentSearches.length > 0 && (
          <div style={{ marginTop: "8px", fontSize: "13px", opacity: 0.7 }}>
            {{
              DE: "Letzte Suchen:",
              EN: "Recent searches:",
              FR: "Recherches récentes:",
              IT: "Ricerche recenti:"
            }[language || 'DE']}
            <ul style={{ listStyle: "none", padding: 0, marginTop: 4 }}>
              {recentSearches.map((item, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px' }}>
                  <span style={{ cursor: 'pointer', flex: 1 }} onClick={async () => {
                    try {
                      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=ch,de,fr,it,at,li,es,nl,be,lu&q=${encodeURIComponent(item.display_name)}`);
                      const results = await res.json();
                      if (results.length > 0) {
                        setVillageQuery(results[0]);
                        setSuggestions([]);
                        updateRecentSearches(results[0]);
                      }
                    } catch (err) {
                      console.error("Geocoding failed", err);
                    }
                  }}>{formatDisplayName(item.display_name)}</span>
                  <span style={{ cursor: 'pointer', marginLeft: '8px', color: darkMode ? '#aaa' : '#555' }} onClick={() => {
                    setRecentSearches(recentSearches.filter((_, idx) => idx !== i));
                  }}>×</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <MapContainer
        center={[47.0, 8.0]}
        zoom={8}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
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
                  clickedOnFeature = true;
                  const found = passes.find(p => p.id === pass.id || p.name === pass.name);
                  if (found && setSelectedPass) setSelectedPass(found);
                }
              }}
            />
          )
        ))}

        <ZoomToPass selectedPass={selectedPass} autoZoom={autoZoom} centerOffset={centerOffset} />
        <DeselectOnMapClick setSelectedPass={setSelectedPass} />
        <VillageSearchZoom query={typeof villageQuery === 'object' ? villageQuery : null} onSelect={(selected) => {
          if (selected) updateRecentSearches(selected);
          setVillageQuery(selected.display_name);
        }} />
      </MapContainer>
    </>
  );
}
