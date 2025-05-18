//SidebarMapMobile
import { useState, useEffect, useRef } from "react";
import debounce from "lodash.debounce";
import { useAppContext } from "../contexts/AppContext";

export default function SidebarMapMobile({
  darkMode,
  language,
  searchTerm,
  setSearchTerm,
  filteredPasses,
  selectedPass,
  setSelectedPass,
  favorites,
  toggleFavorite,
  setOverlayOpen,
  isMobile,
  selectedCountries,
  setSelectedCountries,
  selectedLevel,
  setSelectedLevel,
  passes,
  legendFilters,
  toggleLegendFilter
}) {
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const latestController = useRef(null);
  const [overlayOpen, setOverlayOpenState] = useState(false);
  const [villageResults, setVillageResults] = useState([]);
  const [villageQuery, setVillageQuery] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [autozoom, setAutozoom] = useState(true);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const { legendText } = useAppContext();
  const labels = legendText?.[language?.toLowerCase()]?.labels || {};

  useEffect(() => {
    const el = listRef.current?.querySelector("li.selected");
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [selectedPass]);

  useEffect(() => {
    if (localSearchTerm.length < 2) {
      setVillageResults([]);
      return;
    }

    if (latestController.current) {
      latestController.current.abort();
    }

    const controller = new AbortController();
    latestController.current = controller;

    const fetchData = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(localSearchTerm)}&addressdetails=1&limit=5`, {
          signal: controller.signal
        });
        const data = await res.json();
        setVillageResults(data);
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      }
    };

    const debouncedFetch = debounce(fetchData, 300);
    debouncedFetch();

    return () => {
      controller.abort();
      debouncedFetch.cancel();
    };
  }, [localSearchTerm]);

  const handleOverlayToggle = (state) => {
    setOverlayOpenState(state);
    setOverlayOpen(state);
    if (state && inputRef.current) {
      setTimeout(() => inputRef.current.select(), 0);
    }
  };

  const handleVillageSelect = (village) => {
    setVillageQuery(village);
    setLocalSearchTerm(village.display_name);
    setSearchTerm(village.display_name);
    handleOverlayToggle(false);

    const newEntry = village.display_name;
    setRecentSearches(prev => {
      const filtered = prev.filter(v => v !== newEntry);
      return [newEntry, ...filtered].slice(0, 5);
    });

    if (typeof window !== 'undefined' && village.lat && village.lon && window.leafletMapRef) {
      const map = window.leafletMapRef;
      map.setView([parseFloat(village.lat), parseFloat(village.lon)], 14);
    }
  };

  const formatVillageDisplayName = (displayName) => {
    const parts = displayName.split(",");
    return parts.filter((_, i) => i !== 1 && i !== 3).join(",");
  };

  const toFlagEmoji = (countryCode) => {
    if (!countryCode || countryCode.length !== 2) return countryCode;
    const codePoints = [...countryCode.toUpperCase()].map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  const uniqueCountries = Array.isArray(passes) && passes.length > 0
    ? [...new Set(
        passes
          .filter(p => typeof p.countries === 'string')
          .flatMap(p =>
            p.countries
              .split(',')
              .map(c => c.trim().toUpperCase())
              .filter(c => /^[A-Z]{2}$/.test(c))
          )
      )].sort()
    : [];

  const uniqueLevels = Array.isArray(passes) && passes.length > 0
    ? [...new Set(
        passes.map(p => p.level).filter(Boolean)
      )].sort()
    : [];

  const filteredList = (onlyFavorites ? filteredPasses.filter((p) => favorites.includes(p.id)) : filteredPasses)
    .filter((p) => p.name.toLowerCase().includes(localSearchTerm.toLowerCase()));

 return (
  <>
    <div
      style={{
        position: "fixed",
        top: 57,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: "8px 12px",
        backgroundColor: "transparent",
      }}
    >
      <input
        type="text"
        placeholder="🔍"
        onFocus={() => handleOverlayToggle(true)}
        readOnly
        style={{
          width: "100%",
          padding: 8,
          borderRadius: 8,
          border: "1px solid black",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          color: "#000",
          cursor: "pointer",
          fontSize: 16,
          textAlign: "left",
        }}
      />
    </div>

    <div
      style={{
        position: "fixed",
        top: 48,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: darkMode ? "#1e1e1e" : "#fff",
        color: darkMode ? "#eee" : "#000",
        zIndex: 1000,
        padding: 12,
        transition: "bottom 0.3s ease",
        display: overlayOpen ? "flex" : "none",
        flexDirection: "column",
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={localSearchTerm}
        onChange={(e) => setLocalSearchTerm(e.target.value)}
        placeholder={language === "DE" ? "Suche Ortschaft" : "Search village"}
        autoFocus
        style={{
          padding: 6,
          borderRadius: 4,
          border: "1px solid #ccc",
          marginBottom: 8,
          backgroundColor: darkMode ? "#2a2a2a" : "#fff",
          color: darkMode ? "#fff" : "#000",
        }}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setAutozoom(!autozoom)}
          style={{
            flex: 1,
            padding: "6px 10px",
            borderRadius: 4,
            backgroundColor: autozoom
              ? darkMode
                ? "#004d00"
                : "#ccffcc"
              : darkMode
              ? "#333"
              : "#eee",
            color: darkMode ? "#fff" : "#000",
            border: "1px solid #ccc",
            cursor: "pointer",
            fontWeight: autozoom ? "bold" : "normal",
          }}
        >
          {legendText?.[language?.toLowerCase()]?.autoZoom || "Autozoom"} {autozoom ? "ON" : "OFF"}
        </button>

        <button
          onClick={() => handleOverlayToggle(false)}
          style={{
            flex: 1,
            padding: "6px 10px",
            borderRadius: 4,
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          {language === "DE" ? "Schließen" : "Close"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <select
          multiple={false}
          value={
            Array.isArray(selectedCountries) && selectedCountries.length > 0
              ? selectedCountries[0]
              : ""
          }
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              setSelectedCountries([]);
            } else {
              setSelectedCountries([val]);
            }
          }}
          style={{
            flex: 1,
            padding: 6,
            borderRadius: 4,
            backgroundColor: darkMode ? "#2a2a2a" : "#fff",
            color: darkMode ? "#fff" : "#000",
            border: "1px solid #ccc",
          }}
        >
          <option value="">All Countries</option>
          {uniqueCountries.map((code) => (
            <option key={code} value={code}>
              {toFlagEmoji(code)} {code}
            </option>
          ))}
        </select>

        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          style={{
            flex: 1,
            padding: 6,
            borderRadius: 4,
            backgroundColor: darkMode ? "#2a2a2a" : "#fff",
            color: darkMode ? "#fff" : "#000",
            border: "1px solid #ccc",
          }}
        >
          <option value="">Level</option>
          {uniqueLevels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </div>

      <label
        style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}
      >
        <input
          type="checkbox"
          checked={onlyFavorites}
          onChange={() => setOnlyFavorites(!onlyFavorites)}
        />
        {language === "DE" ? "Nur Favoriten anzeigen" : "Only favorites"}
      </label>

      {villageResults.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginBottom: 12 }}>
          {villageResults.map((village) => (
            <li
              key={village.place_id}
              onClick={() => handleVillageSelect(village)}
              style={{
                padding: "8px 4px",
                borderBottom: "1px solid #ccc",
                cursor: "pointer",
              }}
            >
              {formatVillageDisplayName(village.display_name)}
            </li>
          ))}
        </ul>
      )}

      {recentSearches.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6, fontWeight: "bold" }}>
            {language === "DE" ? "Zuletzt gesucht:" : "Recent Searches:"}
          </div>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {recentSearches.map((name, idx) => (
              <li
                key={idx}
                onClick={() => {
                  setSearchTerm(name);
                  if (inputRef.current) inputRef.current.focus();
                }}
                style={{
                  padding: "6px 4px",
                  borderBottom: "1px solid #ccc",
                  cursor: "pointer",
                }}
              >
                {formatVillageDisplayName(name)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className="scrollList"
        style={{ overflowY: "auto", flexGrow: 1 }}
        ref={listRef}
      >
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredList
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((pass) => (
              <li
                key={pass.id || pass.name}
                className={selectedPass?.name === pass.name ? "selected" : ""}
                onClick={() => {
                  setSelectedPass(pass);
                  handleOverlayToggle(false);
                }}
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "8px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  fontWeight: selectedPass?.name === pass.name ? "bold" : "normal",
                  backgroundColor:
                    selectedPass?.name === pass.name
                      ? darkMode
                        ? "#444"
                        : "#eee"
                      : "transparent",
                }}
              >
                <span>{pass.name}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(pass.id);
                  }}
                  style={{
                    color: favorites.includes(pass.id) ? "gold" : "#aaa",
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  ★
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  </>
);
}
