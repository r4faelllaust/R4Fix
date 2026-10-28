package com.example.vibemod.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface VideoDao {
    @Query("SELECT * FROM videos ORDER BY importedAt DESC")
    fun observeAll(): Flow<List<VideoEntity>>

    @Query("SELECT * FROM videos WHERE isFavorite = 1 ORDER BY importedAt DESC")
    fun observeFavorites(): Flow<List<VideoEntity>>

    @Query("SELECT * FROM videos WHERE id = :id LIMIT 1")
    suspend fun getById(id: String): VideoEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: VideoEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(entities: List<VideoEntity>)

    @Update
    suspend fun update(entity: VideoEntity)

    @Query("UPDATE videos SET isFavorite = :favorite WHERE id = :id")
    suspend fun setFavorite(id: String, favorite: Boolean)

    @Query("UPDATE videos SET collection = :collection WHERE id = :id")
    suspend fun setCollection(id: String, collection: String?)

    @Query("DELETE FROM videos WHERE id = :id")
    suspend fun delete(id: String)

    @Query("DELETE FROM videos WHERE isDemo = 1")
    suspend fun deleteDemos()

    @Query("SELECT COUNT(*) FROM videos")
    suspend fun count(): Int

    @Query("SELECT COUNT(*) FROM videos WHERE isFavorite = 1")
    suspend fun favoriteCount(): Int

    @Query(
        """
        SELECT * FROM videos
        WHERE title LIKE '%' || :query || '%'
           OR description LIKE '%' || :query || '%'
           OR authorName LIKE '%' || :query || '%'
           OR category LIKE '%' || :query || '%'
        ORDER BY importedAt DESC
        """
    )
    fun search(query: String): Flow<List<VideoEntity>>

    @Query("SELECT DISTINCT category FROM videos ORDER BY category ASC")
    fun observeCategories(): Flow<List<String>>
}
