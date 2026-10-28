package com.example.vibemod.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import com.example.vibemod.domain.model.AccentColor
import com.example.vibemod.domain.model.ModPreferences
import com.example.vibemod.domain.model.ThemeMode

data class VibeExtras(
    val accent: Color = NeonBlue,
    val amoled: Boolean = true,
    val reducedMotion: Boolean = false,
    val animationScale: Float = 1f,
    val largeTouchTargets: Boolean = false,
    val highContrastText: Boolean = false,
    val hapticEnabled: Boolean = true,
)

val LocalVibeExtras = staticCompositionLocalOf { VibeExtras() }

@Composable
fun VibeModTheme(
    prefs: ModPreferences,
    content: @Composable () -> Unit,
) {
    val systemDark = isSystemInDarkTheme()
    val dark = when (prefs.themeMode) {
        ThemeMode.SYSTEM -> systemDark
        ThemeMode.LIGHT -> false
        ThemeMode.DARK, ThemeMode.AMOLED -> true
    }
    val amoled = prefs.effectiveAmoled() && dark
    val accent = Color(prefs.accentColor.colorLong)
    val background = when {
        !dark -> LightBackground
        amoled -> AmoledBlack
        else -> NearBlack
    }
    val surface = when {
        !dark -> LightSurface
        amoled -> AmoledBlack
        else -> SurfaceDark
    }
    val onBg = if (dark) TextPrimary else LightText
    val onSurface = if (prefs.highContrastText) {
        if (dark) Color.White else Color.Black
    } else {
        onBg
    }

    val scheme = if (dark) {
        darkColorScheme(
            primary = accent,
            onPrimary = Color.Black,
            secondary = NeonViolet,
            tertiary = NeonGold,
            background = background,
            surface = surface,
            surfaceVariant = SurfaceElevated,
            onBackground = onBg,
            onSurface = onSurface,
            onSurfaceVariant = TextSecondary,
            error = NeonRed,
            outline = TextSecondary.copy(alpha = 0.4f),
        )
    } else {
        lightColorScheme(
            primary = accent,
            onPrimary = Color.White,
            secondary = NeonViolet,
            tertiary = NeonGold,
            background = background,
            surface = surface,
            onBackground = onBg,
            onSurface = onSurface,
            error = NeonRed,
        )
    }

    CompositionLocalProvider(
        LocalVibeExtras provides VibeExtras(
            accent = accent,
            amoled = amoled,
            reducedMotion = prefs.reducedMotion,
            animationScale = prefs.animationMultiplier(),
            largeTouchTargets = prefs.largeTouchTargets,
            highContrastText = prefs.highContrastText,
            hapticEnabled = prefs.hapticFeedback,
        ),
    ) {
        MaterialTheme(
            colorScheme = scheme,
            typography = VibeTypography,
            content = content,
        )
    }
}

fun AccentColor.toColor(): Color = Color(colorLong)
