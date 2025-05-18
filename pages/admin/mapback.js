//Mapback
// Importiere die 'dynamic'-Funktion von Next.js, um Komponenten dynamisch zu laden
import dynamic from 'next/dynamic';

// Importiere React-spezifische Hooks und Router für die Client-seitige Navigation
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Lade Supabase-Client zur Authentifizierung und Datenzugriff
import { supabase } from '@/lib/supabaseClient';

// Dynamisches Importieren der LeafletMapback-Komponente ohne Server Side Rendering (ssr)
const LeafletMapBack = dynamic(() => import('@/components/LeafletMapback'), {
  ssr: false, // Server Side Rendering deaktivieren, damit Leaflet korrekt funktioniert
});

// Exportiere die Standard-Komponente für die Seite
export default function MapBackPage() {
  // Zustand für Authentifizierung speichern (true = erlaubt, false = umleiten)
  const [auth, setAuth] = useState(false);

  // Passliste laden
  const [passList, setPassList] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPassId, setSelectedPassId] = useState(null);
  const [selectedPassName, setSelectedPassName] = useState(null);

  // Router verwenden, um ggf. umleiten zu können
  const router = useRouter();

  // Verwende useEffect, um beim Laden der Seite die Authentifizierung zu prüfen
  useEffect(() => {
    const session = sessionStorage.getItem("adminAuth"); // Prüfe ob Session vorhanden
    const expiry = sessionStorage.getItem("adminAuthExpiry"); // Prüfe ob Ablaufzeit vorhanden ist
    if (session === "true" && expiry && Date.now() < parseInt(expiry)) {
      setAuth(true); // Authentifizierung erfolgreich
    } else {
      router.push("/admin"); // Nicht authentifiziert → weiterleiten zur Login-Seite
    }
  }, []); // Leeres Array = nur einmal beim ersten Rendern ausführen

  useEffect(() => {
    const fetchNames = async () => {
      const { data, error } = await supabase.from("passes").select("id, name, type");
      if (!error) setPassList(data);
    };
    fetchNames();
  }, []);

  const filteredList = passList
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Wenn nicht authentifiziert, zeige leere Ansicht (Hooks trotzdem ausgeführt)
  if (!auth) {
    return (
      <div style={{ color: '#fff', background: '#000', padding: '2rem' }}>
        <p>Authentifizierung läuft...</p>
      </div>
    );
  }

  // Wenn authentifiziert, rendere die LeafletMapBack-Komponente mit Passliste
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: 280, background: '#2c2c2c', padding: 12, color: '#fff', overflowY: 'auto' }}>
        <h3>Pässe</h3>
        <input
          placeholder="🔍 Suche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', marginBottom: 12 }}
        />
        <ul style={{ listStyle: 'none', padding: 0, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          {filteredList.map((p) => (
            <li key={p.id}>
              <button
                style={{
                  width: '100%',
                  marginBottom: 6,
                  fontWeight: selectedPassId === p.id ? 'bold' : 'normal',
                  background: selectedPassId === p.id ? '#4a90e2' : '#3a3a3a',
                  color: '#fff',
                  border: 'none',
                  padding: 6
                }}
                onClick={() => {
                  setSelectedPassId(p.id);
                  setSelectedPassName(p.name);
                }}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1 }}>
        <LeafletMapBack selectedPassId={selectedPassId} selectedPassName={selectedPassName} />
      </div>
    </div>
  );
}
