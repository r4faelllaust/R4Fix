package com.example.vibemod.data.demo

import com.example.vibemod.domain.model.VideoItem

/**
 * Clearly labeled demo catalog. URIs use Android raw/asset placeholders or
 * well-known royalty-free sample streams when network is available for demos.
 * Offline, missing files are marked [VideoItem.fileMissing] by the repository.
 */
object DemoVideos {
    fun catalog(): List<VideoItem> = listOf(
        VideoItem(
            id = "demo_bigbuck",
            title = "Big Buck Bunny (Demo)",
            description = "Open movie sample — labeled demo content for local playback testing.",
            authorName = "Blender Foundation",
            uri = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            durationMs = 60_000L,
            category = "Demo",
            isDemo = true,
            importedAt = 1L,
        ),
        VideoItem(
            id = "demo_elephants",
            title = "Elephants Dream (Demo)",
            description = "Open movie sample — not a social feed. Local/demo only.",
            authorName = "Blender Foundation",
            uri = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            durationMs = 60_000L,
            category = "Demo",
            isDemo = true,
            importedAt = 2L,
        ),
        VideoItem(
            id = "demo_forbigger",
            title = "For Bigger Blazes (Demo)",
            description = "Short sample clip for swipe-feed UX testing.",
            authorName = "Google Sample",
            uri = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            durationMs = 15_000L,
            category = "Demo",
            isDemo = true,
            importedAt = 3L,
        ),
        VideoItem(
            id = "demo_joyrides",
            title = "For Bigger Joyrides (Demo)",
            description = "Short sample clip. Import your own videos from Library.",
            authorName = "Google Sample",
            uri = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
            durationMs = 15_000L,
            category = "Nature",
            isDemo = true,
            importedAt = 4L,
        ),
        VideoItem(
            id = "demo_escapade",
            title = "For Bigger Escapes (Demo)",
            description = "Demo catalog entry — replace with your library imports anytime.",
            authorName = "Google Sample",
            uri = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            durationMs = 15_000L,
            category = "Travel",
            isDemo = true,
            importedAt = 5L,
        ),
    )
}
