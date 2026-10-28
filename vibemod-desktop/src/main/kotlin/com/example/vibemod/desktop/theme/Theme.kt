package com.example.vibemod.desktop.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import com.example.vibemod.desktop.model.ModPreferences
import com.example.vibemod.desktop.model.ThemeMode

data class VibeExtras(val accent: Color = Color(0xFF00D4FF), val amoled: Boolean = true)

val LocalVibeExtras = staticCompositionLocalOf { VibeExtras() }

@Composable
fun VibeModTheme(prefs: ModPreferences, content: @Composable () -> Unit) {
    val dark = when (prefs.themeMode) {
        ThemeMode.LIGHT -> false
        ThemeMode.SYSTEM, ThemeMode.DARK, ThemeMode.AMOLED -> true
    }
    val amoled = prefs.amoled || prefs.themeMode == ThemeMode.AMOLED
    val accent = Color(prefs.accent.color)
    val bg = when {
        !dark -> Color(0xFFF7F7FB)
        amoled -> Color.Black
        else -> Color(0xFF0A0A0F)
    }
    val scheme = if (dark) {
        darkColorScheme(
            primary = accent,
            secondary = Color(0xFFA855F7),
            tertiary = Color(0xFFFFD700),
            background = bg,
            surface = if (amoled) Color.Black else Color(0xFF12121A),
            error = Color(0xFFFF2D55),
        )
    } else {
        lightColorScheme(
            primary = accent,
            background = bg,
            surface = Color.White,
            error = Color(0xFFFF2D55),
        )
    }
    CompositionLocalProvider(LocalVibeExtras provides VibeExtras(accent, amoled && dark)) {
        MaterialTheme(colorScheme = scheme, content = content)
    }
}
