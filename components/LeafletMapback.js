// Leafletmapback ohne Passliste (erweitert für selectedPassId + Name)
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { MapContainer, TileLayer, Marker, Polyline, Circle, FeatureGroup, useMap, useMapEvents } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { supabase } from '@/lib/supabaseClient';

function SearchControl() {
  const map = useMap();
  useEffect(() => {
    const searchControl = L.control({ position: 'topright' });
    searchControl.onAdd = function () {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
      div.style.backgroundColor = 'white';
      div.style.padding = '6px';
      div.innerHTML = '<input id="searchbox" type="text" placeholder="📍 Ort suchen..." style="width: 120px; padding: 2px;" />';
      L.DomEvent.disableClickPropagation(div);
      setTimeout(() => {
        const input = document.getElementById('searchbox');
        if (input) {
          input.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
              const query = input.value;
              if (!query) return;
              const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
              const response = await fetch(url);
              const data = await response.json();
              if (data && data.length > 0) {
                const { lat, lon } = data[0];
                map.setView([parseFloat(lat), parseFloat(lon)], 13);
              } else {
                alert('Ort nicht gefunden.');
              }
            }
          });
        }
      }, 100);
      return div;
    };
    searchControl.addTo(map);
  }, [map]);
  return null;
}

function RoutePlanner({ onRouteReady }) {
  const map = useMap();
  const [points, setPoints] = useState([]);

  useEffect(() => {
    window.setCoordsFromAlt = onRouteReady;
    window.setRoutingPoints = (newPts) => setPoints([...newPts]);
    window.getRoutingPoints = () => [...points];
  }, [points, onRouteReady]);

  useMapEvents({
    click(e) {
      const current = window.getRoutingPoints?.() || [];
      const updated = [...current, e.latlng];
      setPoints(updated);
    }
  });

  useEffect(() => {
    if (points.length >= 2) {
      const coordsQuery = points.map(p => `${p.lng},${p.lat}`).join(';');
      fetch(`https://router.project-osrm.org/route/v1/driving/${coordsQuery}?overview=full&geometries=geojson`)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
            onRouteReady(coords);
          }
        })
        .catch(() => {
          alert("Routing fehlgeschlagen");
        });
    } else {
      onRouteReady([]);
    }
  }, [points]);

  return null;
}

