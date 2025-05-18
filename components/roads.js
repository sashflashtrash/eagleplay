import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function useRoads({ initialLegendFilters } = {}) {
  const [passes, setPasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [legendFilters, setLegendFilters] = useState(
    initialLegendFilters || {
      closed: true,
      open: true,
      route: true,
      tour: true,
      poi: true,
      favorites: false,
    }
  );

  useEffect(() => {
    const saved = localStorage.getItem('beyond_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('beyond_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('passes').select('*'); // TEMP: ohne hidden-Filter
      if (data) {
        setPasses(data);
        console.log("✅ Supabase-Daten:", data.map(p => `${p.name} → ${p.countries}`));
      }
      if (error) console.error('Supabase error:', error);
    };
    fetchData();
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const toggleLegendFilter = (key) => {
    setLegendFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetFilters = () => {
    setLegendFilters({
      closed: true,
      open: true,
      route: true,
      tour: true,
      poi: true,
      favorites: false,
    });
    setSearchTerm('');
    setSelectedCountries([]);
    setSelectedLevel('');
  };

  const filteredPasses = passes.filter((pass) => {
    const nameMatch = pass.name.toLowerCase().includes(searchTerm.toLowerCase());

    let typeKey = '';
    if (pass.type === 'road') typeKey = 'route';
    else if (pass.type === 'tour') typeKey = 'tour';
    else if (pass.type === 'scenic') typeKey = 'poi';
    else if (pass.type === 'pass') {
      if (pass.status === 'closed') typeKey = 'closed';
      else typeKey = 'open'; // treat null or anything else as 'open'
    }
    const legendMatch = Object.values(legendFilters).some(Boolean) ? legendFilters[typeKey] : false;

    if (!legendMatch) {
      console.log('🚫 Gefiltert durch Legend:', {
        name: pass.name,
        type: pass.type,
        status: pass.status,
        typeKey,
        legendMatch
      });
    }

    const favMatch = legendFilters.favorites ? favorites.includes(pass.id) : true;

    const countryMatch = selectedCountries.length > 0
      ? (typeof pass.countries === 'string' &&
          pass.countries
            .split(',')
            .map(c => c.trim().toUpperCase())
            .some(c => selectedCountries.includes(c)))
      : true;
    const levelMatch = selectedLevel ? (pass.level || 'low') === selectedLevel : true;

    return nameMatch && legendMatch && favMatch && countryMatch && levelMatch;
  });

  const mapFilteredPasses = filteredPasses.filter((pass) => {
    if (pass.type === 'road' && !legendFilters.route) return false;
    if (pass.type === 'tour' && !legendFilters.tour) return false;
    if (pass.type === 'scenic' && !legendFilters.poi) return false;
    return true;
  });

  return {
    passes,
    filteredPasses,
    mapFilteredPasses,
    favorites,
    toggleFavorite,
    searchTerm,
    setSearchTerm,
    legendFilters,
    toggleLegendFilter,
    resetFilters,
    selectedCountries,
    setSelectedCountries,
    selectedLevel,
    setSelectedLevel,
  };
}
