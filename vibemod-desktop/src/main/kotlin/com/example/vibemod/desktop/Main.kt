package com.example.vibemod.desktop

import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState
import com.example.vibemod.desktop.data.AppStore
import com.example.vibemod.desktop.model.Branding
import com.example.vibemod.desktop.theme.VibeModTheme
import com.example.vibemod.desktop.ui.VibeModDesktopApp

fun main() = application {
    val store = AppStore()
    val prefs by store.prefs.collectAsState()
    Window(
        onCloseRequest = ::exitApplication,
        title = "${Branding.APP_NAME} — Desktop",
        state = rememberWindowState(width = 1280.dp, height = 800.dp),
    ) {
        VibeModTheme(prefs) {
            VibeModDesktopApp(store)
        }
    }
}
