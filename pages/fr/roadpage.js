//roadpage/fr.js
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAppContext } from '@/contexts/AppContext';
import RoadGallery from '@/components/roadgallery';

import Head from 'next/head';
export default function Roadpage() {
  const topRef = useRef(null);
  const [passes, setPasses] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('');
  const [cantonFilter, setCantonFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { language, darkMode } = useAppContext();
  const lang = 'FR';

  const getOpensLabel = {
    DE: 'Öffnet am', FR: 'Ouvre le', IT: 'Apre il', EN: 'Opens on'
  };
  const getClosesLabel = {
    DE: 'Schliesst am', FR: 'Ferme le', IT: 'Chiude il', EN: 'Closes on'
  };

  useEffect(() => {
    const saved = localStorage.getItem('beyond_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('beyond_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('passes').select('*').eq('hidden', false);
      if (data) setPasses(data);
      if (error) console.error('Supabase error:', error);
    };
    fetchData();
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const filtered = passes
    .filter((p) => {
      const matchesLevel = levelFilter === '' || p.level === levelFilter;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesCanton = cantonFilter === '' || p.canton === cantonFilter;
      const matchesRegion = regionFilter === '' || p.region === regionFilter;
      const matchesCountry = countryFilter === '' || (p.countries || '').includes(countryFilter);
      const matchesType = typeFilter === 'all' || p.type === typeFilter;
      const isFavorite = favorites.includes(p.id);
      return (
        matchesLevel &&
        matchesStatus &&
        matchesCanton &&
        matchesRegion &&
        matchesCountry &&
        matchesType &&
        (!showOnlyFavorites || isFavorite)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const visiblePasses = passes.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesCountry = countryFilter === '' || (p.countries || '').includes(countryFilter);
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesCountry && matchesType && matchesSearch;
  });

  const filteredCantons = [...new Set(visiblePasses.map(p => p.canton).filter(Boolean))].sort();
  const filteredRegions = [...new Set(visiblePasses.map(p => p.region).filter(Boolean))].sort();
  const filteredCountries = [...new Set(visiblePasses.flatMap(p => (p.countries || '').split(',')).filter(Boolean))].sort();
  const filteredTypes = [...new Set(visiblePasses.map(p => p.type).filter(Boolean))].sort();

  return (
    <>
      <Head>
        <title>Pässe · Routen · Touren</title>
        <meta name="description" content="Kuratierte Übersicht von Schweizer Pässen, Routen und Touren in der Schweiz – mit Filter, Statusanzeige und Favoriten." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Pässe · Routen · Touren" />
        <meta property="og:description" content="Kuratierte Übersicht von Schweizer Pässen, Routen und Touren in der Schweiz – mit Filter, Statusanzeige und Favoriten." />
      </Head>
      <main>
      <div ref={topRef}></div>
    <div style={{ padding: 20, backgroundColor: darkMode ? '#111' : '#fff', color: darkMode ? '#eee' : '#000', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: '2rem' }}>Cols · Itinéraires · Tours</h1>
        <button onClick={() => setShowHelp(true)} style={{ fontSize: 20, padding: '4px 12px', borderRadius: 8, background: darkMode ? '#333' : '#ddd', border: 'none', cursor: 'pointer' }}>❓</button>
</div>

<div style={{ display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: 24
      }}>
        <input
          type="text"
          placeholder={lang === 'DE' ? '🔍 Suche' : lang === 'FR' ? '🔍 Rechercher' : lang === 'IT' ? '🔍 Cerca' : '🔍 Search'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flexGrow: 1, minWidth: 180, padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc' }}
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8 }}>
          <option value="all">{lang === 'DE' ? 'Status' : lang === 'FR' ? 'Statut' : lang === 'IT' ? 'Stato' : 'Status'}</option>
          <option value="open">{lang === 'DE' ? 'Offen' : lang === 'FR' ? 'Ouvert' : lang === 'IT' ? 'Aperto' : 'Open'}</option>
          <option value="closed">{lang === 'DE' ? 'Geschlossen' : lang === 'FR' ? 'Fermé' : lang === 'IT' ? 'Chiuso' : 'Closed'}</option>
        </select>

        <select value={cantonFilter} onChange={(e) => setCantonFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8 }}>
          <option value="">{lang === 'DE' ? 'Kanton' : lang === 'FR' ? 'Canton' : lang === 'IT' ? 'Cantone' : 'Canton'}</option>
          {filteredCantons.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8 }}>
          <option value="">{lang === 'DE' ? 'Region' : lang === 'FR' ? 'Région' : lang === 'IT' ? 'Regione' : 'Region'}</option>
          {filteredRegions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8 }}>
          <option value="">{lang === 'DE' ? 'Land' : lang === 'FR' ? 'Pays' : lang === 'IT' ? 'Paese' : 'Country'}</option>
          {filteredCountries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8 }}>
          <option value="all">{lang === 'DE' ? 'Typ' : lang === 'FR' ? 'Type de route' : lang === 'IT' ? 'Tipo' : 'Type'}</option>
          {filteredTypes.map(t => (
          <option key={t} value={t}>
            {t === 'pass' ? (lang === 'FR' ? 'Col routier' : t) :
             t === 'road' ? (lang === 'FR' ? 'Route' : t) :
             t === 'touren' ? (lang === 'FR' ? 'Circuit touristique' : t) :
             t === 'sehenswürdigkeit' ? (lang === 'FR' ? 'Attraction' : t) :
             t}
          </option>
          ))}
        </select>

        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8 }}>
          <option value="">{lang === 'DE' ? 'Niveau' : lang === 'FR' ? 'Niveau' : lang === 'IT' ? 'Livello' : 'Level'}</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={showOnlyFavorites} onChange={(e) => setShowOnlyFavorites(e.target.checked)} />
          {lang === 'DE' ? 'Nur Favoriten' : lang === 'FR' ? 'Favoris seulement' : 'Only Favorites'}
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {filtered.map((pass) => (
          <article key={pass.id} style={{ position: 'relative', border: '1px solid #ccc', borderRadius: 10, padding: 20, backgroundColor: darkMode ? '#222' : '#fff', color: darkMode ? '#eee' : '#000' }}>
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
              <RoadGallery passId={pass.id} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>{pass.name}</h3>
              <span
                style={{ cursor: 'pointer', fontSize: 20, color: favorites.includes(pass.id) ? '#FFD700' : (darkMode ? '#888' : '#aaa') }}
                onClick={() => toggleFavorite(pass.id)}
              >★</span>
            </div>
            <div>{[pass.countries, pass.canton].filter(Boolean).join(' | ')}</div>
            {pass.status === 'open' ? (
  <div style={{ color: '#4CAF50', fontWeight: 'bold', margin: '4px 0' }}>{lang === 'DE' ? 'Offen' : lang === 'FR' ? 'Ouvert' : lang === 'IT' ? 'Aperto' : 'Open'}</div>
) : (
  <div style={{ color: '#F44336', fontWeight: 'bold', margin: '4px 0' }}>
    {lang === 'DE' ? 'Geschlossen' : lang === 'FR' ? 'Fermé' : lang === 'IT' ? 'Chiuso' : 'Closed'}
  </div>
)}
            <div>{[pass.length + ' km', pass.height + ' m.ü.M.'].filter(Boolean).join(' | ')}</div>
            <div>{[pass.level, pass.region].filter(Boolean).join(' | ')}</div>
            {pass.status === 'closed' && pass.opens && <div>{getOpensLabel[lang] + ': ' + pass.opens}</div>}
            {pass.status === 'open' && pass.closes && <div>{getClosesLabel[lang] + ': ' + pass.closes}</div>}
            <div style={{ height: 8 }}></div>
            {pass.spezialbeschreibung ? (
              <div style={{ marginBottom: 8 }}><strong>{lang === 'DE' ? 'Hinweis' : lang === 'FR' ? 'Remarque' : lang === 'IT' ? 'Nota' : 'Note'}:</strong> {pass.spezialbeschreibung}</div>
            ) : (
              <div style={{ height: 8 }}></div>
            )}
            <div>{lang === 'DE' ? pass.description_de : lang === 'FR' ? pass.description_fr : lang === 'IT' ? pass.description_it : pass.description_en || '-'}</div>
            </article>
        ))}
      </div>

      {showHelp && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000a', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 16, maxWidth: 600, width: '90%', color: '#000' }}>
            <h2>🧭 Qu'est-ce que c'est ?</h2>
            <p>Cette page présente une sélection de cols, routes et circuits en Suisse.</p>
            <p>Tu peux filtrer par nom, statut, canton, région, pays ou type – ou afficher uniquement tes favoris.</p>
            <p>Les cantons sont les régions administratives en Suisse. (Département)</p>
            <p>Niveau 1 = route large avec ligne médiane.</p>
            <p>Niveau 2 = route normale, parfois sans ligne médiane.</p>
            <p>Niveau 3 = route étroite, peu adaptée aux grands véhicules.</p>
            <button onClick={() => setShowHelp(false)} style={{ marginTop: 20, padding: '8px 16px', borderRadius: 8, background: '#222', color: '#fff', border: 'none', cursor: 'pointer' }}>OK</button>
          </div>
        </div>
      )}
          <button
        onClick={() => topRef.current?.scrollIntoView({ behavior: 'smooth' })}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 48,
          height: 48,
          fontSize: 24,
          lineHeight: '48px',
          textAlign: 'center',
          borderRadius: 12,
          backgroundColor: '#007AFF',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >↑</button>
        </div>
    </main>
    </>
  );
}
