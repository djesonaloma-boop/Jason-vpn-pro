package com.jason.business

import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private val VPN_REQUEST = 101
    private lateinit var btnVpn: Button
    private lateinit var statusText: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        btnVpn = findViewById(R.id.btnVpn)
        statusText = findViewById(R.id.statusText)

        updateUI()

        btnVpn.setOnClickListener {
            toggleVpn()
        }
    }

    private fun toggleVpn() {
        if (JasonVpnService.isConnected) {
            // DÉCONNECTER - La clé va disparaître
            val intent = Intent(this, JasonVpnService::class.java)
            intent.action = JasonVpnService.ACTION_DISCONNECT
            startService(intent)
            statusText.text = "Déconnecté"
            btnVpn.text = "🔑 ACTIVER JASON VPN PRO"
            btnVpn.setBackgroundColor(ContextCompat.getColor(this, android.R.color.holo_green_dark))
        } else {
            // CONNECTER - La clé va apparaître
            val prepare = VpnService.prepare(this)
            if (prepare != null) {
                startActivityForResult(prepare, VPN_REQUEST)
            } else {
                startVpnService()
            }
        }
    }

    private fun startVpnService() {
        val intent = Intent(this, JasonVpnService::class.java)
        intent.action = JasonVpnService.ACTION_CONNECT
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ContextCompat.startForegroundService(this, intent)
        } else {
            startService(intent)
        }
        statusText.text = "✅ Connecté - Clé 🔑 en haut"
        btnVpn.text = "❌ DÉCONNECTER"
        btnVpn.setBackgroundColor(ContextCompat.getColor(this, android.R.color.holo_red_dark))
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == VPN_REQUEST && resultCode == RESULT_OK) {
            startVpnService()
        }
    }

    private fun updateUI() {
        if (JasonVpnService.isConnected) {
            statusText.text = "✅ Connecté - Clé 🔑 en haut"
            btnVpn.text = "❌ DÉCONNECTER"
        } else {
            statusText.text = "Déconnecté"
            btnVpn.text = "🔑 ACTIVER JASON VPN PRO"
        }
    }

    override fun onResume() {
        super.onResume()
        updateUI()
    }
}
