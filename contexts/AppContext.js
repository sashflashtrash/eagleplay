import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";

const AppContext = createContext();

const legendText = {
  de: {
    legend: "Legende",
    autoZoom: "Autozoom",
    labels: {
      open: "🟢 Pass offen",
      closed: "🔴 Pass zu",
      route: "🔵 Routen",
      tour: "🟡 Tour",
      poi: "🟠 Sehenswürdigkeit"
    }
  },
  en: {
    legend: "Legend",
    autoZoom: "Autozoom",
    labels: {
      open: "🟢 Pass open",
      closed: "🔴 Pass closed",
      route: "🔵 Routes",
      tour: "🟡 Tour",
      poi: "🟠 Scenic spot"
    }
  },
  fr: {
    legend: "Légende",
    autoZoom: "Zoom auto",
    labels: {
      open: "🟢 Col ouvert",
      closed: "🔴 Col fermé",
      route: "🔵 Itinéraires",
      tour: "🟡 Tour",
      poi: "🟠 Point d'intérêt"
    }
  },
  it: {
    legend: "Legenda",
    autoZoom: "Zoom automatico",
    labels: {
      open: "🟢 Passo aperto",
      closed: "🔴 Passo chiuso",
      route: "🔵 Percorsi",
      tour: "🟡 Tour",
      poi: "🟠 Punto panoramico"
    }
  }
};

export function AppProvider({ children }) {
  const [language, setLanguage] = useState("EN");
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const router = useRouter();

  useEffect(() => {
    const urlLang = router.pathname.split("/")[1];

    const cookieLang = document.cookie
      .split("; ")
      .find((row) => row.startsWith("lang="))
      ?.split("=")[1];

    const savedLang = localStorage.getItem("language");
    const savedMode = localStorage.getItem("darkMode");

    if (["de", "en", "fr", "it"].includes(urlLang)) {
      setLanguage(urlLang.toUpperCase());
    } else if (cookieLang && ["de", "en", "fr", "it"].includes(cookieLang.toLowerCase())) {
      setLanguage(cookieLang.toUpperCase());
    } else if (savedLang) {
      setLanguage(savedLang);
    }

    if (savedMode) setDarkMode(savedMode === "true");
  }, [router.pathname]);

  useEffect(() => {
    localStorage.setItem("language", language);
    localStorage.setItem("darkMode", darkMode);
  }, [language, darkMode]);

  return (
    <AppContext.Provider value={{ language, setLanguage, darkMode, setDarkMode, legendText }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

export const AppWrapper = ({ children }) => (
  <AppProvider>{children}</AppProvider>
);
