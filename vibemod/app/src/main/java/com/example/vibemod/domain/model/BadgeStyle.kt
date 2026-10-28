package com.example.vibemod.domain.model

/**
 * Local visual badge styles. Never claim official verification.
 */
enum class BadgeStyle(
    val displayName: String,
    val accentHex: Long,
    val label: String,
) {
    NONE("None", 0x00000000L, ""),
    BLUE("Blue", 0xFF00D4FFL, "Blue"),
    GOLD("Gold", 0xFFFFD700L, "Gold"),
    PURPLE("Purple", 0xFFA855F7L, "Purple"),
    CREATOR("Creator", 0xFFFF2D55L, "Creator"),
    DEVELOPER("Developer", 0xFF22C55EL, "Dev");

    val isDecoration: Boolean get() = this != NONE
}
