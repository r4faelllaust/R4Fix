package com.example.vibemod.domain.model

data class VideoItem(
    val id: String,
    val title: String,
    val description: String,
    val authorName: String,
    val uri: String,
    val thumbnailUri: String? = null,
    val durationMs: Long = 0L,
    val category: String = "General",
    val isDemo: Boolean = false,
    val isFavorite: Boolean = false,
    val collection: String? = null,
    val importedAt: Long = System.currentTimeMillis(),
    val fileMissing: Boolean = false,
)

enum class VideoSort {
    RECENT,
    TITLE,
    DURATION,
    FAVORITES_FIRST,
}

enum class VideoFilter {
    ALL,
    FAVORITES,
    DEMO,
    IMPORTED,
}
