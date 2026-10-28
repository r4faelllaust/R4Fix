package com.example.vibemod.desktop.data

import com.example.vibemod.desktop.model.ModPreferences
import com.example.vibemod.desktop.model.UserProfile
import com.example.vibemod.desktop.model.VideoItem
import com.google.gson.Gson
import java.io.File
import java.util.UUID
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class AppStore(
    private val dataDir: File = File(System.getProperty("user.home"), ".vibemod-desktop"),
) {
    private val gson = Gson()
    private val prefsFile = File(dataDir, "prefs.json")
    private val profileFile = File(dataDir, "profile.json")
    private val libraryFile = File(dataDir, "library.json")

    private val _prefs = MutableStateFlow(loadPrefs())
    val prefs: StateFlow<ModPreferences> = _prefs.asStateFlow()

    private val _profile = MutableStateFlow(loadProfile())
    val profile: StateFlow<UserProfile> = _profile.asStateFlow()

    private val _videos = MutableStateFlow(loadLibrary())
    val videos: StateFlow<List<VideoItem>> = _videos.asStateFlow()

    init {
        dataDir.mkdirs()
        if (_videos.value.isEmpty() && _prefs.value.showDemo) {
            seedDemos()
        }
    }

    fun updatePrefs(transform: (ModPreferences) -> ModPreferences) {
        _prefs.update(transform)
        prefsFile.writeText(gson.toJson(_prefs.value))
        if (!_prefs.value.showDemo) {
            _videos.update { list -> list.filterNot { it.isDemo } }
            persistLibrary()
        } else if (_videos.value.none { it.isDemo }) {
            seedDemos()
        }
    }

    fun updateProfile(transform: (UserProfile) -> UserProfile) {
        _profile.update(transform)
        profileFile.writeText(gson.toJson(_profile.value))
    }

    fun importFile(file: File) {
        val item = VideoItem(
            id = "local_${UUID.randomUUID()}",
            title = file.nameWithoutExtension,
            description = "Imported on Windows desktop",
            author = "You",
            pathOrUrl = file.absolutePath,
            isDemo = false,
            category = "Imported",
        )
        _videos.update { listOf(item) + it }
        persistLibrary()
    }

    fun toggleFavorite(id: String) {
        _videos.update { list ->
            list.map { if (it.id == id) it.copy(isFavorite = !it.isFavorite) else it }
        }
        persistLibrary()
    }

    fun remove(id: String) {
        _videos.update { list -> list.filterNot { it.id == id && !it.isDemo } }
        persistLibrary()
    }

    fun feedVideos(): List<VideoItem> {
        val showDemo = _prefs.value.showDemo
        return _videos.value.filter { showDemo || !it.isDemo }
    }

    private fun seedDemos() {
        val demos = listOf(
            VideoItem(
                id = "demo_bigbuck",
                title = "Big Buck Bunny (Demo)",
                description = "Open movie sample — demo only.",
                author = "Blender Foundation",
                pathOrUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                isDemo = true,
                category = "Demo",
            ),
            VideoItem(
                id = "demo_elephants",
                title = "Elephants Dream (Demo)",
                description = "Open movie sample — demo only.",
                author = "Blender Foundation",
                pathOrUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                isDemo = true,
                category = "Demo",
            ),
            VideoItem(
                id = "demo_blazes",
                title = "For Bigger Blazes (Demo)",
                description = "Short sample for feed UX.",
                author = "Google Sample",
                pathOrUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                isDemo = true,
                category = "Demo",
            ),
        )
        _videos.update { existing ->
            val ids = existing.map { it.id }.toSet()
            existing + demos.filter { it.id !in ids }
        }
        persistLibrary()
    }

    private fun persistLibrary() {
        libraryFile.writeText(gson.toJson(_videos.value.toTypedArray()))
    }

    private fun loadPrefs(): ModPreferences = runCatching {
        if (prefsFile.exists()) gson.fromJson(prefsFile.readText(), ModPreferences::class.java) else null
    }.getOrNull() ?: ModPreferences()

    private fun loadProfile(): UserProfile = runCatching {
        if (profileFile.exists()) gson.fromJson(profileFile.readText(), UserProfile::class.java) else null
    }.getOrNull() ?: UserProfile()

    private fun loadLibrary(): List<VideoItem> = runCatching {
        if (!libraryFile.exists()) return emptyList()
        gson.fromJson(libraryFile.readText(), Array<VideoItem>::class.java)?.toList().orEmpty()
    }.getOrDefault(emptyList())
}
