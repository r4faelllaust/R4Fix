package com.example.vibemod.domain.model

data class UserProfile(
    val username: String = "Local Creator",
    val biography: String = "Videos stay on this device. Stats below are local/demo.",
    val avatarUri: String? = null,
    val badgeStyle: BadgeStyle = BadgeStyle.NONE,
    val localVideoCount: Int = 0,
    val favoriteCount: Int = 0,
    val demoViews: Int = 0,
) {
    val statsAreLocalOnly: Boolean = true
}
