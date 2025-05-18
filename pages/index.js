import { useRouter } from "next/router";
import { useAppContext } from "../contexts/AppContext";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { language, darkMode } = useAppContext();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#121212" : "#ffffff";
  }, [darkMode]);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const texts = {
    EN: {
      title: "Welcome Road Eagle!",
      explore: "Roads",
      map: "Map",
      slogan: "Discover hidden adventures and breathtaking routes across Switzerland."
    },
    DE: {
      title: "Willkommen Road Eagle!",
      explore: "Roads",
      map: "Map",
      slogan: "Entdecke versteckte Abenteuer und atemberaubende Routen in der Schweiz."
    },
    IT: {
      title: "Benvenuto Road Eagle!",
      explore: "Roads",
      map: "Map",
      slogan: "Scopri avventure nascoste e percorsi mozzafiato attraverso la Svizzera."
    },
    FR: {
      title: "Bienvenue Road Eagle!",
      explore: "Roads",
      map: "Map",
      slogan: "Découvrez des aventures cachées et des itinéraires à couper le souffle à travers la Suisse."
    }
  };

  const buttonStyle = (imgUrl) => ({
    backgroundImage: `url('${imgUrl}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    width: "100%",
    maxWidth: "300px",
    height: "200px",
    borderRadius: "16px",
    overflow: "hidden",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
    transition: "transform 0.3s ease, filter 0.3s ease",
    filter: "brightness(80%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    position: "relative"
  });

  const labelStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: "0px 16px",
    borderRadius: "0 0 12px 12px",
    color: "#ffffff",
    fontSize: "26px",
    fontWeight: 600,
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
    textShadow: "1px 1px 4px rgba(0,0,0,0.7)",
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center"
  };

  return (
    <div style={{
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
      color: darkMode ? "#e0e0e0" : "#222",
      minHeight: "100vh",
      transition: "all 0.6s ease",
      opacity: loaded ? 1 : 0,
    }}>
      {/* Panorama */}
      <div style={{
        backgroundImage: "url('/images/panorama.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textShadow: "2px 2px 8px rgba(0,0,0,0.7)",
        paddingTop: "60px"
      }}>
        <h1 style={{ fontSize: "48px", margin: "0 20px", color: "#fff" }}>
          {texts[language].title}
        </h1>
        <p style={{ marginTop: "20px", fontSize: "20px", color: "#ccc" }}>
          {texts[language].slogan}
        </p>
      </div>

      {/* Buttons */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "20px",
        marginTop: "40px",
        padding: "0 20px"
      }}>
        {[
          { text: texts[language].explore, img: "/images/passstrasse_motorrad_oldtimer_final.jpg", link: "/roadpage" },
          { text: texts[language].map, img: "/images/map_alpenkarte_roadtrip_corrected.jpg", link: "/map" },
          { text: "Community", img: "/images/feed.png", link: "/feed" },
          { text: "Challenge", img: "/images/challenge.png", link: "/challenge" },
        ].map(({ text, img, link }, i) => {
          const useLangPrefix = !["/map"].includes(link);
          const fullPath = useLangPrefix ? `/${language.toLowerCase()}${link}` : link;
          return (
            <div
              key={i}
              style={buttonStyle(img)}
              onClick={() => router.push(fullPath)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.filter = "brightness(100%)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.filter = "brightness(80%)";
              }}
            >
              <div style={labelStyle}>{text}</div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: "60px",
        padding: "20px",
        backgroundColor: darkMode ? "#1e1e1e" : "#f0f0f0",
        color: darkMode ? "#ccc" : "#444",
        fontSize: "14px",
        textAlign: "center",
        borderTop: `1px solid ${darkMode ? "#333" : "#ddd"}`
      }}>
        © {new Date().getFullYear()} Road Eagle &nbsp;|&nbsp;
        <a
          href="/impressum"
          style={{
            color: darkMode ? "#ccc" : "#333",
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Impressum
        </a>
      </footer>
    </div>
  );
}
