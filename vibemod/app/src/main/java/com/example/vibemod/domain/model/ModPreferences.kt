package com.example.vibemod.domain.model

enum class AccentColor(val displayName: String, val colorLong: Long) {
    NEON_BLUE("Neon Blue", 0xFF00D4FFL),
    VIOLET("Violet", 0xFFA855F7L),
    NEON_RED("Neon Red", 0xFFFF2D55L),
    GOLD("Gold", 0xFFFFD700L),
}

enum class ThemeMode {
    SYSTEM,
    DARK,
    LIGHT,
    AMOLED,
}

enum class NavStyle {
    LABELED,
    ICONS_ONLY,
    FLOATING,
}

enum class DoubleTapAction {
    LIKE,
    PLAY_PAUSE,
    SEEK_FORWARD,
    NONE,
}

data class ModPreferences(
    // Appearance
    val themeMode: ThemeMode = ThemeMode.AMOLED,
    val accentColor: AccentColor = AccentColor.NEON_BLUE,
    val amoledMode: Boolean = true,
    val showBottomLabels: Boolean = true,
    val navStyle: NavStyle = NavStyle.LABELED,
    val hideUsernameOverlay: Boolean = false,
    val hideDescriptionOverlay: Boolean = false,
    val hideActionRail: Boolean = false,
    val animationScale: Float = 1f,

    // Playback
    val defaultPlaybackSpeed: Float = 1f,
    val autoLoop: Boolean = true,
    val autoPlay: Boolean = true,
    val muteOnLaunch: Boolean = false,

    // Feed
    val videoSort: VideoSort = VideoSort.RECENT,
    val showDemoVideos: Boolean = true,
    val feedSwipeHaptics: Boolean = true,

    // Privacy
    val pinLockEnabled: Boolean = false,
    val pinHash: String = "",
    val clearSearchOnExit: Boolean = false,
    val rememberSearchHistory: Boolean = true,

    // Accessibility
    val reducedMotion: Boolean = false,
    val largeTouchTargets: Boolean = false,
    val highContrastText: Boolean = false,

    // Gestures
    val seekViaGestures: Boolean = true,
    val doubleTapAction: DoubleTapAction = DoubleTapAction.LIKE,
    val hapticFeedback: Boolean = true,

    // Badges
    val showBadgeInFeed: Boolean = true,
    val showBadgeOnProfile: Boolean = true,

    // Advanced
    val keepScreenOn: Boolean = true,
    val debugOverlay: Boolean = false,
) {
    fun effectiveAmoled(): Boolean = amoledMode || themeMode == ThemeMode.AMOLED

    fun clampedSpeed(): Float = defaultPlaybackSpeed.coerceIn(0.5f, 2f)

    fun animationMultiplier(): Float =
        if (reducedMotion) 0f else animationScale.coerceIn(0f, 1.5f)
}
