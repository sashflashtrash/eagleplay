import { useAppContext } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AuthForm from "../components/AuthForm";
import { supabase } from "../lib/supabaseClient";

const titles = { "/map": "Map", "/roadpage": "Roads", "/feed": "Community", "/challenge": "Challenge" };

export default function Navbar() {
  const { language, setLanguage, darkMode, setDarkMode } = useAppContext();
  const { user, setUser } = useAuth();
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [navExpanded, setNavExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [authOverlayOpen, setAuthOverlayOpen] = useState(false);

  const flagImages = {
    DE: "/images/flags/de.png",
    EN: "/images/flags/gb.png",
    IT: "/images/flags/it.png",
    FR: "/images/flags/fr.png",
  };

  const navImages = {
    "/map": "/images/map_alpenkarte_roadtrip_corrected.jpg",
    "/roadpage": "/images/passstrasse_motorrad_oldtimer_final.jpg",
    "/feed": "/images/feed.png",
    "/challenge": "/images/challenge.png"
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const toggleExpanded = () => {
    if (isMobile) setExpanded(!expanded);
  };

  const toggleNavExpanded = () => {
    if (isMobile) setNavExpanded(!navExpanded);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setExpanded(false);

    const path = router.asPath;
    const segments = path.split('/').filter(Boolean);
    const langPrefix = ["de", "fr", "it", "en"];

    if (langPrefix.includes(segments[0])) segments.shift();

    const targetPath = `/${newLang.toLowerCase()}/${segments.join('/')}`;

    fetch(targetPath, { method: 'HEAD' }).then((res) => {
      if (res.ok) {
        router.push(targetPath);
      } else {
        console.warn("Zielseite in Sprache nicht vorhanden. Keine Weiterleitung.");
      }
    });
  };

  const handleAuthClick = async () => {
    if (user) {
      const confirmLogout = confirm("Möchtest du dich wirklich abmelden?");
      if (confirmLogout) {
        await supabase.auth.signOut();
        setUser(null);
      }
    } else {
      setAuthOverlayOpen(true);
    }
  };

  return (
    <>
      <div style={{
        position: "fixed",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        height: "60px",
        backgroundColor: darkMode ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.7)",
        color: darkMode ? "#ffffff" : "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        zIndex: 2000,
        backdropFilter: "blur(6px)",
        borderRadius: "0 0 12px 12px",
      }}>
        <div
          style={{ position: "relative", zIndex: 2100 }}
          onMouseEnter={() => !isMobile && setExpanded(true)}
          onMouseLeave={() => !isMobile && setExpanded(false)}
        >
          <img
            src={flagImages[language]}
            alt={language}
            onClick={toggleExpanded}
            style={{ height: "24px", width: "auto", cursor: "pointer", borderRadius: "4px", transition: "transform 0.2s" }}
          />
          <div style={{
            position: "absolute",
            left: "0",
            top: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            opacity: expanded ? 1 : 0,
            visibility: expanded ? "visible" : "hidden",
            transition: "all 0.3s ease",
            zIndex: 2100
          }}>
            {Object.entries(flagImages)
              .filter(([key]) => key !== language)
              .map(([key, src]) => (
                <img
                  key={key}
                  src={src}
                  alt={key}
                  onClick={() => handleLanguageChange(key)}
                  style={{ height: "24px", width: "auto", cursor: "pointer", borderRadius: "4px", transition: "transform 0.2s" }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.2)"}
                  onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)" }}
                  
                />
              ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', zIndex: 2000 }}>
          {isMobile ? (
            <div style={{ position: "relative" }}>
              <img
                src="/images/Schild.png"
                alt="Navigation"
                onClick={toggleNavExpanded}
                style={{ height: "45px", width: "45px", objectFit: "cover", cursor: "pointer", borderRadius: "6px", boxShadow: "0 0 4px rgba(0,0,0,0.2)", transition: "transform 0.2s" }}
              />
              <div style={{
                position: "absolute",
                top: "100%",
                left: "0",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                zIndex: 2000,
                opacity: navExpanded ? 1 : 0,
                visibility: navExpanded ? "visible" : "hidden",
                transition: "all 0.3s ease",
              }}>
                {Object.entries(navImages).map(([path, img]) => {
              const useLangPrefix = path !== "/map";
              const fullPath = useLangPrefix ? `/${language.toLowerCase()}${path}` : path;
              const titles = { "/map": "Map", "/roadpage": "Roads", "/feed": "Community", "/challenge": "Challenge" };
                  return (
                    <img
                      key={path}
                      src={img}
                      alt={path}
                      onClick={() => {
                        setNavExpanded(false);
                        router.push(fullPath);
                      }}
                      style={{ height: "45px", width: "45px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", boxShadow: "0 0 4px rgba(0,0,0,0.2)", transition: "transform 0.2s" }}
                      onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)" }}
                  
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            Object.entries(navImages).map(([path, img]) => {
              const useLangPrefix = path !== "/map";
              const fullPath = useLangPrefix ? `/${language.toLowerCase()}${path}` : path;
              return (
                <img
                  key={path}
                  src={img}
                  alt={path}
                  onClick={() => router.push(fullPath)}
                  style={{ height: "45px", width: "45px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", boxShadow: "0 0 4px rgba(0,0,0,0.2)", transition: "transform 0.2s" }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)" }}
                  
                />
              );
            })
          )}
        </div>

        <div onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
          <img
            src="/images/adler1.png"
            alt="Startseite"
            style={{ height: "45px", width: "auto", borderRadius: "6px", boxShadow: "0 0 4px rgba(0,0,0,0.2)", transition: "transform 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          />
          <span style={{ fontSize: "18px", fontWeight: "bold", color: darkMode ? "#ffffff" : "#003366", userSelect: "none" }}>
            Road Eagle
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleAuthClick}
            style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' }}
          >
            {user ? '🚪' : '🚪❌'}
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{ padding: "4px 10px", backgroundColor: darkMode ? "#444" : "#ccc", color: darkMode ? "#fff" : "#000", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold", transition: "background 0.3s" }}
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>
      </div>

      {authOverlayOpen && !user && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setAuthOverlayOpen(false)}
              style={{ position: 'absolute', top: -40, right: 0, background: 'transparent', border: 'none', fontSize: 30, color: '#fff' }}>
              ×
            </button>
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, minWidth: 320 }}>
              <AuthForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
