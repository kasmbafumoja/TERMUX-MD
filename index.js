const express = require("express");
const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Page d'accueil
app.get("/", (req, res) => {
  res.send(`
    <div style="text-align:center; font-family:Arial; background:#111; color:white; padding:20px;">
      <h1>🔰 Bienvenue sur TERMUX-MD 🔰</h1>
      <h3>Créé par <span style="color:#1BAFBA;">Kasereka Mbafumoja 🇨🇩</span></h3>
      <p>Cliquez ci-dessous pour générer votre code Pair et connecter votre WhatsApp au bot.</p>
      <a href="/pair" style="background:#FF6347; color:white; padding:12px 25px; text-decoration:none; border-radius:5px;">
        🚀 Générer mon Code Pair
      </a>
    </div>
  `);
});

// Route pour générer le Pair Code
app.get("/pair", async (req, res) => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("session_auth");
    const sock = makeWASocket({ auth: state });

    sock.ev.on("connection.update", async (update) => {
      const { qr } = update;
      if (qr) {
        const qrImage = await qrcode.toDataURL(qr);
        res.send(`
          <div style="text-align:center; font-family:Arial; background:#111; color:white; padding:20px;">
            <h2>📱 Scannez ce QR Code avec WhatsApp</h2>
            <img src="${qrImage}" width="300" height="300" />
            <p style="margin-top:15px;">✅ Bot : <b>TERMUX-MD</b></p>
            <p>👨‍💻 Créateur : <b>Kasereka Mbafumoja</b></p>
            <p>🇨🇩 République Démocratique du Congo</p>
            <a href="/" style="color:#1BAFBA;">⬅️ Retour à l'accueil</a>
          </div>
        `);
      }
    });

    sock.ev.on("creds.update", saveCreds);
  } catch (err) {
    res.send(`
      <div style="text-align:center; color:red;">
        ❌ Erreur lors de la génération du code Pair : ${err.message}
      </div>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`✅ TERMUX-MD Pair Server en ligne sur http://localhost:${PORT}`);
});