export default function LeafletMapBack({ selectedPassId, selectedPassName }) {
  const [marker, setMarker] = useState(null);
  const [coords, setCoords] = useState([]);
  const [circle, setCircle] = useState(null);
  const [routingMode, setRoutingMode] = useState(false);
  const drawRef = useRef();
  const mapRef = useRef();
  const router = useRouter();

  const fetchDetails = async (id) => {
    const { data } = await supabase
      .from('passes')
      .select('marker_lat, marker_lng, coords, circle_center_lat, circle_center_lng, circle_radius')
      .eq('id', id)
      .single();

    if (data) {
      const m = data.marker_lat && data.marker_lng ? { lat: data.marker_lat, lng: data.marker_lng } : null;
      const rawCoords = Array.isArray(data.coords) ? data.coords : [];
      const c = rawCoords.map(c => ({ lat: c[0], lng: c[1] }));
      const ci = data.circle_center_lat && data.circle_center_lng && data.circle_radius
        ? { center: { lat: data.circle_center_lat, lng: data.circle_center_lng }, radius: data.circle_radius }
        : null;

      setMarker(m);
      setCoords(c);
      setCircle(ci);

      const group = drawRef.current;
      if (group) {
        group.clearLayers();
        if (m) group.addLayer(L.marker([m.lat, m.lng]));
        if (c.length > 1) group.addLayer(L.polyline(c.map(pt => [pt.lat, pt.lng]), { color: 'blue' }));
        if (ci) group.addLayer(L.circle(ci.center, { radius: ci.radius, color: 'red' }));
      }

      if (!m && c.length === 0 && !ci && selectedPassName) {
        const input = document.getElementById('searchbox');
        if (input) {
          input.value = selectedPassName;
          const event = new KeyboardEvent('keydown', { key: 'Enter' });
          input.dispatchEvent(event);
        }
      }
    }
  };

  useEffect(() => {
    if (selectedPassId) fetchDetails(selectedPassId);
  }, [selectedPassId]);

  const handleCreated = (e) => {
    const layer = e.layer;
    if (layer instanceof L.Marker) setMarker(layer.getLatLng());
    if (layer instanceof L.Polyline) setCoords(layer.getLatLngs().map(p => ({ lat: p.lat, lng: p.lng })));
    if (layer instanceof L.Circle) setCircle({ center: layer.getLatLng(), radius: layer.getRadius() });
  };

  const handleEdited = (e) => {
    e.layers.eachLayer((layer) => {
      if (layer instanceof L.Marker) setMarker(layer.getLatLng());
      if (layer instanceof L.Polyline) setCoords(layer.getLatLngs().map(p => ({ lat: p.lat, lng: p.lng })));
      if (layer instanceof L.Circle) setCircle({ center: layer.getLatLng(), radius: layer.getRadius() });
    });
  };

  const handleDeleted = () => {
    setMarker(null);
    setCoords([]);
    setCircle(null);
  };

  const handleSave = async () => {
    const updates = {
      marker_lat: marker?.lat || null,
      marker_lng: marker?.lng || null,
      coords: coords.map(c => [c.lat, c.lng]),
      circle_center_lat: circle?.center.lat || null,
      circle_center_lng: circle?.center.lng || null,
      circle_radius: circle?.radius || null
    };
    if (!selectedPassId) {
      alert("❌ Kein Pass ausgewählt – kann nicht speichern.");
      return;
    }
    const { error } = await supabase
      .from('passes')
      .update(updates)
      .eq('id', selectedPassId);
    if (!error) alert("✅ Erfolgreich gespeichert.");
    else alert("❌ Fehler beim Speichern: " + error.message);
  };

  return (
    <div style={{ height: '100vh', display: 'flex' }}>
      <MapContainer
        center={[46.8, 8.3]}
        zoom={8}
        style={{ height: '90%', width: 'calc(90% - 60px)' }}
        whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <FeatureGroup ref={drawRef}>
          <EditControl
            position="topright"
            draw={{
              marker: true,
              polyline: true,
              polygon: false,
              rectangle: false,
              circle: true,
              circlemarker: false,
            }}
            edit={{ edit: true, remove: true }}
            onCreated={handleCreated}
            onEdited={handleEdited}
            onDeleted={handleDeleted}
          />
        </FeatureGroup>
        <SearchControl />
        {routingMode && <RoutePlanner onRouteReady={setCoords} />}
        {marker && <Marker position={[marker.lat, marker.lng]} />}
        {Array.isArray(coords) && coords.length > 1 && (
          <Polyline positions={coords.map(c => [c.lat, c.lng])} color="blue" />
        )}
        {circle && <Circle center={circle.center} radius={circle.radius} pathOptions={{ color: 'red' }} />}
        {/* Werkzeuge unterhalb des letzten Draw-Tools */}
        <div style={{
  width: '60px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
  backgroundColor: 'rgba(255,255,255,0.95)',
  padding: '6px 4px',
  boxShadow: '-2px 0 6px rgba(0,0,0,0.15)',
  zIndex: 2000
}}>
  <button onClick={() => setRoutingMode(!routingMode)} title="Route planen" style={{ backgroundColor: routingMode ? '#d0ebff' : undefined, fontSize: '1.4rem', padding: '6px' }}>🧭</button>
  <button onClick={() => {
    const group = drawRef.current;
    if (!group) return;
    if (marker) group.addLayer(L.marker([marker.lat, marker.lng]));
    if (coords.length > 1) group.addLayer(L.polyline(coords.map(c => [c.lat, c.lng]), { color: 'blue' }));
    if (circle) group.addLayer(L.circle(circle.center, { radius: circle.radius }));
  }} title="Bearbeiten" style={{ fontSize: '1.4rem', padding: '6px' }}>✏️</button>
  <button onClick={handleSave} title="Speichern" style={{ backgroundColor: coords.length > 0 ? '#d0ffd6' : undefined, fontSize: '1.4rem', padding: '6px' }}>💾</button>
  <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.getRoutingPoints && window.setRoutingPoints && window.setCoordsFromAlt) {
              const current = window.getRoutingPoints();
              const updated = current.slice(0, -1);
              window.setRoutingPoints(updated);
              if (updated.length >= 2) {
                const coordsQuery = updated.map(p => `${p.lng},${p.lat}`).join(';');
                fetch(`https://router.project-osrm.org/route/v1/driving/${coordsQuery}?overview=full&geometries=geojson`)
                  .then(res => res.json())
                  .then(data => {
                    if (data.routes && data.routes.length > 0) {
                      const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
                      window.setCoordsFromAlt(coords);
                    } else {
                      window.setCoordsFromAlt([]);
                    }
                  })
                  .catch(() => window.setCoordsFromAlt([]));
              } else {
                window.setCoordsFromAlt([]);
              }
            }
          }}
          title="Letzten Punkt entfernen" style={{ fontSize: '1.4rem', padding: '6px' }}>↩️</button>
