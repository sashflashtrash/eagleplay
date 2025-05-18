// pages/admin/admin.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function AdminUnterseite() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [auth, setAuth] = useState(false);

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

  if (!authChecked) return null;

  const navigate = (path) => router.push(`/admin/${path}`);

  return auth ? (
    <div style={{ padding: 20, fontFamily: "sans-serif", backgroundColor: "#111", color: "#fff", minHeight: "100vh" }}>
      <h1>📁 Admin-Menü</h1>
      <p>Wähle einen Bereich aus:</p>

      <div style={{ display: "grid", gap: 12, maxWidth: 300, marginTop: 20 }}>
        <button onClick={() => navigate("roadedit")} style={buttonStyle}>🛣️ Road Editor</button>
        <button onClick={() => navigate("new")} style={buttonStyle}>➕ Neuer Eintrag</button>
        <button onClick={() => navigate("mapback")} style={buttonStyle}>🗺️ Map Editor</button>
        <button onClick={() => navigate("reserve1")} style={buttonStyle}>🔒 Reserve 1</button>
        <button onClick={() => navigate("reserve2")} style={buttonStyle}>🔒 Reserve 2</button>
        <button onClick={() => navigate("reserve3")} style={buttonStyle}>🔒 Reserve 3</button>
      </div>
    </div>
  ) : null;
}

const buttonStyle = {
  padding: "10px 16px",
  backgroundColor: "#222",
  color: "#fff",
  border: "1px solid #444",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 16,
};
