package com.example.vibemod.ui.feed

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.vibemod.data.repository.PreferencesRepository
import com.example.vibemod.data.repository.VideoRepository
import com.example.vibemod.domain.model.ModPreferences
import com.example.vibemod.domain.model.UserProfile
import com.example.vibemod.domain.model.VideoFilter
import com.example.vibemod.domain.model.VideoItem
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

data class FeedUiState(
    val videos: List<VideoItem> = emptyList(),
    val prefs: ModPreferences = ModPreferences(),
    val profile: UserProfile = UserProfile(),
    val muted: Boolean = false,
    val speed: Float = 1f,
    val looping: Boolean = true,
    val currentIndex: Int = 0,
    val showDetails: Boolean = false,
)

@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class FeedViewModel @Inject constructor(
    private val videoRepository: VideoRepository,
    private val preferencesRepository: PreferencesRepository,
) : ViewModel() {

    private val muted = MutableStateFlow(false)
    private val speed = MutableStateFlow(1f)
    private val looping = MutableStateFlow(true)
    private val index = MutableStateFlow(0)
    private val showDetails = MutableStateFlow(false)
    private val initialized = MutableStateFlow(false)

    private val videosFlow = preferencesRepository.preferences.flatMapLatest { prefs ->
        videoRepository.observeVideos(
            sort = prefs.videoSort,
            filter = VideoFilter.ALL,
            includeDemo = prefs.showDemoVideos,
        )
    }

    private val controls = combine(muted, speed, looping, index, showDetails) { m, s, l, i, d ->
        Controls(m, s, l, i, d)
    }

    val uiState: StateFlow<FeedUiState> = combine(
        videosFlow,
        preferencesRepository.preferences,
        preferencesRepository.profile,
        controls,
    ) { videos, prefs, profile, c ->
        FeedUiState(
            videos = videos,
            prefs = prefs,
            profile = profile,
            muted = c.muted,
            speed = c.speed,
            looping = c.looping,
            currentIndex = c.index.coerceIn(0, (videos.size - 1).coerceAtLeast(0)),
            showDetails = c.showDetails,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), FeedUiState())

    init {
        viewModelScope.launch {
            preferencesRepository.preferences.collect { prefs ->
                if (!initialized.value) {
                    muted.value = prefs.muteOnLaunch
                    speed.value = prefs.clampedSpeed()
                    looping.value = prefs.autoLoop
                    initialized.value = true
                }
            }
        }
    }

    fun setIndex(value: Int) {
        index.value = value
    }

    fun toggleMute() {
        muted.value = !muted.value
    }

    fun cycleSpeed() {
        val options = listOf(0.5f, 0.75f, 1f, 1.25f, 1.5f, 2f)
        val i = options.indexOfFirst { it == speed.value }.let { if (it < 0) 2 else it }
        speed.value = options[(i + 1) % options.size]
    }

    fun toggleLoop() {
        looping.value = !looping.value
    }

    fun toggleDetails() {
        showDetails.value = !showDetails.value
    }

    fun toggleFavorite(id: String, currently: Boolean) {
        viewModelScope.launch {
            videoRepository.setFavorite(id, !currently)
        }
    }

    private data class Controls(
        val muted: Boolean,
        val speed: Float,
        val looping: Boolean,
        val index: Int,
        val showDetails: Boolean,
    )
}
