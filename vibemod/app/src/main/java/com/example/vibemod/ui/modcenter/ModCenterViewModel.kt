package com.example.vibemod.ui.modcenter

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.vibemod.data.repository.PreferencesRepository
import com.example.vibemod.domain.model.AccentColor
import com.example.vibemod.domain.model.DoubleTapAction
import com.example.vibemod.domain.model.ModPreferences
import com.example.vibemod.domain.model.NavStyle
import com.example.vibemod.domain.model.ThemeMode
import com.example.vibemod.domain.model.UserProfile
import com.example.vibemod.domain.model.VideoSort
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class ModCenterUiState(
    val prefs: ModPreferences = ModPreferences(),
    val profile: UserProfile = UserProfile(),
)

@HiltViewModel
class ModCenterViewModel @Inject constructor(
    private val preferencesRepository: PreferencesRepository,
) : ViewModel() {

    val uiState: StateFlow<ModCenterUiState> = combine(
        preferencesRepository.preferences,
        preferencesRepository.profile,
    ) { prefs, profile ->
        ModCenterUiState(prefs, profile)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ModCenterUiState())

    private fun update(transform: (ModPreferences) -> ModPreferences) {
        viewModelScope.launch { preferencesRepository.updatePreferences(transform) }
    }

    fun setThemeMode(mode: ThemeMode) = update { it.copy(themeMode = mode, amoledMode = mode == ThemeMode.AMOLED || it.amoledMode) }
    fun setAmoled(enabled: Boolean) = update {
        it.copy(
            amoledMode = enabled,
            themeMode = if (enabled) ThemeMode.AMOLED else if (it.themeMode == ThemeMode.AMOLED) ThemeMode.DARK else it.themeMode,
        )
    }
    fun setAccent(color: AccentColor) = update { it.copy(accentColor = color) }
    fun setNavStyle(style: NavStyle) = update { it.copy(navStyle = style) }
    fun setShowBottomLabels(v: Boolean) = update { it.copy(showBottomLabels = v) }
    fun setHideUsername(v: Boolean) = update { it.copy(hideUsernameOverlay = v) }
    fun setHideDescription(v: Boolean) = update { it.copy(hideDescriptionOverlay = v) }
    fun setHideActionRail(v: Boolean) = update { it.copy(hideActionRail = v) }
    fun setAnimationScale(v: Float) = update { it.copy(animationScale = v) }
    fun setDefaultSpeed(v: Float) = update { it.copy(defaultPlaybackSpeed = v.coerceIn(0.5f, 2f)) }
    fun setAutoLoop(v: Boolean) = update { it.copy(autoLoop = v) }
    fun setAutoPlay(v: Boolean) = update { it.copy(autoPlay = v) }
    fun setMuteOnLaunch(v: Boolean) = update { it.copy(muteOnLaunch = v) }
    fun setVideoSort(v: VideoSort) = update { it.copy(videoSort = v) }
    fun setShowDemo(v: Boolean) = update { it.copy(showDemoVideos = v) }
    fun setFeedHaptics(v: Boolean) = update { it.copy(feedSwipeHaptics = v) }
    fun setClearSearchOnExit(v: Boolean) = update { it.copy(clearSearchOnExit = v) }
    fun setRememberSearch(v: Boolean) = update { it.copy(rememberSearchHistory = v) }
    fun setReducedMotion(v: Boolean) = update { it.copy(reducedMotion = v) }
    fun setLargeTouch(v: Boolean) = update { it.copy(largeTouchTargets = v) }
    fun setHighContrast(v: Boolean) = update { it.copy(highContrastText = v) }
    fun setSeekGestures(v: Boolean) = update { it.copy(seekViaGestures = v) }
    fun setDoubleTap(v: DoubleTapAction) = update { it.copy(doubleTapAction = v) }
    fun setHaptics(v: Boolean) = update { it.copy(hapticFeedback = v) }
    fun setShowBadgeFeed(v: Boolean) = update { it.copy(showBadgeInFeed = v) }
    fun setShowBadgeProfile(v: Boolean) = update { it.copy(showBadgeOnProfile = v) }
    fun setKeepScreenOn(v: Boolean) = update { it.copy(keepScreenOn = v) }
    fun setDebugOverlay(v: Boolean) = update { it.copy(debugOverlay = v) }

    fun enablePin(pin: String) {
        viewModelScope.launch {
            runCatching { preferencesRepository.setPin(pin) }
        }
    }

    fun disablePin() {
        viewModelScope.launch { preferencesRepository.clearPin() }
    }
}
