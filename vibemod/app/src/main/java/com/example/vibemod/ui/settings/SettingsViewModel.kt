package com.example.vibemod.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.vibemod.data.repository.PreferencesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class SettingsUiState(
    val message: String? = null,
    val exportJson: String? = null,
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val preferencesRepository: PreferencesRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(SettingsUiState())
    val state: StateFlow<SettingsUiState> = _state.asStateFlow()

    fun exportPrefs() {
        viewModelScope.launch {
            runCatching { preferencesRepository.exportJson() }
                .onSuccess { json ->
                    _state.value = SettingsUiState(message = "Exported preferences", exportJson = json)
                }
                .onFailure {
                    _state.value = SettingsUiState(message = it.message ?: "Export failed")
                }
        }
    }

    fun importPrefs(json: String) {
        viewModelScope.launch {
            runCatching { preferencesRepository.importJson(json) }
                .onSuccess {
                    _state.value = SettingsUiState(message = "Imported preferences")
                }
                .onFailure {
                    _state.value = SettingsUiState(message = it.message ?: "Import failed")
                }
        }
    }

    fun reset() {
        viewModelScope.launch {
            preferencesRepository.resetSettings()
            _state.value = SettingsUiState(message = "Settings reset to defaults")
        }
    }

    fun clearMessage() {
        _state.value = _state.value.copy(message = null)
    }
}