</div>
</MapContainer>

      {/* Werkzeugleiste rechts neben der Karte */}
      <div style={{
        width: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: '6px 4px',
        boxShadow: '-2px 0 6px rgba(0,0,0,0.15)',
        zIndex: 2000
      }}>
        <button onClick={() => setRoutingMode(!routingMode)} title="Route planen" style={{ backgroundColor: routingMode ? '#d0ebff' : undefined, fontSize: '1.4rem', padding: '6px' }}>🧭</button>
        <button onClick={() => {
          const group = drawRef.current;
          if (!group) return;
          if (marker) group.addLayer(L.marker([marker.lat, marker.lng]));
          if (coords.length > 1) group.addLayer(L.polyline(coords.map(c => [c.lat, c.lng]), { color: 'blue' }));
          if (circle) group.addLayer(L.circle(circle.center, { radius: circle.radius }));
        }} title="Bearbeiten" style={{ fontSize: '1.4rem', padding: '6px' }}>✏️</button>
        <button onClick={handleSave} title="Speichern" style={{ backgroundColor: coords.length > 0 ? '#d0ffd6' : undefined, fontSize: '1.4rem', padding: '6px' }}>💾</button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.getRoutingPoints && window.setRoutingPoints && window.setCoordsFromAlt) {
              const current = window.getRoutingPoints();
              const updated = current.slice(0, -1);
              window.setRoutingPoints(updated);
              if (updated.length >= 2) {
                const coordsQuery = updated.map(p => `${p.lng},${p.lat}`).join(';');
                fetch(`https://router.project-osrm.org/route/v1/driving/${coordsQuery}?overview=full&geometries=geojson`)
                  .then(res => res.json())
                  .then(data => {
                    if (data.routes && data.routes.length > 0) {
                      const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
                      window.setCoordsFromAlt(coords);
                    } else {
                      window.setCoordsFromAlt([]);
                    }
                  })
                  .catch(() => window.setCoordsFromAlt([]));
              } else {
                window.setCoordsFromAlt([]);
              }
            }
          }}
          title="Letzten Punkt entfernen" style={{ fontSize: '1.4rem', padding: '6px' }}>↩️</button>
      </div>

      <div style={{ position: 'absolute', top: 12, left: 20, zIndex: 1000 }}>
        <button onClick={() => router.push('admin254dfE45fg45Fgt55df456FFghbv')} title="Zurück zur Adminseite" style={{ backgroundColor: '#555', color: '#fff', border: 'none', padding: '6px 12px' }}>🔙 Admin</button>
      </div>
    </div>
  );
}
