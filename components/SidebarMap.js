// /components/SidebarMap.js
import { useRef, useEffect, useContext } from "react";
import { useAppContext } from "../contexts/AppContext";
import Select from 'react-select';

export default function SidebarMap({
  darkMode,
  sidebarOpen,
  setSidebarOpen,
  searchTerm,
  setSearchTerm,
  filteredPasses,
  selectedPass,
  setSelectedPass,
  favorites,
  toggleFavorite,
  legendFilters,
  toggleLegendFilter,
  resetFilters,
  selectedCountries,
  setSelectedCountries,
  selectedLevel,
  setSelectedLevel,
  passes
}) {
  const { language, legendText } = useAppContext();

  

  // entfernt – Props werden direkt entpackt, kein destructuring von 'props' mehr nötig

  const listRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!filteredPasses || filteredPasses.length === 0) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const currentIndex = filteredPasses.findIndex((p) => p.name === selectedPass?.name);
        const nextIndex = e.key === "ArrowDown"
          ? Math.min(filteredPasses.length - 1, currentIndex + 1)
          : Math.max(0, currentIndex - 1);
        const nextPass = filteredPasses[nextIndex];
        if (nextPass) setSelectedPass(nextPass);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredPasses, selectedPass]);

  useEffect(() => {
    const el = listRef.current?.querySelector("li.selected");
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [selectedPass]);

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

  

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "60px",
          height: "calc(100vh - 60px)",
          overflow: "visible",
          left: sidebarOpen ? 0 : "-260px",
          width: "260px",
          bottom: 0,
          backgroundColor: darkMode ? "#1e1e1e" : "#fff",
          color: darkMode ? "#eee" : "#000",
          zIndex: 1000,
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          padding: "10px",
          transition: "left 0.3s ease",
          direction: "rtl",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ direction: "ltr", marginBottom: "10px" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={legendText?.[language?.toLowerCase()]?.search || 'Suchen'}
            style={{
              padding: "6px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: darkMode ? "#2a2a2a" : "#fff",
              color: darkMode ? "#fff" : "#000",
              width: "100%",
              marginBottom: "8px",
            }}
          />

          <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "8px" }}>
            <select
              multiple={false}
              value={selectedCountries[0] || ""}
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
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: darkMode ? "#2a2a2a" : "#fff",
                color: darkMode ? "#fff" : "#000",
                height: 32,
                fontSize: "14px"
              }}
            >
              <option value="">{legendText?.[language?.toLowerCase()]?.countryAll || 'All Countries'}</option>
              {uniqueCountries.map(code => (
                <option key={code} value={code}>{toFlagEmoji(code)} {code}</option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              style={{
                flex: 1,
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: darkMode ? "#2a2a2a" : "#fff",
                color: darkMode ? "#fff" : "#000",
                height: 32,
                fontSize: "14px"
              }}
            >
              <option value="">Level</option>
              {uniqueLevels.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <button
              onClick={() => toggleLegendFilter("favorites")}
              style={{
                backgroundColor: "transparent",
                border: "none",
                fontSize: "20px",
                color: legendFilters?.favorites ? "gold" : "#aaa",
                cursor: "pointer",
              }}
              title={legendText?.[language?.toLowerCase()]?.favOnly || 'Favoriten'}
            >
              ★
            </button>
          </div>

          <button
            onClick={resetFilters}
            style={{
              width: "100%",
              padding: "6px",
              borderRadius: "4px",
              backgroundColor: darkMode ? "#444" : "#f0f0f0",
              border: "1px solid #ccc",
              color: darkMode ? "#fff" : "#000",
              marginBottom: "10px",
              cursor: "pointer",
            }}
          >
            Reset Filter
          </button>
        </div>

        <div
          className="scrollList"
          ref={listRef}
          style={{
            overflowY: "auto",
            flexGrow: 1,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, direction: "ltr", margin: 0 }}>
            {filteredPasses.sort((a, b) => a.name.localeCompare(b.name)).map((pass) => (
              <li
                key={pass.id || pass.name}
                className={selectedPass?.name === pass.name ? "selected" : ""}
                onClick={() => setSelectedPass(pass)}
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
                    fontSize: "18px",
                    cursor: "pointer",
                  }}
                >
                  ★
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lasche zum Einklappen */}
        <div
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "absolute",
            top: "50%",
            right: "-20px",
            transform: "translateY(-50%)",
            width: "20px",
            height: "80px",
            backgroundColor: darkMode ? "#000" : "#fff",
            color: darkMode ? "#fff" : "#000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderTopRightRadius: "8px",
            borderBottomRightRadius: "8px",
            cursor: "pointer",
            writingMode: "vertical-rl",
            textOrientation: "upright",
            fontSize: "12px",
            zIndex: 1101,
            border: darkMode ? "1px solid #444" : "1px solid #ccc",
          }}
        >
          {legendText?.[language?.toLowerCase()]?.list || 'Liste'}
        </div>
      </div>

      <style jsx>{`
        .scrollList::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}

