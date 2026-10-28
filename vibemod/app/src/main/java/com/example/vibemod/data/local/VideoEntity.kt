package com.example.vibemod.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.vibemod.domain.model.VideoItem

@Entity(tableName = "videos")
data class VideoEntity(
    @PrimaryKey val id: String,
    val title: String,
    val description: String,
    val authorName: String,
    val uri: String,
    val thumbnailUri: String?,
    val durationMs: Long,
    val category: String,
    val isDemo: Boolean,
    val isFavorite: Boolean,
    val collection: String?,
    val importedAt: Long,
) {
    fun toDomain(fileMissing: Boolean = false) = VideoItem(
        id = id,
        title = title,
        description = description,
        authorName = authorName,
        uri = uri,
        thumbnailUri = thumbnailUri,
        durationMs = durationMs,
        category = category,
        isDemo = isDemo,
        isFavorite = isFavorite,
        collection = collection,
        importedAt = importedAt,
        fileMissing = fileMissing,
    )

    companion object {
        fun fromDomain(item: VideoItem) = VideoEntity(
            id = item.id,
            title = item.title,
            description = item.description,
            authorName = item.authorName,
            uri = item.uri,
            thumbnailUri = item.thumbnailUri,
            durationMs = item.durationMs,
            category = item.category,
            isDemo = item.isDemo,
            isFavorite = item.isFavorite,
            collection = item.collection,
            importedAt = item.importedAt,
        )
    }
}
