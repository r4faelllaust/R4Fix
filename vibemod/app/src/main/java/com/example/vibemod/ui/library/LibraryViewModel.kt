package com.example.vibemod.ui.library

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.vibemod.data.repository.PreferencesRepository
import com.example.vibemod.data.repository.VideoRepository
import com.example.vibemod.domain.model.VideoFilter
import com.example.vibemod.domain.model.VideoItem
import com.example.vibemod.domain.model.VideoSort
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class LibraryUiState(
    val videos: List<VideoItem> = emptyList(),
    val sort: VideoSort = VideoSort.RECENT,
    val filter: VideoFilter = VideoFilter.ALL,
    val message: String? = null,
    val importing: Boolean = false,
)

@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class LibraryViewModel @Inject constructor(
    private val videoRepository: VideoRepository,
    private val preferencesRepository: PreferencesRepository,
) : ViewModel() {

    private val sort = MutableStateFlow(VideoSort.RECENT)
    private val filter = MutableStateFlow(VideoFilter.ALL)
    private val message = MutableStateFlow<String?>(null)
    private val importing = MutableStateFlow(false)

    val uiState: StateFlow<LibraryUiState> = combine(
        combine(sort, filter, preferencesRepository.preferences) { s, f, prefs ->
            Triple(s, f, prefs.showDemoVideos)
        }.flatMapLatest { (s, f, showDemo) ->
            videoRepository.observeVideos(s, f, showDemo)
        },
        sort,
        filter,
        message,
        importing,
    ) { videos, s, f, msg, imp ->
        LibraryUiState(videos, s, f, msg, imp)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), LibraryUiState())

    fun setSort(value: VideoSort) {
        sort.value = value
        viewModelScope.launch {
            preferencesRepository.updatePreferences { it.copy(videoSort = value) }
        }
    }

    fun setFilter(value: VideoFilter) {
        filter.value = value
    }

    fun importUri(uri: Uri) {
        viewModelScope.launch {
            importing.value = true
            val result = videoRepository.importVideo(uri)
            message.value = result.fold(
                onSuccess = { "Imported “${it.title}”" },
                onFailure = { it.message ?: "Import failed" },
            )
            importing.value = false
        }
    }

    fun toggleFavorite(item: VideoItem) {
        viewModelScope.launch {
            videoRepository.setFavorite(item.id, !item.isFavorite)
        }
    }

    fun setCollection(item: VideoItem, collection: String?) {
        viewModelScope.launch {
            videoRepository.setCollection(item.id, collection)
        }
    }

    fun remove(item: VideoItem) {
        viewModelScope.launch {
            videoRepository.remove(item.id)
            message.value = "Removed “${item.title}”"
        }
    }

    fun clearMessage() {
        message.value = null
    }
}
