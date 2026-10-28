package com.example.vibemod.desktop.model

enum class BadgeStyle(val displayName: String, val color: Long, val label: String) {
    NONE("None", 0x00000000L, ""),
    BLUE("Blue", 0xFF00D4FFL, "Blue"),
    GOLD("Gold", 0xFFFFD700L, "Gold"),
    PURPLE("Purple", 0xFFA855F7L, "Purple"),
    CREATOR("Creator", 0xFFFF2D55L, "Creator"),
    DEVELOPER("Developer", 0xFF22C55EL, "Dev");

    val isDecoration get() = this != NONE
}

enum class AccentColor(val displayName: String, val color: Long) {
    NEON_BLUE("Neon Blue", 0xFF00D4FFL),
    VIOLET("Violet", 0xFFA855F7L),
    NEON_RED("Neon Red", 0xFFFF2D55L),
    GOLD("Gold", 0xFFFFD700L),
}

enum class ThemeMode { SYSTEM, DARK, LIGHT, AMOLED }

data class ModPreferences(
    val themeMode: ThemeMode = ThemeMode.AMOLED,
    val accent: AccentColor = AccentColor.NEON_BLUE,
    val amoled: Boolean = true,
    val autoLoop: Boolean = true,
    val autoPlay: Boolean = true,
    val muteOnLaunch: Boolean = false,
    val defaultSpeed: Float = 1f,
    val showDemo: Boolean = true,
    val showBadgeInFeed: Boolean = true,
    val showBadgeOnProfile: Boolean = true,
    val reducedMotion: Boolean = false,
)

data class UserProfile(
    val username: String = "Local Creator",
    val biography: String = "Windows desktop build — local files only. Stats are local/demo.",
    val badge: BadgeStyle = BadgeStyle.NONE,
)

data class VideoItem(
    val id: String,
    val title: String,
    val description: String,
    val author: String,
    val pathOrUrl: String,
    val isDemo: Boolean = false,
    val isFavorite: Boolean = false,
    val category: String = "General",
)

object Branding {
    const val APP_NAME = "VibeMod"
    const val TAGLINE = "Your vibe. Your videos. Local-first."
    const val BADGE_DISCLAIMER =
        "Badges are custom local decoration only — not official verification."
    const val ABOUT =
        "VibeMod Desktop is an original local-first short-video player. " +
            "Not affiliated with TikTok or ByteDance."
}
