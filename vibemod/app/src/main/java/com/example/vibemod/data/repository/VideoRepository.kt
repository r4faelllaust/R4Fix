package com.example.vibemod.data.repository

import android.net.Uri
import com.example.vibemod.domain.model.VideoFilter
import com.example.vibemod.domain.model.VideoItem
import com.example.vibemod.domain.model.VideoSort
import kotlinx.coroutines.flow.Flow

/**
 * Abstraction over video sources. Today: local + demo.
 * Future providers (authorized backends) can implement this without touching UI.
 */
interface VideoRepository {
    fun observeVideos(
        sort: VideoSort = VideoSort.RECENT,
        filter: VideoFilter = VideoFilter.ALL,
        includeDemo: Boolean = true,
    ): Flow<List<VideoItem>>

    fun search(query: String): Flow<List<VideoItem>>

    fun observeCategories(): Flow<List<String>>

    suspend fun importVideo(
        uri: Uri,
        title: String? = null,
        category: String = "Imported",
    ): Result<VideoItem>

    suspend fun setFavorite(id: String, favorite: Boolean)

    suspend fun setCollection(id: String, collection: String?)

    suspend fun remove(id: String)

    suspend fun ensureDemoSeeded()

    suspend fun counts(): Pair<Int, Int>
}
