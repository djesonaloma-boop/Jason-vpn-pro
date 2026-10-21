package com.jason.business

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import androidx.core.app.NotificationCompat

class JasonVpnService : VpnService() {

    private var vpnInterface: ParcelFileDescriptor? = null
    private var isRunning = false

    companion object {
        const val CHANNEL_ID = "jason_vpn_channel"
        const val NOTIF_ID = 101
        var isConnected = false
        const val ACTION_CONNECT = "CONNECT"
        const val ACTION_DISCONNECT = "DISCONNECT"
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_DISCONNECT) {
            stopVpn()
            return START_NOT_STICKY
        }
        if (!isRunning) startVpn()
        return START_STICKY
    }

    private fun startVpn() {
        try {
            createChannel()
            val notif = NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("JASON VPN PRO 🔑")
                .setContentText("Connecté • Clé active en haut • Kinshasa 🇨🇩")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build()
            startForeground(NOTIF_ID, notif)

            // CONFIG QUI FAIT SORTIR LA CLÉ 🔑
            val builder = Builder()
                .setSession("JASON VPN PRO")
                .addAddress("10.8.0.2", 32)
                .addRoute("0.0.0.0", 0)
                .addDnsServer("1.1.1.1")
                .addDnsServer("8.8.8.8")
                .setMtu(1500)
                .setBlocking(false)

            // CETTE LIGNE = CLÉ QUI SORT EN HAUT À CÔTÉ DU 4G!
            vpnInterface = builder.establish()

            if (vpnInterface == null) {
                stopSelf()
                return
            }

            isRunning = true
            isConnected = true

            // ICI CONNECTE TON SERVEUR V2RAY / WIREGUARD / OPEN VPN
            // Ex: Thread { handleTunnel(vpnInterface) }.start()

        } catch (e: Exception) {
            e.printStackTrace()
            stopVpn()
        }
    }

    private fun stopVpn() {
        isRunning = false
        isConnected = false
        try { vpnInterface?.close() } catch (_: Exception) {}
        vpnInterface = null
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(CHANNEL_ID, "JASON VPN PRO", NotificationManager.IMPORTANCE_LOW)
            ch.description = "VPN Connecté"
            getSystemService(NotificationManager::class.java).createNotificationChannel(ch)
        }
    }

    override fun onDestroy() {
        stopVpn()
        super.onDestroy()
    }
}
