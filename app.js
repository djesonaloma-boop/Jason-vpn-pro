
"use strict";

/* ==========================================
   JASON VPN PRO
   Créé par Jason Aloma 🇨🇩
   Gestion de l'interface et de l'API
========================================== */

const JASON_VPN_CONFIG = {
  // Remplace par l'URL réelle après le déploiement Vercel.
  apiBaseUrl: "",

  appName: "JASON VPN PRO",
  version: "1.0.0",

  // Aucun serveur n'est considéré comme connecté
  // tant qu'une véritable connexion VPN n'est pas vérifiée.
  initialStatus: "disconnected"
};

const JASON_VPN_SERVERS = [
  {
    id: "auto",
    name: "Automatique",
    location: "Sélection automatique",
    configured: false
  },
  {
    id: "kinshasa",
    name: "Kinshasa",
    location: "RDC",
    configured: false
  },
  {
    id: "europe",
    name: "Europe",
    location: "Europe",
    configured: false
  },
  {
    id: "afrique",
    name: "Afrique",
    location: "Afrique",
    configured: false
  }
];

const JasonVPN = (() => {
  let status = JASON_VPN_CONFIG.initialStatus;
  let selectedServer = "auto";
  let requestController = null;

  const $ = id => document.getElementById(id);

  function showToast(message) {
    const toast = $("toast");

    if (!toast) {
      console.log("[JASON VPN]", message);
      return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  function renderStatus() {
    const connected = status === "connected";
    const connecting = status === "connecting";

    if ($("headerStatus")) {
      $("headerStatus").textContent =
        connected ? "CONNECTÉ" :
        connecting ? "VÉRIFICATION" :
        "DÉCONNECTÉ";
    }

    if ($("statusDot")) {
      $("statusDot").classList.toggle("active", connected);
    }

    if ($("vpnRing")) {
      $("vpnRing").classList.toggle("connected", connected);
      $("vpnRing").classList.toggle("connecting", connecting);
    }

    if ($("connectionTitle")) {
      $("connectionTitle").textContent =
        connected ? "Tunnel VPN actif" :
        connecting ? "Vérification en cours..." :
        "VPN non connecté";
    }

    if ($("connectionDesc")) {
      $("connectionDesc").textContent =
        connected
          ? "L'état du tunnel a été confirmé par le moteur VPN."
          : "Aucun tunnel VPN actif n'a été confirmé par cette interface.";
    }

    if ($("connectBtn")) {
      $("connectBtn").textContent =
        connecting ? "VÉRIFICATION..." : "VÉRIFIER LE VPN";

      $("connectBtn").disabled = connecting;
    }
  }

  function getSelectedServer() {
    return JASON_VPN_SERVERS.find(
      server => server.id === selectedServer
    ) || JASON_VPN_SERVERS[0];
  }

  function updateServer() {
    const server = getSelectedServer();

    if ($("serverDescription")) {
      $("serverDescription").textContent =
        server.configured
          ? server.location
          : server.name + " — serveur à configurer";
    }
  }

  async function checkAPI() {
    const base = JASON_VPN_CONFIG.apiBaseUrl.replace(/\/+$/, "");

    if (!base) {
      showToast("Configure d'abord l'URL de l'API Vercel.");
      return {
        success: false,
        reason: "api_url_missing"
      };
    }

    if (requestController) {
      requestController.abort();
    }

    requestController = new AbortController();

    const timeout = setTimeout(() => {
      requestController.abort();
    }, 8000);

    try {
      const response = await fetch(base + "/api/health", {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        signal: requestController.signal
      });

      if (!response.ok) {
        throw new Error("API indisponible : HTTP " + response.status);
      }

      const data = await response.json();

      if (!data.success || data.status !== "online") {
        throw new Error("L'API n'a pas confirmé son état.");
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        reason: error.name === "AbortError"
          ? "timeout"
          : error.message
      };
    } finally {
      clearTimeout(timeout);
      requestController = null;
    }
  }

  async function checkVPN() {
    status = "connecting";
    renderStatus();

    const result = await checkAPI();

    // Une API accessible ne prouve pas qu'un tunnel
    // WireGuard fonctionne. Ne jamais déclarer connecté ici.
    status = "disconnected";
    renderStatus();

    if (result.success) {
      showToast(
        "API accessible. Le tunnel WireGuard reste à vérifier sur Android."
      );
    } else {
      const reason = result.reason === "api_url_missing"
        ? "URL API non configurée."
        : "Impossible de vérifier l'API. Vérifie l'URL et ta connexion.";

      showToast(reason);
    }

    return result;
  }

  function init() {
    const selector = $("serverSelect");

    if (selector) {
      selector.addEventListener("change", event => {
        selectedServer = event.target.value;
        updateServer();
      });
    }

    const connectButton = $("connectBtn");

    if (connectButton) {
      // Remplace le gestionnaire précédent de index.html.
      connectButton.onclick = checkVPN;
    }

    updateServer();
    renderStatus();

    console.log(
      JASON_VPN_CONFIG.appName + " v" +
      JASON_VPN_CONFIG.version + " initialisé."
    );
  }

  return {
    init,
    checkAPI,
    checkVPN,
    getSelectedServer,
    getStatus: () => status
  };
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", JasonVPN.init);
} else {
  JasonVPN.init();
}
