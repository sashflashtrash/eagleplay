import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function admin254dfE45fg45Fgt55df456FFghbv() {
  const router = useRouter();
  const [auth, setAuth] = useState(false);
  const [input, setInput] = useState("");
  const [passes, setPasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState('all');
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const session = sessionStorage.getItem("adminAuth");
    const expiry = sessionStorage.getItem("adminAuthExpiry");
    if (session === "true" && expiry && Date.now() < parseInt(expiry)) {
      setAuth(true);
    }
  }, []);

  const checkPassword = () => {
    if (input === "beyondroads2025%") {
      const oneHourLater = Date.now() + 60 * 60 * 1000;
      sessionStorage.setItem("adminAuth", "true");
      sessionStorage.setItem("adminAuthExpiry", oneHourLater.toString());
      setAuth(true);
    } else {
      alert("Wrong password");
    }
  };

  useEffect(() => {
    if (auth) {
      fetch("/api/save-pass")
        .then((res) => res.json())
        .then((data) => setPasses(data.sort((a, b) => a.name.localeCompare(b.name))));
    }
  }, [auth]);

  const handleInputChange = (index, field, value) => {
    setPasses((prev) =>
      prev.map((pass, i) =>
        i === index ? { ...pass, [field]: value } : pass
      )
    );
  };

  const handleToggleHidden = (index) => {
    const updated = [...passes];
    updated[index].hidden = !updated[index].hidden;
    setPasses(updated);
  };

  const handleSaveAll = async () => {
    let success = true;
    for (const pass of passes) {
      const payload = {
        id: pass.id,
        name: pass.name,
        status: pass.status,
        hidden: !!pass.hidden,
        datum_open: pass.datum_open,
        datum_close: pass.datum_close,
        type: pass.type || 'pass',
      };
      const res = await fetch("/api/save-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) success = false;
    }
    setSaveMessage(success ? "✅ Changes saved." : "❌ Save failed.");
    setTimeout(() => setSaveMessage(""), 4000);
  };

  const filtered = passes.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (typeFilter === 'all' || p.type === typeFilter)
  );

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", color: "#fff", backgroundColor: "#121212" }}>
      {!auth ? (
        <div style={{ maxWidth: 300, margin: "100px auto", padding: 20, border: "1px solid #444", borderRadius: 8, textAlign: "center" }}>
          <h2>🔒 Admin Login</h2>
          <input
            placeholder="Password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="password"
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
          />
          <button onClick={checkPassword} style={{ padding: "8px 16px" }}>Login</button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2>🛠 Admin Panel</h2>
            <div>
              {saveMessage && <span style={{ marginRight: 10, color: saveMessage.startsWith("✅") ? "lightgreen" : "#f66" }}>{saveMessage}</span>}
              <button onClick={handleSaveAll} style={{ padding: "8px 16px", marginRight: 12 }}>💾 Save all</button>
              <button onClick={() => router.push("/admin/mapback")} style={{ padding: "8px 16px", marginRight: 12 }}>🗺️ Map Editor</button>
              <button onClick={() => router.push("/admin/new")} style={{ padding: "8px 16px" }}>➕ Neuer Eintrag</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <input
              placeholder="🔍 Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: 6 }}
            />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">Alle Typen</option>
              <option value="pass">Pass</option>
              <option value="road">Strasse</option>
              <option value="transit">Transit</option>
            </select>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#333", color: "#fff" }}>
                <th style={{ padding: 8, borderBottom: "1px solid #555", textAlign: "left" }}>Name</th>
                <th style={{ padding: 8, borderBottom: "1px solid #555" }}>Open Date</th>
                <th style={{ padding: 8, borderBottom: "1px solid #555" }}>Close Date</th>
                <th style={{ padding: 8, borderBottom: "1px solid #555" }}>Status</th>
                <th style={{ padding: 8, borderBottom: "1px solid #555" }}>Type</th>
                <th style={{ padding: 8, borderBottom: "1px solid #555" }}>Hidden</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pass, i) => (
                <tr key={pass.id || i}>
                  <td style={{ padding: 8 }}>{pass.name}</td>
                  <td style={{ padding: 8 }}>
                    <input type="date" value={pass.datum_open || ""} onChange={(e) => handleInputChange(i, "datum_open", e.target.value)} />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input type="date" value={pass.datum_close || ""} onChange={(e) => handleInputChange(i, "datum_close", e.target.value)} />
                  </td>
                  <td style={{ padding: 8 }}>
                    <select
                      value={pass.status}
                      onChange={(e) => handleInputChange(i, "status", e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </td>
                  <td style={{ padding: 8 }}>
                    <select
                      value={pass.type || "pass"}
                      onChange={(e) => handleInputChange(i, "type", e.target.value)}
                    >
                      <option value="pass">Pass</option>
                      <option value="road">Strasse</option>
                      <option value="transit">Transit</option>
                    </select>
                  </td>
                  <td style={{ padding: 8, textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={!!pass.hidden}
                      onChange={() => handleToggleHidden(i)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
