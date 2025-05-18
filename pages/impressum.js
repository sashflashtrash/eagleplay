// pages/impressum.js
import { useAppContext } from "../contexts/AppContext";

export default function Impressum() {
  const { darkMode } = useAppContext();

  return (
    <div style={{
      padding: "40px",
      maxWidth: "900px",
      margin: "auto",
      color: darkMode ? "#ddd" : "#222",
      fontFamily: "Arial, sans-serif",
      lineHeight: 1.7,
    }}>
      <h1 style={{ fontSize: "32px", marginBottom: "30px" }}>Impressum</h1>

      <h2>Haftungsausschluss</h2>
      <p>
        Die Inhalte dieser Website wurden mit grösstmöglicher Sorgfalt erstellt. Dennoch kann keine Gewähr hinsichtlich der
        inhaltlichen Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit dieser Informationen
        übernommen werden.
      </p>
      <p>
        Haftungsansprüche gegen den Betreiber der Website wegen Schäden materieller oder immaterieller Art, welche aus dem Zugriff
        oder der Nutzung bzw. Nichtnutzung der veröffentlichten Informationen, durch Missbrauch der Verbindung oder durch
        technische Störungen entstanden sind, werden ausgeschlossen.
      </p>
      <p>
        Alle Angebote sind freibleibend und unverbindlich. Der Betreiber behält sich ausdrücklich vor, Teile der Seiten oder das
        gesamte Angebot ohne besondere Ankündigung zu verändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder
        endgültig einzustellen.
      </p>
      <p>
        Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres Verantwortungsbereichs. Der Zugriff und die Nutzung
        solcher Webseiten erfolgen auf eigene Gefahr. Jegliche Verantwortung für solche Webseiten wird abgelehnt.
      </p>

      <h2>Datenschutzerklärung</h2>
      <p>
        Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Wir behandeln Ihre personenbezogenen Daten vertraulich
        und entsprechend den gesetzlichen Datenschutzbestimmungen der Schweiz (nDSG) sowie dieser Datenschutzerklärung.
      </p>

      <h3>Zugriffsdaten</h3>
      <p>
        Beim Zugriff auf unsere Website werden folgende Daten in Logfiles gespeichert: IP-Adresse, Datum, Uhrzeit, Browser-Anfrage
        und allgemeine Informationen zum Betriebssystem bzw. Browser. Diese Daten dienen der technischen Analyse und zur
        Gewährleistung der Sicherheit.
      </p>

      <h3>Cookies</h3>
      <p>
        Diese Website verwendet Cookies, um bestimmte Funktionen zu ermöglichen und die Nutzererfahrung zu verbessern. Sie können
        die Verwendung von Cookies in den Einstellungen Ihres Browsers deaktivieren.
      </p>

      <h3>Personenbezogene Daten</h3>
      <p>
        Wir erfassen nur personenbezogene Daten, die Sie uns freiwillig übermitteln (z. B. per Kontaktformular oder E-Mail).
        Diese Daten werden ausschliesslich zur Bearbeitung Ihrer Anfrage verwendet und nicht an Dritte weitergegeben, es sei denn,
        dies ist gesetzlich vorgeschrieben.
      </p>

  

      <h3>Hosting</h3>
      <p>
        Die Website wird bei einem in der Schweiz oder EU ansässigen Anbieter gehostet. Es gelten die Datenschutzrichtlinien des
        jeweiligen Hostinganbieters.
      </p>

      <h3>Änderungen</h3>
      <p>
        Wir behalten uns das Recht vor, diese Datenschutzerklärung bei Bedarf anzupassen.
      </p>

      <h2>Urheberrechte</h2>
      <p>
        Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf dieser Website gehören
        ausschliesslich dem Betreiber dieser Website. Inhalte Dritter sind entsprechend gekennzeichnet. Für die Reproduktion jeglicher
        Elemente ist die schriftliche Zustimmung der Urheberrechtsträger im Voraus einzuholen.
      </p>
      <p>
        Jegliche kommerzielle Nutzung oder Weiterverwendung der Inhalte ist ohne ausdrückliche Genehmigung untersagt. Verstösse
        gegen das Urheberrecht können rechtlich verfolgt werden.
      </p>

      <h2>Kontakt</h2>
      <p>
        Beyond Swiss Roads<br />
        kontakt@beyondswissroads.ch
      </p>

      <h2>Verantwortlich für den Inhalt</h2>
      <p>
        [Vor- und Nachname]<br />
        [Strasse und Hausnummer]<br />
        [PLZ und Ort]<br />
        Schweiz
      </p>

      <div style={{ marginTop: "60px", padding: "20px", borderTop: `1px solid ${darkMode ? "#444" : "#ccc"}` }}>
        <p style={{ fontSize: "14px", textAlign: "center" }}>
          © {new Date().getFullYear()} Road Eagle | Alle Rechte vorbehalten
        </p>
      </div>
    </div>
  );
}
