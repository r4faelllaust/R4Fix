package com.example.vibemod.domain.model

object VideoSorter {
    fun sort(items: List<VideoItem>, sort: VideoSort): List<VideoItem> = when (sort) {
        VideoSort.RECENT -> items.sortedByDescending { it.importedAt }
        VideoSort.TITLE -> items.sortedBy { it.title.lowercase() }
        VideoSort.DURATION -> items.sortedByDescending { it.durationMs }
        VideoSort.FAVORITES_FIRST -> items.sortedWith(
            compareByDescending<VideoItem> { it.isFavorite }
                .thenByDescending { it.importedAt },
        )
    }

    fun filter(items: List<VideoItem>, filter: VideoFilter, includeDemo: Boolean): List<VideoItem> {
        val base = if (includeDemo) items else items.filterNot { it.isDemo }
        return when (filter) {
            VideoFilter.ALL -> base
            VideoFilter.FAVORITES -> base.filter { it.isFavorite }
            VideoFilter.DEMO -> base.filter { it.isDemo }
            VideoFilter.IMPORTED -> base.filterNot { it.isDemo }
        }
    }

    fun apply(
        items: List<VideoItem>,
        sort: VideoSort,
        filter: VideoFilter,
        includeDemo: Boolean,
    ): List<VideoItem> = sort(filter(items, filter, includeDemo), sort)
}
