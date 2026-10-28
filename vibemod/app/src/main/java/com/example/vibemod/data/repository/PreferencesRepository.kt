package com.example.vibemod.data.repository

import com.example.vibemod.data.local.PreferencesDataStore
import com.example.vibemod.domain.model.ModPreferences
import com.example.vibemod.domain.model.UserProfile
import java.security.MessageDigest
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow

@Singleton
class PreferencesRepository @Inject constructor(
    private val dataStore: PreferencesDataStore,
) {
    val preferences: Flow<ModPreferences> = dataStore.preferences
    val profile: Flow<UserProfile> = dataStore.profile
    val searchHistory: Flow<List<String>> = dataStore.searchHistory

    suspend fun updatePreferences(transform: (ModPreferences) -> ModPreferences) =
        dataStore.update(transform)

    suspend fun updateProfile(transform: (UserProfile) -> UserProfile) =
        dataStore.updateProfile(transform)

    suspend fun addSearchQuery(query: String) = dataStore.addSearchQuery(query)

    suspend fun clearSearchHistory() = dataStore.clearSearchHistory()

    suspend fun resetSettings() = dataStore.resetAll()

    suspend fun exportJson(): String = dataStore.exportJson()

    suspend fun importJson(json: String) = dataStore.importJson(json)

    suspend fun setPin(pin: String) {
        require(pin.length in 4..8 && pin.all { it.isDigit() }) {
            "PIN must be 4–8 digits"
        }
        dataStore.update {
            it.copy(pinLockEnabled = true, pinHash = hashPin(pin))
        }
    }

    suspend fun clearPin() {
        dataStore.update { it.copy(pinLockEnabled = false, pinHash = "") }
    }

    fun verifyPin(pin: String, storedHash: String): Boolean =
        storedHash.isNotEmpty() && hashPin(pin) == storedHash

    fun hashPin(pin: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val bytes = digest.digest(pin.toByteArray(Charsets.UTF_8))
        return bytes.joinToString("") { "%02x".format(it) }
    }
}
