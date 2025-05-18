import { AppWrapper, useAppContext } from "../contexts/AppContext";
import { AuthProvider } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import "../styles/globals.css";
import { useEffect } from "react";

// 🔧 Darkmode-Logik als Wrapper-Komponente
function AppWithDarkMode({ children }) {
  const { darkMode } = useAppContext();

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#121212" : "#ffffff";
    document.body.style.color = darkMode ? "#e0e0e0" : "#222222";
  }, [darkMode]);

  return children;
}

function MyApp({ Component, pageProps }) {
  return (
    <AppWrapper>
      <AuthProvider>
        <AppWithDarkMode>
          <Navbar />
          <div style={{ paddingTop: "60px" }}>
            <Component {...pageProps} />
          </div>
        </AppWithDarkMode>
      </AuthProvider>
    </AppWrapper>
  );
}

export default MyApp;
