# JASON VPN PRO - Clé VPN en haut 🔑

Créé par **Jason Aloma** - Développeur Congolais 🇨🇩 - Kinshasa

## Fonctionnalité
Quand tu actives le VPN, la petite clé 🔑 sort en haut à côté du 4G/5G comme sur la capture!

## Comment ça marche
La clé est affichée par Android automatiquement quand `VpnService.Builder().establish()` est appelé.

## Installation
1. Clone: `git clone https://github.com/ton-user/jason-vpn-pro`
2. Ouvre dans Android Studio
3. Build APK
4. Installe et clique ACTIVER -> La clé apparaît!

## Code clé
```kotlin
val vpnInterface = Builder().setSession("JASON VPN PRO").addAddress("10.8.0.2",32).addRoute("0.0.0.0",0).establish()
// Cette ligne fait sortir la clé 🔑
