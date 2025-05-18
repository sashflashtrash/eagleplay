// pages/admin/roadedit.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import React from "react";


export default function RoadEditPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [auth, setAuth] = useState(false);
  const [passes, setPasses] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState([]);
  const [countryFilter, setCountryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [changes, setChanges] = useState({});
  const [showOverlay, setShowOverlay] = useState(false);

  const th = { padding: 8, borderBottom: "1px solid #555", textAlign: "left" };
  const td = { padding: 8, verticalAlign: "top" };
  const buttonStyle = {
    padding: "8px 14px",
    background: "#222",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 6,
    cursor: "pointer"
  };
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  };
  const overlayContent = {
    backgroundColor: "#222",
    color: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "90%",
    maxWidth: 500
  };

  const copyNames = () => {
    const names = filtered.map((p) => p.name).join("\n");
    navigator.clipboard.writeText(names)
      .then(() => alert("Namen wurden in die Zwischenablage kopiert."))
      .catch(err => console.error("Fehler beim Kopieren:", err));
  };

  useEffect(() => {
    const session = sessionStorage.getItem("adminAuth");
    const expiry = sessionStorage.getItem("adminAuthExpiry");
    if (session === "true" && expiry && Date.now() < parseInt(expiry)) {
      setAuth(true);
    } else {
      router.push("/pages/admin");
    }
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (auth) {
      supabase
        .from("passes")
        .select("*")
        .then(({ data, error }) => {
          if (error) console.error("Fehler beim Laden:", error);
          else setPasses(data.sort((a, b) => a.name.localeCompare(b.name)));
        });
    }
  }, [auth]);

  const handleInputChange = (id, field, value) => {
    setPasses((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    setChanges((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }));
  };

  const handleDelete = async (id) => {
    if (!confirm("❗ Willst du diesen Eintrag wirklich löschen?")) return;
    await supabase.from("passes").delete().eq("id", id);
    setPasses((prev) => prev.filter((p) => p.id !== id));
    const updatedChanges = { ...changes };
    delete updatedChanges[id];
    setChanges(updatedChanges);
  };

  const removeChange = (id) => {
    const updated = { ...changes };
    delete updated[id];
    setChanges(updated);
  };

  const saveChanges = async () => {
    for (const [id, updateFields] of Object.entries(changes)) {
      await supabase.from("passes").update(updateFields).eq("id", id);
    }
    setChanges({});
    setShowOverlay(false);
    location.reload();
  };

  const filtered = passes.filter((p) => {
    const normalizeCountry = (val) => {
    if (typeof val !== "string") {
      if (Array.isArray(val)) val = val[0];
      val = String(val);
    }
    const lettersOnly = val.toLowerCase().replace(/[^a-z]/g, "");
    if (lettersOnly.includes("ch")) return "ch";
    if (lettersOnly.includes("at")) return "at";
    if (lettersOnly.includes("it")) return "it";
    if (lettersOnly.includes("fr")) return "fr";
    if (lettersOnly.includes("de")) return "de";
    return "";
  };

    const typeMatch = filter === "all" || p.type === filter;
    const statusMatch = statusFilter.length === 0 || statusFilter.includes(p.status || "");
    const countryMatch = countryFilter === "all" || normalizeCountry(p.countries) === countryFilter;
    const searchMatch = p.name.toLowerCase().includes(search.toLowerCase());
    return typeMatch && statusMatch && countryMatch && searchMatch;
  });

  if (!authChecked || !auth) return null;

  return (
    <>
      <div style={{ padding: 20, fontFamily: "sans-serif", backgroundColor: "#111", color: "#fff", minHeight: "100vh" }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
          <button onClick={() => router.push("/admin/admin")} style={buttonStyle}>⬅ Dashboard</button>
          <button onClick={copyNames} style={buttonStyle}>📋 Namen kopieren</button>
          <div>
            <label>Typ-Filter: </label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Alle</option>
              <option value="pass">Pass</option>
              <option value="road">Strasse</option>
              <option value="transit">Transit</option>
              <option value="aussicht">Aussicht</option>
              <option value="branch">Abzweigung</option>
            </select>
          </div>
          <div>
            <label>Land-Filter: </label>
            <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              <option value="all">Alle</option>
              <option value="ch">CH</option>
              <option value="at">AT</option>
              <option value="it">IT</option>
              <option value="fr">FR</option>
              <option value="de">DE</option>
            </select>
          </div>
          <div>
            <label>Status-Filter:</label><br />
            <input type="checkbox" value="" checked={statusFilter.includes("")} onChange={(e) => {
              const checked = e.target.checked;
              setStatusFilter((prev) => checked ? [...prev, ""] : prev.filter(v => v !== ""));
            }} /> immer offen<br />
            <input type="checkbox" value="open" checked={statusFilter.includes("open")} onChange={(e) => {
              const checked = e.target.checked;
              setStatusFilter((prev) => checked ? [...prev, "open"] : prev.filter(v => v !== "open"));
            }} /> open<br />
            <input type="checkbox" value="closed" checked={statusFilter.includes("closed")} onChange={(e) => {
              const checked = e.target.checked;
              setStatusFilter((prev) => checked ? [...prev, "closed"] : prev.filter(v => v !== "closed"));
            }} /> closed
          </div>
          <div>
            <label>Suche: </label><br />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Name" style={{ padding: 6 }} />
          </div>
        </div>

        {/* Tabelle mit zusätzlicher Spalte "Land" */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#333" }}>
              <th style={th}>#</th>
              <th style={th}>Name</th>
              <th style={th}>Status</th>
              <th style={th}>Open</th>
              <th style={th}>Close</th>
              <th style={th}>Hidden</th>
              <th style={th}>Type</th>
              <th style={th}>Land</th>
              <th style={th}>Löschen</th>
            </tr>
          </thead>
          <tbody>
                      {filtered.map((p, index) => (
              <React.Fragment key={p.id}>
                <tr key={p.id} style={{ borderBottom: "1px solid #444" }}>
                  <td style={td}>{index + 1}</td><td style={td} onClick={() => setExpandedRow(p.id === expandedRow ? null : p.id)}>
                    {p.name} {p.id === expandedRow && "▼"}
                  </td>
                  <td style={td}>
                    <select
                      value={p.status || ""}
                      onChange={(e) => handleInputChange(p.id, "status", e.target.value || null)}
                    >
                      <option value="">immer offen</option>
                      <option value="open">open</option>
                      <option value="closed">closed</option>
                    </select>
                  </td>
                  <td style={td}>
                    <input type="date" value={p.datum_open || ""} onChange={(e) => handleInputChange(p.id, "datum_open", e.target.value)} />
                  </td>
                  <td style={td}>
                    <input type="date" value={p.datum_close || ""} onChange={(e) => handleInputChange(p.id, "datum_close", e.target.value)} />
                  </td>
                  <td style={td}>
                    <input type="checkbox" checked={!!p.hidden} onChange={(e) => handleInputChange(p.id, "hidden", e.target.checked)} />
                  </td>
                  <td style={td}>
                    <select value={p.type} onChange={(e) => handleInputChange(p.id, "type", e.target.value)}>
                      <option value="pass">Pass</option>
                      <option value="road">Strasse</option>
                      <option value="transit">Transit</option>
                      <option value="aussicht">Aussicht</option>
                      <option value="branch">Abzweigung</option>
                    </select>
                  </td>
                  <td style={td}>{Array.isArray(p.countries) ? p.countries[0] : p.countries}</td>
                  <td style={td}>
                    <button onClick={() => handleDelete(p.id)} style={{ color: "#f55" }}>🗑️</button>
                  </td>
                </tr>
                {expandedRow === p.id && (
                  <tr>
                    <td colSpan={9} style={{ background: "#222", padding: 12 }}>
                      <div>
                        <strong>Name (bearbeitbar):</strong><br />
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handleInputChange(p.id, "name", e.target.value)}
                          style={{ width: "100%", padding: 6 }}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <div style={{ position: "absolute", right: 20, top: 140 }}>
          <button style={buttonStyle} onClick={() => setShowOverlay(true)}>💾 Änderungen speichern</button>
        </div>

        {showOverlay && (
          <div style={overlayStyle}>
            <div style={overlayContent}>
              <h3>✏️ Zu speichernde Änderungen</h3>
              {Object.entries(changes).length === 0 ? (
                <p>Keine Änderungen vorhanden.</p>
              ) : (
                <ul>
                  {Object.entries(changes).map(([id, fields]) => (
                    <li key={id} style={{ marginBottom: 10 }}>
                      <strong>Name:</strong> {passes.find(p => p.id === id)?.name || "(unbekannt)"}<br />
                      {Object.entries(fields).map(([key, val]) => (
                        <div key={key}>• {key}: {String(val)}</div>
                      ))}
                      <button onClick={() => removeChange(id)} style={{ marginTop: 5, color: "#f55" }}>❌ Entfernen</button>
                    </li>
                  ))}
                </ul>
              )}
              <div style={{ marginTop: 20 }}>
                <button onClick={saveChanges} style={buttonStyle}>💾 Speichern</button>
                <button onClick={() => setShowOverlay(false)} style={{ ...buttonStyle, marginLeft: 10 }}>Abbrechen</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
