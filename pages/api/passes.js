// pages/api/passes.js
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "passes.json");

export default function handler(req, res) {
  try {
    res.setHeader("Cache-Control", "no-store"); // wichtig für Live-Aktualisierung

    if (req.method === "GET") {
      const jsonData = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(jsonData);
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const jsonData = fs.readFileSync(filePath, "utf-8");
      let data = JSON.parse(jsonData);

      const { newPass, deleteIndex } = req.body;

      if (newPass) {
        if (!newPass.name || !newPass.coords || !Array.isArray(newPass.coords)) {
          return res.status(400).json({ error: "Ungültiges Pass-Objekt" });
        }
        data.push(newPass);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return res.status(201).json({ success: true, message: "Pass hinzugefügt" });
      }

      if (typeof deleteIndex === "number") {
        if (deleteIndex < 0 || deleteIndex >= data.length) {
          return res.status(400).json({ error: "Ungültiger Index" });
        }
        data.splice(deleteIndex, 1);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return res.status(200).json({ success: true, message: "Pass gelöscht" });
      }

      if (Array.isArray(req.body)) {
        fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
        return res.status(200).json({ success: true, message: "Datei aktualisiert" });
      }

      return res.status(400).json({ error: "Ungültige Anfrage" });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("API Fehler:", err);
    return res.status(500).json({ error: "Serverfehler beim Verarbeiten der Anfrage." });
  }
}
