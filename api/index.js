
"use strict";

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================================
   JASON VPN PRO — BACKEND API
   Créé par Jason Aloma 🇨🇩
========================================= */

app.disable("x-powered-by");

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10kb" }));

const START_TIME = Date.now();
const API_VERSION = "1.0.0";

/* =========================================
   CONFIGURATION SERVEURS
   Ajouter les véritables serveurs dans .env
========================================= */

function loadServers() {
  const raw = process.env.VPN_SERVERS;

  if (!raw) return [];

  try {
    const servers = JSON.parse(raw);

    if (!Array.isArray(servers)) return [];

    return servers
      .filter(s =>
        s &&
        typeof s.id === "string" &&
        typeof s.name === "string" &&
        typeof s.country === "string" &&
        typeof s.endpoint === "string" &&
        /^[a-zA-Z0-9.-]+:\d{1,5}$/.test(s.endpoint)
      )
      .map(s => ({
        id: s.id,
        name: s.name,
        country: s.country,
        endpoint: s.endpoint,
        protocol: "WireGuard"
      }));
  } catch {
    console.error("VPN_SERVERS contient un JSON invalide.");
    return [];
  }
}

/* =========================================
   AUTHENTIFICATION ADMIN OPTIONNELLE
========================================= */

function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  const supplied = req.get("Authorization") || "";
  const prefix = "Bearer ";

  if (!expected) {
    return res.status(503).json({
      success: false,
      error: "Administration non configurée."
    });
  }

  if (!supplied.startsWith(prefix)) {
    return res.status(401).json({
      success: false,
      error: "Authentification requise."
    });
  }

  const actual = Buffer.from(supplied.slice(prefix.length));
  const wanted = Buffer.from(expected);

  if (
    actual.length !== wanted.length ||
    !crypto.timingSafeEqual(actual, wanted)
  ) {
    return res.status(401).json({
      success: false,
      error: "Authentification invalide."
    });
  }

  next();
}

/* =========================================
   ROUTES PUBLIQUES
========================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "JASON VPN PRO",
    creator: "Jason Aloma",
    country: "République démocratique du Congo",
    message: "Bienvenue sur l'API JASON VPN PRO.",
    version: API_VERSION,
    endpoints: [
      "/api/health",
      "/api/servers",
      "/api/status"
    ]
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    api: "JASON VPN PRO",
    status: "online",
    uptimeSeconds: Math.floor(
      (Date.now() - START_TIME) / 1000
    ),
    timestamp: new Date().toISOString()
  });
});

/* Liste des serveurs configurés.
   Les adresses sont publiques, sans clés privées. */

app.get("/api/servers", (req, res) => {
  const servers = loadServers();

  res.json({
    success: true,
    count: servers.length,
    servers,
    message: servers.length
      ? "Serveurs configurés."
      : "Aucun serveur VPN configuré."
  });
});

/* État honnête du service :
   l'API en ligne ne prouve pas qu'un tunnel fonctionne. */

app.get("/api/status", (req, res) => {
  const servers = loadServers();

  res.json({
    success: true,
    api: "online",
    wireguardConfigured: servers.length > 0,
    tunnelEstablished: false,
    message: "L'état réel du tunnel doit être vérifié sur le client Android."
  });
});

/* =========================================
   ROUTE ADMIN — INFORMATIONS DE DIAGNOSTIC
========================================= */

app.get("/api/admin/diagnostics", requireAdmin, (req, res) => {
  res.json({
    success: true,
    api: "JASON VPN PRO",
    uptimeSeconds: Math.floor(
      (Date.now() - START_TIME) / 1000
    ),
    configuredServerCount: loadServers().length,
    tunnelStatus: "Non vérifié par ce backend"
  });
});

/* =========================================
   ERREURS
========================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route introuvable."
  });
});

app.use((err, req, res, next) => {
  console.error("Erreur API :", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    error: "Erreur interne du serveur."
  });
});

/* =========================================
   DÉMARRAGE
========================================= */

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log("================================");
    console.log(" JASON VPN PRO API");
    console.log(" Créé par Jason Aloma 🇨🇩");
    console.log(` Serveur démarré sur le port ${PORT}`);
    console.log("================================");
  });
}

module.exports = app;
