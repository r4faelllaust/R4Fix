package com.example.vibemod.ui.profile

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.vibemod.data.repository.PreferencesRepository
import com.example.vibemod.data.repository.VideoRepository
import com.example.vibemod.domain.model.BadgeStyle
import com.example.vibemod.domain.model.UserProfile
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class ProfileUiState(
    val profile: UserProfile = UserProfile(),
    val showBadge: Boolean = true,
)

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val preferencesRepository: PreferencesRepository,
    private val videoRepository: VideoRepository,
) : ViewModel() {

    val uiState: StateFlow<ProfileUiState> = combine(
        preferencesRepository.profile,
        preferencesRepository.preferences,
    ) { profile, prefs ->
        val (total, favorites) = runCatching {
            // counts are suspend; approximate via profile fields updated below
            profile.localVideoCount to profile.favoriteCount
        }.getOrDefault(0 to 0)
        ProfileUiState(
            profile = profile.copy(
                localVideoCount = total,
                favoriteCount = favorites,
                demoViews = if (prefs.showDemoVideos) 42 else 0,
            ),
            showBadge = prefs.showBadgeOnProfile,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ProfileUiState())

    init {
        viewModelScope.launch {
            refreshCounts()
        }
    }

    private suspend fun refreshCounts() {
        val (total, favorites) = videoRepository.counts()
        preferencesRepository.updateProfile {
            it.copy(localVideoCount = total, favoriteCount = favorites)
        }
    }

    fun setUsername(value: String) {
        viewModelScope.launch {
            preferencesRepository.updateProfile { it.copy(username = value.take(32)) }
        }
    }

    fun setBiography(value: String) {
        viewModelScope.launch {
            preferencesRepository.updateProfile { it.copy(biography = value.take(280)) }
        }
    }

    fun setBadge(style: BadgeStyle) {
        viewModelScope.launch {
            preferencesRepository.updateProfile { it.copy(badgeStyle = style) }
        }
    }

    fun setAvatar(uri: Uri?) {
        viewModelScope.launch {
            preferencesRepository.updateProfile { it.copy(avatarUri = uri?.toString()) }
        }
    }
}
