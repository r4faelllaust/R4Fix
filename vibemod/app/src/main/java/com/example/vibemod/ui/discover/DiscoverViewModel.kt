package com.example.vibemod.ui.discover

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.vibemod.data.repository.PreferencesRepository
import com.example.vibemod.data.repository.VideoRepository
import com.example.vibemod.domain.model.VideoFilter
import com.example.vibemod.domain.model.VideoItem
import com.example.vibemod.domain.model.VideoSort
import com.example.vibemod.domain.model.VideoSorter
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

data class DiscoverUiState(
    val query: String = "",
    val results: List<VideoItem> = emptyList(),
    val categories: List<String> = emptyList(),
    val selectedCategory: String? = null,
    val filter: VideoFilter = VideoFilter.ALL,
    val history: List<String> = emptyList(),
    val rememberHistory: Boolean = true,
)

@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class DiscoverViewModel @Inject constructor(
    private val videoRepository: VideoRepository,
    private val preferencesRepository: PreferencesRepository,
) : ViewModel() {

    private val query = MutableStateFlow("")
    private val category = MutableStateFlow<String?>(null)
    private val filter = MutableStateFlow(VideoFilter.ALL)

    private val resultsFlow = combine(
        preferencesRepository.preferences.flatMapLatest { prefs ->
            videoRepository.observeVideos(
                sort = VideoSort.TITLE,
                filter = VideoFilter.ALL,
                includeDemo = prefs.showDemoVideos,
            )
        },
        query,
        category,
        filter,
    ) { videos, q, cat, f ->
        val filtered = VideoSorter.filter(videos, f, includeDemo = true)
            .let { list ->
                if (cat == null) list else list.filter { it.category.equals(cat, ignoreCase = true) }
            }
        if (q.isBlank()) {
            filtered
        } else {
            filtered.filter {
                it.title.contains(q, true) ||
                    it.description.contains(q, true) ||
                    it.authorName.contains(q, true) ||
                    it.category.contains(q, true)
            }
        }
    }

    private val metaFlow = combine(
        query,
        category,
        filter,
        preferencesRepository.searchHistory,
        preferencesRepository.preferences,
    ) { q, cat, f, history, prefs ->
        Meta(q, cat, f, history, prefs.rememberSearchHistory)
    }

    val uiState: StateFlow<DiscoverUiState> = combine(
        resultsFlow,
        videoRepository.observeCategories(),
        metaFlow,
    ) { results, categories, meta ->
        DiscoverUiState(
            query = meta.query,
            results = results,
            categories = categories,
            selectedCategory = meta.category,
            filter = meta.filter,
            history = meta.history,
            rememberHistory = meta.rememberHistory,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), DiscoverUiState())

    fun onQueryChange(value: String) {
        query.value = value
    }

    fun submitSearch() {
        viewModelScope.launch {
            preferencesRepository.addSearchQuery(query.value.trim())
        }
    }

    fun selectHistory(item: String) {
        query.value = item
        submitSearch()
    }

    fun selectCategory(value: String?) {
        category.value = value
    }

    fun setFilter(value: VideoFilter) {
        filter.value = value
    }

    fun clearHistory() {
        viewModelScope.launch { preferencesRepository.clearSearchHistory() }
    }

    private data class Meta(
        val query: String,
        val category: String?,
        val filter: VideoFilter,
        val history: List<String>,
        val rememberHistory: Boolean,
    )
}
