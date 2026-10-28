package com.example.vibemod

import com.example.vibemod.domain.model.VideoFilter
import com.example.vibemod.domain.model.VideoItem
import com.example.vibemod.domain.model.VideoSort
import com.example.vibemod.domain.model.VideoSorter
import com.google.common.truth.Truth.assertThat
import org.junit.Test

class VideoSorterTest {

    private val samples = listOf(
        VideoItem("1", "Charlie", "", "a", "u1", durationMs = 10, isFavorite = false, isDemo = true, importedAt = 1),
        VideoItem("2", "Alpha", "", "b", "u2", durationMs = 30, isFavorite = true, isDemo = false, importedAt = 3),
        VideoItem("3", "Bravo", "", "c", "u3", durationMs = 20, isFavorite = false, isDemo = false, importedAt = 2),
    )

    @Test
    fun sortByTitle() {
        val sorted = VideoSorter.sort(samples, VideoSort.TITLE)
        assertThat(sorted.map { it.title }).containsExactly("Alpha", "Bravo", "Charlie").inOrder()
    }

    @Test
    fun sortByRecent() {
        val sorted = VideoSorter.sort(samples, VideoSort.RECENT)
        assertThat(sorted.map { it.id }).containsExactly("2", "3", "1").inOrder()
    }

    @Test
    fun sortFavoritesFirst() {
        val sorted = VideoSorter.sort(samples, VideoSort.FAVORITES_FIRST)
        assertThat(sorted.first().id).isEqualTo("2")
    }

    @Test
    fun filterImportedExcludesDemo() {
        val filtered = VideoSorter.filter(samples, VideoFilter.IMPORTED, includeDemo = true)
        assertThat(filtered.all { !it.isDemo }).isTrue()
    }

    @Test
    fun includeDemoFlagHidesDemos() {
        val filtered = VideoSorter.filter(samples, VideoFilter.ALL, includeDemo = false)
        assertThat(filtered).hasSize(2)
    }
}
