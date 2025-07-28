const express = require("express");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

let qrCodeData = null;
let sessionId = null;

app.get("/", (req, res) => {
  res.send(`
    <div style="text-align:center; font-family:Arial; background:#111; color:white; padding:20px;">
      <h1>🔰 Bienvenue sur TERMUX-MD 🔰</h1>
      <h3>Créé par <span style="color:#1BAFBA;">Kasereka Mbafumoja 🇨🇩</span></h3>
      <p>Cliquez ci-dessous pour générer ou récupérer votre SESSION_ID.</p>
      <a href="/pair" style="background:#FF6347; color:white; padding:12px 25px; text-decoration:none; border-radius:5px;">
        🚀 Générer mon Code Pair
      </a>
      <br/><br/>
      <a href="/session" style="background:#1BAFBA; color:white; padding:12px 25px; text-decoration:none; border-radius:5px;">
        📋 Voir mon SESSION_ID
      </a>
    </div>
  `);
});

app.get("/pair", async (req, res) => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("session_auth");
    const sock = makeWASocket({ auth: state });

    // Vérifie si un fichier de session existe déjà
    if (fs.existsSync("session_auth/creds.json")) {
      sessionId = fs.readFileSync("session_auth/creds.json").toString("base64");
      return res.redirect("/session");
    }

    sock.ev.on("connection.update", async (update) => {
      const { qr, connection } = update;

      if (qr) {
        qrCodeData = await qrcode.toDataURL(qr);
        res.send(`
          <div style="text-align:center; font-family:Arial; background:#111; color:white; padding:20px;">
            <h2>📱 Scannez ce QR Code avec WhatsApp</h2>
            <img src="${qrCodeData}" width="300" height="300" />
            <p>Après le scan, votre SESSION_ID sera généré automatiquement ✅</p>
          </div>
        `);
      }

      if (connection === "open") {
        sessionId = fs.readFileSync("session_auth/creds.json").toString("base64");
        console.log("✅ SESSION_ID généré et sauvegardé !");
      }
    });

    sock.ev.on("creds.update", saveCreds);
  } catch (err) {
    res.send(`<div style="color:red; text-align:center;">❌ Erreur: ${err.message}</div>`);
  }
});

app.get("/session", (req, res) => {
  if (sessionId) {
    res.send(`
      <div style="text-align:center; font-family:Arial; background:#222; color:#0f0; padding:20px;">
        <h2>✅ Votre SESSION_ID TERMUX-MD</h2>
        <textarea style="width:90%; height:200px;" readonly>${sessionId}</textarea>
        <p>Copiez et collez ce SESSION_ID dans votre fichier <b>config.js</b></p>
        <button onclick="navigator.clipboard.writeText('${sessionId}')"
          style="margin-top:15px; background:#1BAFBA; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer;">
          📋 Copier le SESSION_ID
        </button>
      </div>
    `);
  } else {
    res.send(`<div style="text-align:center; color:red;">❌ Aucun SESSION_ID généré pour l'instant. <a href="/pair">Scanner un QR</a></div>`);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur TERMUX-MD lancé sur http://localhost:${PORT}`);
});
