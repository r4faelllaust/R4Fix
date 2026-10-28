package com.example.vibemod.data.repository

import android.content.Context
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.provider.OpenableColumns
import com.example.vibemod.data.demo.DemoVideos
import com.example.vibemod.data.local.VideoDao
import com.example.vibemod.data.local.VideoEntity
import com.example.vibemod.domain.model.VideoFilter
import com.example.vibemod.domain.model.VideoItem
import com.example.vibemod.domain.model.VideoSort
import com.example.vibemod.domain.model.VideoSorter
import dagger.hilt.android.qualifiers.ApplicationContext
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

@Singleton
class LocalVideoRepository @Inject constructor(
    @ApplicationContext private val context: Context,
    private val videoDao: VideoDao,
) : VideoRepository {

    override fun observeVideos(
        sort: VideoSort,
        filter: VideoFilter,
        includeDemo: Boolean,
    ): Flow<List<VideoItem>> = videoDao.observeAll().map { entities ->
        val items = entities.map { it.toDomain(fileMissing = !uriExists(it.uri, it.isDemo)) }
        VideoSorter.apply(items, sort, filter, includeDemo)
    }

    override fun search(query: String): Flow<List<VideoItem>> =
        videoDao.search(query.trim()).map { list -> list.map { it.toDomain() } }

    override fun observeCategories(): Flow<List<String>> = videoDao.observeCategories()

    override suspend fun importVideo(
        uri: Uri,
        title: String?,
        category: String,
    ): Result<VideoItem> = withContext(Dispatchers.IO) {
        runCatching {
            val takeFlags = android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION
            try {
                context.contentResolver.takePersistableUriPermission(uri, takeFlags)
            } catch (_: SecurityException) {
                // Some pickers do not grant persistable permission; still usable this session.
            }
            val displayName = title ?: queryDisplayName(uri) ?: "Imported video"
            val duration = readDuration(uri)
            val item = VideoItem(
                id = "local_${UUID.randomUUID()}",
                title = displayName.substringBeforeLast('.').ifBlank { displayName },
                description = "Imported from device storage",
                authorName = "You",
                uri = uri.toString(),
                durationMs = duration,
                category = category,
                isDemo = false,
                importedAt = System.currentTimeMillis(),
            )
            videoDao.upsert(VideoEntity.fromDomain(item))
            item
        }
    }

    override suspend fun setFavorite(id: String, favorite: Boolean) {
        videoDao.setFavorite(id, favorite)
    }

    override suspend fun setCollection(id: String, collection: String?) {
        videoDao.setCollection(id, collection)
    }

    override suspend fun remove(id: String) {
        videoDao.delete(id)
    }

    override suspend fun ensureDemoSeeded() {
        if (videoDao.count() == 0) {
            videoDao.upsertAll(DemoVideos.catalog().map(VideoEntity::fromDomain))
        } else {
            // Keep demos present if missing, without wiping user favorites on demos
            DemoVideos.catalog().forEach { demo ->
                if (videoDao.getById(demo.id) == null) {
                    videoDao.upsert(VideoEntity.fromDomain(demo))
                }
            }
        }
    }

    override suspend fun counts(): Pair<Int, Int> =
        videoDao.count() to videoDao.favoriteCount()

    private fun queryDisplayName(uri: Uri): String? {
        context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            val index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            if (index >= 0 && cursor.moveToFirst()) return cursor.getString(index)
        }
        return uri.lastPathSegment
    }

    private fun readDuration(uri: Uri): Long = runCatching {
        MediaMetadataRetriever().use { retriever ->
            retriever.setDataSource(context, uri)
            retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull()
                ?: 0L
        }
    }.getOrDefault(0L)

    private fun uriExists(uriString: String, isDemo: Boolean): Boolean {
        if (isDemo && uriString.startsWith("http")) return true
        return runCatching {
            val uri = Uri.parse(uriString)
            context.contentResolver.openInputStream(uri)?.close()
            true
        }.getOrDefault(false)
    }
}
