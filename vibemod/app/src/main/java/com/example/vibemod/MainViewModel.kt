package com.example.vibemod

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.vibemod.data.repository.PreferencesRepository
import com.example.vibemod.data.repository.VideoRepository
import com.example.vibemod.domain.model.ModPreferences
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

@HiltViewModel
class MainViewModel @Inject constructor(
    private val preferencesRepository: PreferencesRepository,
    private val videoRepository: VideoRepository,
) : ViewModel() {

    val preferences: StateFlow<ModPreferences> = preferencesRepository.preferences
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ModPreferences())

    private val _unlocked = MutableStateFlow(false)
    val unlocked: StateFlow<Boolean> = _unlocked.asStateFlow()

    init {
        viewModelScope.launch {
            videoRepository.ensureDemoSeeded()
        }
        viewModelScope.launch {
            preferences.collect { prefs ->
                if (!prefs.pinLockEnabled) _unlocked.value = true
            }
        }
    }

    fun verifyPin(pin: String): Boolean {
        val hash = preferences.value.pinHash
        val ok = preferencesRepository.verifyPin(pin, hash)
        if (ok) _unlocked.value = true
        return ok
    }

    fun unlock() {
        _unlocked.value = true
    }
}
