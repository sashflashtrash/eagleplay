// pages/feed.js
import Navbar from "../components/Navbar";
import { useAppContext } from "../contexts/AppContext";

export default function FeedPage() {
  const { darkMode } = useAppContext();

  return (
    <div style={{
      backgroundColor: darkMode ? "#121212" : "#ffffff",
      color: darkMode ? "#e0e0e0" : "#222",
      minHeight: "100vh",
      margin: 0,
      padding: 0,
      fontFamily: "Arial, sans-serif"
    }}>
      <Navbar />
      <div style={{
        position: "relative",
        width: "100%",
        height: "66vh",
        backgroundImage: "url('/images/roadpic.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start"
      }}>
        <h1 style={{
          marginTop: "40px",
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "#fff",
          padding: "16px 24px",
          borderRadius: "12px",
          fontSize: "28px",
          textAlign: "center",
          maxWidth: "90%"
        }}>
          coming soon – now I'm going for a ride
        </h1>
      </div>
    </div>
  );
}