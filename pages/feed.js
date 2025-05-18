import { useState, useEffect } from "react";

export default function TestScrollPage() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
<div
  onClick={() => alert("click funktioniert")}
  style={{
    position: "fixed",
    right: "0",
    bottom: "0",
    backgroundColor: "red",
    width: "100px",
    height: "100px",
    zIndex: 99999,
    cursor: "pointer"
  }}
>
  Klick mich
</div>


  );
}