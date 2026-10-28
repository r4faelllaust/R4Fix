package com.example.vibemod.di

import android.content.Context
import androidx.room.Room
import com.example.vibemod.data.local.AppDatabase
import com.example.vibemod.data.local.VideoDao
import com.example.vibemod.data.repository.LocalVideoRepository
import com.example.vibemod.data.repository.VideoRepository
import com.google.gson.Gson
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    @Singleton
    abstract fun bindVideoRepository(impl: LocalVideoRepository): VideoRepository
}

@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides
    @Singleton
    fun provideGson(): Gson = Gson()

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "vibemod.db")
            .fallbackToDestructiveMigration()
            .build()

    @Provides
    fun provideVideoDao(db: AppDatabase): VideoDao = db.videoDao()
}
