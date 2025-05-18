// /components/LegendMap.js
import { useAppContext } from "../contexts/AppContext";

export default function LegendMap({
  autozoom,
  setAutozoom,
  legendFilters,
  toggleLegendFilter,
  darkMode
}) {
  const { language, legendText } = useAppContext();
  const labels = legendText?.[language?.toLowerCase()]?.labels || {};

  return (
    <div
      style={{
        position: "fixed",
        top: "60px",
        right: "10px",
        backgroundColor: darkMode ? "#1e1e1e" : "#fff",
        color: darkMode ? "#eee" : "#000",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px",
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        maxWidth: "220px",
        fontSize: "14px",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
        {legendText?.[language?.toLowerCase()]?.legend || "Legende"}
      </div>

      {/* Autozoom-Toggle */}
      <button
        onClick={() => setAutozoom(!autozoom)}
        style={{
          width: "100%",
          padding: "6px",
          marginBottom: "12px",
          borderRadius: "4px",
          backgroundColor: autozoom
            ? (darkMode ? "#004d00" : "#ccffcc")
            : (darkMode ? "#333" : "#eee"),
          color: darkMode ? "#fff" : "#000",
          border: "1px solid #ccc",
          cursor: "pointer",
          fontWeight: autozoom ? "bold" : "normal",
        }}
      >
        {legendText?.[language?.toLowerCase()]?.autoZoom || "Autozoom"} {autozoom ? "ON" : "OFF"}
      </button>

      {/* Filterauswahl */}
      {["open", "closed", "route", "tour", "poi"].map((key) => (
        <div
          key={key}
          onClick={() => toggleLegendFilter(key)}
          style={{
            cursor: "pointer",
            marginBottom: "6px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: legendFilters?.[key] ? "bold" : "normal",
            opacity: legendFilters?.[key] ? 1 : 0.5,
            padding: "4px 0"
          }}
        >
          <span>{labels[key] || key}</span>
          <span>{legendFilters?.[key] ? "✔" : ""}</span>
        </div>
      ))}
    </div>
  );
}
