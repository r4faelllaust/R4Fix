package com.example.vibemod.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.floatPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.example.vibemod.domain.model.AccentColor
import com.example.vibemod.domain.model.BadgeStyle
import com.example.vibemod.domain.model.DoubleTapAction
import com.example.vibemod.domain.model.ModPreferences
import com.example.vibemod.domain.model.NavStyle
import com.example.vibemod.domain.model.ThemeMode
import com.example.vibemod.domain.model.UserProfile
import com.example.vibemod.domain.model.VideoSort
import com.google.gson.Gson
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "vibemod_prefs")

@Singleton
class PreferencesDataStore @Inject constructor(
    @ApplicationContext private val context: Context,
    private val gson: Gson,
) {
    private object Keys {
        val themeMode = stringPreferencesKey("theme_mode")
        val accentColor = stringPreferencesKey("accent_color")
        val amoledMode = booleanPreferencesKey("amoled_mode")
        val showBottomLabels = booleanPreferencesKey("show_bottom_labels")
        val navStyle = stringPreferencesKey("nav_style")
        val hideUsernameOverlay = booleanPreferencesKey("hide_username_overlay")
        val hideDescriptionOverlay = booleanPreferencesKey("hide_description_overlay")
        val hideActionRail = booleanPreferencesKey("hide_action_rail")
        val animationScale = floatPreferencesKey("animation_scale")
        val defaultPlaybackSpeed = floatPreferencesKey("default_playback_speed")
        val autoLoop = booleanPreferencesKey("auto_loop")
        val autoPlay = booleanPreferencesKey("auto_play")
        val muteOnLaunch = booleanPreferencesKey("mute_on_launch")
        val videoSort = stringPreferencesKey("video_sort")
        val showDemoVideos = booleanPreferencesKey("show_demo_videos")
        val feedSwipeHaptics = booleanPreferencesKey("feed_swipe_haptics")
        val pinLockEnabled = booleanPreferencesKey("pin_lock_enabled")
        val pinHash = stringPreferencesKey("pin_hash")
        val clearSearchOnExit = booleanPreferencesKey("clear_search_on_exit")
        val rememberSearchHistory = booleanPreferencesKey("remember_search_history")
        val reducedMotion = booleanPreferencesKey("reduced_motion")
        val largeTouchTargets = booleanPreferencesKey("large_touch_targets")
        val highContrastText = booleanPreferencesKey("high_contrast_text")
        val seekViaGestures = booleanPreferencesKey("seek_via_gestures")
        val doubleTapAction = stringPreferencesKey("double_tap_action")
        val hapticFeedback = booleanPreferencesKey("haptic_feedback")
        val showBadgeInFeed = booleanPreferencesKey("show_badge_in_feed")
        val showBadgeOnProfile = booleanPreferencesKey("show_badge_on_profile")
        val keepScreenOn = booleanPreferencesKey("keep_screen_on")
        val debugOverlay = booleanPreferencesKey("debug_overlay")

        val username = stringPreferencesKey("username")
        val biography = stringPreferencesKey("biography")
        val avatarUri = stringPreferencesKey("avatar_uri")
        val badgeStyle = stringPreferencesKey("badge_style")
        val searchHistory = stringSetPreferencesKey("search_history")
    }

    val preferences: Flow<ModPreferences> = context.dataStore.data.map { prefs ->
        ModPreferences(
            themeMode = enumOr(prefs[Keys.themeMode], ThemeMode.AMOLED),
            accentColor = enumOr(prefs[Keys.accentColor], AccentColor.NEON_BLUE),
            amoledMode = prefs[Keys.amoledMode] ?: true,
            showBottomLabels = prefs[Keys.showBottomLabels] ?: true,
            navStyle = enumOr(prefs[Keys.navStyle], NavStyle.LABELED),
            hideUsernameOverlay = prefs[Keys.hideUsernameOverlay] ?: false,
            hideDescriptionOverlay = prefs[Keys.hideDescriptionOverlay] ?: false,
            hideActionRail = prefs[Keys.hideActionRail] ?: false,
            animationScale = prefs[Keys.animationScale] ?: 1f,
            defaultPlaybackSpeed = prefs[Keys.defaultPlaybackSpeed] ?: 1f,
            autoLoop = prefs[Keys.autoLoop] ?: true,
            autoPlay = prefs[Keys.autoPlay] ?: true,
            muteOnLaunch = prefs[Keys.muteOnLaunch] ?: false,
            videoSort = enumOr(prefs[Keys.videoSort], VideoSort.RECENT),
            showDemoVideos = prefs[Keys.showDemoVideos] ?: true,
            feedSwipeHaptics = prefs[Keys.feedSwipeHaptics] ?: true,
            pinLockEnabled = prefs[Keys.pinLockEnabled] ?: false,
            pinHash = prefs[Keys.pinHash] ?: "",
            clearSearchOnExit = prefs[Keys.clearSearchOnExit] ?: false,
            rememberSearchHistory = prefs[Keys.rememberSearchHistory] ?: true,
            reducedMotion = prefs[Keys.reducedMotion] ?: false,
            largeTouchTargets = prefs[Keys.largeTouchTargets] ?: false,
            highContrastText = prefs[Keys.highContrastText] ?: false,
            seekViaGestures = prefs[Keys.seekViaGestures] ?: true,
            doubleTapAction = enumOr(prefs[Keys.doubleTapAction], DoubleTapAction.LIKE),
            hapticFeedback = prefs[Keys.hapticFeedback] ?: true,
            showBadgeInFeed = prefs[Keys.showBadgeInFeed] ?: true,
            showBadgeOnProfile = prefs[Keys.showBadgeOnProfile] ?: true,
            keepScreenOn = prefs[Keys.keepScreenOn] ?: true,
            debugOverlay = prefs[Keys.debugOverlay] ?: false,
        )
    }

    val profile: Flow<UserProfile> = context.dataStore.data.map { prefs ->
        UserProfile(
            username = prefs[Keys.username] ?: "Local Creator",
            biography = prefs[Keys.biography]
                ?: "Videos stay on this device. Stats below are local/demo.",
            avatarUri = prefs[Keys.avatarUri],
            badgeStyle = enumOr(prefs[Keys.badgeStyle], BadgeStyle.NONE),
        )
    }

    val searchHistory: Flow<List<String>> = context.dataStore.data.map { prefs ->
        (prefs[Keys.searchHistory] ?: emptySet()).toList().sortedDescending()
    }

    suspend fun update(transform: (ModPreferences) -> ModPreferences) {
        val current = preferencesSnapshot()
        writePreferences(transform(current))
    }

    suspend fun writePreferences(value: ModPreferences) {
        context.dataStore.edit { prefs ->
            prefs[Keys.themeMode] = value.themeMode.name
            prefs[Keys.accentColor] = value.accentColor.name
            prefs[Keys.amoledMode] = value.amoledMode
            prefs[Keys.showBottomLabels] = value.showBottomLabels
            prefs[Keys.navStyle] = value.navStyle.name
            prefs[Keys.hideUsernameOverlay] = value.hideUsernameOverlay
            prefs[Keys.hideDescriptionOverlay] = value.hideDescriptionOverlay
            prefs[Keys.hideActionRail] = value.hideActionRail
            prefs[Keys.animationScale] = value.animationScale
            prefs[Keys.defaultPlaybackSpeed] = value.defaultPlaybackSpeed
            prefs[Keys.autoLoop] = value.autoLoop
            prefs[Keys.autoPlay] = value.autoPlay
            prefs[Keys.muteOnLaunch] = value.muteOnLaunch
            prefs[Keys.videoSort] = value.videoSort.name
            prefs[Keys.showDemoVideos] = value.showDemoVideos
            prefs[Keys.feedSwipeHaptics] = value.feedSwipeHaptics
            prefs[Keys.pinLockEnabled] = value.pinLockEnabled
            prefs[Keys.pinHash] = value.pinHash
            prefs[Keys.clearSearchOnExit] = value.clearSearchOnExit
            prefs[Keys.rememberSearchHistory] = value.rememberSearchHistory
            prefs[Keys.reducedMotion] = value.reducedMotion
            prefs[Keys.largeTouchTargets] = value.largeTouchTargets
            prefs[Keys.highContrastText] = value.highContrastText
            prefs[Keys.seekViaGestures] = value.seekViaGestures
            prefs[Keys.doubleTapAction] = value.doubleTapAction.name
            prefs[Keys.hapticFeedback] = value.hapticFeedback
            prefs[Keys.showBadgeInFeed] = value.showBadgeInFeed
            prefs[Keys.showBadgeOnProfile] = value.showBadgeOnProfile
            prefs[Keys.keepScreenOn] = value.keepScreenOn
            prefs[Keys.debugOverlay] = value.debugOverlay
        }
    }

    suspend fun updateProfile(transform: (UserProfile) -> UserProfile) {
        val current = profileSnapshot()
        val next = transform(current)
        context.dataStore.edit { prefs ->
            prefs[Keys.username] = next.username
            prefs[Keys.biography] = next.biography
            if (next.avatarUri != null) prefs[Keys.avatarUri] = next.avatarUri
            else prefs.remove(Keys.avatarUri)
            prefs[Keys.badgeStyle] = next.badgeStyle.name
        }
    }

    suspend fun addSearchQuery(query: String) {
        if (query.isBlank()) return
        context.dataStore.edit { prefs ->
            val remember = prefs[Keys.rememberSearchHistory] ?: true
            if (!remember) return@edit
            val existing = prefs[Keys.searchHistory]?.toMutableSet() ?: mutableSetOf()
            existing.remove(query)
            existing.add(query)
            prefs[Keys.searchHistory] = existing.take(20).toSet()
        }
    }

    suspend fun clearSearchHistory() {
        context.dataStore.edit { prefs -> prefs.remove(Keys.searchHistory) }
    }

    suspend fun resetAll() {
        context.dataStore.edit { it.clear() }
    }

    suspend fun exportJson(): String {
        val bundle = ExportBundle(
            preferences = preferencesSnapshot(),
            profile = profileSnapshot(),
            searchHistory = searchHistorySnapshot(),
        )
        return gson.toJson(bundle)
    }

    suspend fun importJson(json: String) {
        val bundle = gson.fromJson(json, ExportBundle::class.java)
            ?: throw IllegalArgumentException("Invalid preferences JSON")
        writePreferences(bundle.preferences)
        updateProfile { bundle.profile }
        context.dataStore.edit { prefs ->
            prefs[Keys.searchHistory] = bundle.searchHistory.toSet()
        }
    }

    private suspend fun preferencesSnapshot(): ModPreferences = preferences.first()

    private suspend fun profileSnapshot(): UserProfile = profile.first()

    private suspend fun searchHistorySnapshot(): List<String> = searchHistory.first()

    private inline fun <reified T : Enum<T>> enumOr(raw: String?, fallback: T): T =
        raw?.let { runCatching { enumValueOf<T>(it) }.getOrNull() } ?: fallback

    data class ExportBundle(
        val preferences: ModPreferences,
        val profile: UserProfile,
        val searchHistory: List<String>,
    )
}
