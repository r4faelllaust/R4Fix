package com.example.vibemod.desktop.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.SettingsSuggest
import androidx.compose.material.icons.outlined.VideoLibrary
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.vibemod.desktop.data.AppStore
import com.example.vibemod.desktop.model.AccentColor
import com.example.vibemod.desktop.model.BadgeStyle
import com.example.vibemod.desktop.model.Branding
import com.example.vibemod.desktop.model.ThemeMode
import com.example.vibemod.desktop.theme.LocalVibeExtras
import javax.swing.JFileChooser
import javax.swing.filechooser.FileNameExtensionFilter

private enum class Dest { Feed, Discover, Library, Mod, Profile }

@Composable
fun VibeModDesktopApp(store: AppStore) {
    val prefs by store.prefs.collectAsState()
    val profile by store.profile.collectAsState()
    val videos by store.videos.collectAsState()
    var dest by remember { mutableStateOf(Dest.Feed) }
    val extras = LocalVibeExtras.current

    Row(Modifier.fillMaxSize()) {
        NavigationRail(
            containerColor = MaterialTheme.colorScheme.surface,
        ) {
            Text(
                Branding.APP_NAME,
                color = extras.accent,
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(16.dp),
            )
            Dest.entries.forEach { d ->
                NavigationRailItem(
                    selected = dest == d,
                    onClick = { dest = d },
                    icon = {
                        Icon(
                            when (d) {
                                Dest.Feed -> Icons.Outlined.Home
                                Dest.Discover -> Icons.Outlined.Explore
                                Dest.Library -> Icons.Outlined.VideoLibrary
                                Dest.Mod -> Icons.Outlined.SettingsSuggest
                                Dest.Profile -> Icons.Outlined.Person
                            },
                            contentDescription = d.name,
                        )
                    },
                    label = { Text(d.name) },
                )
            }
        }
        Box(Modifier.fillMaxSize().padding(16.dp)) {
            when (dest) {
                Dest.Feed -> FeedPane(store)
                Dest.Discover -> DiscoverPane(store)
                Dest.Library -> LibraryPane(store)
                Dest.Mod -> ModPane(store)
                Dest.Profile -> ProfilePane(store)
            }
        }
    }
}

@Composable
private fun FeedPane(store: AppStore) {
    val prefs by store.prefs.collectAsState()
    val profile by store.profile.collectAsState()
    val feed = store.feedVideos()
    var index by remember { mutableIntStateOf(0) }
    var muted by remember { mutableStateOf(prefs.muteOnLaunch) }
    var speed by remember { mutableStateOf(prefs.defaultSpeed) }
    var looping by remember { mutableStateOf(prefs.autoLoop) }

    if (feed.isEmpty()) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("No videos — import from Library or enable demos in Mod Center")
        }
        return
    }
    index = index.coerceIn(0, feed.lastIndex)
    val video = feed[index]

    Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Box(
            Modifier
                .weight(1f)
                .fillMaxHeight()
                .clip(RoundedCornerShape(16.dp))
                .background(Color.Black),
        ) {
            FxVideoPlayer(
                source = video.pathOrUrl,
                active = true,
                muted = muted,
                speed = speed,
                looping = looping,
                autoPlay = prefs.autoPlay,
                modifier = Modifier.fillMaxSize(),
            )
            Column(
                Modifier
                    .align(Alignment.BottomStart)
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            listOf(Color.Transparent, Color.Black.copy(0.75f)),
                        ),
                    )
                    .padding(16.dp),
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("@${video.author}", color = Color.White, style = MaterialTheme.typography.titleMedium)
                    if (prefs.showBadgeInFeed && profile.badge.isDecoration) {
                        Icon(
                            Icons.Filled.Verified,
                            contentDescription = "Custom badge",
                            tint = Color(profile.badge.color),
                            modifier = Modifier.padding(start = 6.dp).size(16.dp),
                        )
                    }
                    if (video.isDemo) {
                        Text(" · DEMO", color = LocalVibeExtras.current.accent)
                    }
                }
                Text(video.title, color = Color.White)
                Text(video.description, color = Color.White.copy(0.8f), style = MaterialTheme.typography.bodySmall)
            }
        }
        Column(
            Modifier.width(180.dp).fillMaxHeight(),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text("Feed controls", style = MaterialTheme.typography.titleMedium)
            Button(onClick = { index = (index - 1).coerceAtLeast(0) }, enabled = index > 0) {
                Text("Previous")
            }
            Button(onClick = { index = (index + 1).coerceAtMost(feed.lastIndex) }, enabled = index < feed.lastIndex) {
                Text("Next / swipe")
            }
            Button(onClick = { muted = !muted }) { Text(if (muted) "Unmute" else "Mute") }
            Button(onClick = {
                val opts = listOf(0.5f, 0.75f, 1f, 1.25f, 1.5f, 2f)
                val i = opts.indexOfFirst { it == speed }.let { if (it < 0) 2 else it }
                speed = opts[(i + 1) % opts.size]
            }) { Text("Speed ${"%.2f".format(speed)}x") }
            Button(onClick = { looping = !looping }) { Text(if (looping) "Loop on" else "Loop off") }
            Button(onClick = { store.toggleFavorite(video.id) }) {
                Text(if (video.isFavorite) "Unfavorite" else "Favorite")
            }
            Spacer(Modifier.weight(1f))
            Text("${index + 1} / ${feed.size}", style = MaterialTheme.typography.labelLarge)
        }
    }
}

@Composable
private fun DiscoverPane(store: AppStore) {
    var query by remember { mutableStateOf("") }
    val videos = store.feedVideos().filter {
        query.isBlank() ||
            it.title.contains(query, true) ||
            it.author.contains(query, true) ||
            it.category.contains(query, true)
    }
    Column {
        Text("Discover", style = MaterialTheme.typography.headlineLarge)
        Text("Search local + demo metadata")
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Search…") },
        )
        LazyColumn {
            items(videos, key = { it.id }) { v ->
                Column(Modifier.padding(vertical = 8.dp)) {
                    Text(v.title, style = MaterialTheme.typography.titleMedium)
                    Text("${v.author} · ${v.category}" + if (v.isDemo) " · DEMO" else "")
                }
            }
        }
    }
}

@Composable
private fun LibraryPane(store: AppStore) {
    val videos by store.videos.collectAsState()
    Column {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("Library", style = MaterialTheme.typography.headlineLarge)
                Text("Import local video files from your PC")
            }
            Button(onClick = {
                val chooser = JFileChooser().apply {
                    fileFilter = FileNameExtensionFilter("Videos", "mp4", "mkv", "mov", "webm", "avi")
                    isMultiSelectionEnabled = false
                }
                if (chooser.showOpenDialog(null) == JFileChooser.APPROVE_OPTION) {
                    store.importFile(chooser.selectedFile)
                }
            }) {
                Icon(Icons.Filled.FolderOpen, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Import video")
            }
        }
        Spacer(Modifier.height(12.dp))
        LazyColumn {
            items(videos, key = { it.id }) { v ->
                Row(
                    Modifier.fillMaxWidth().padding(vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(Modifier.weight(1f)) {
                        Text(v.title, style = MaterialTheme.typography.titleMedium)
                        Text(
                            buildString {
                                append(v.category)
                                if (v.isDemo) append(" · DEMO")
                                if (!v.isDemo) append(" · ${v.pathOrUrl}")
                            },
                            style = MaterialTheme.typography.bodySmall,
                        )
                    }
                    IconButton(onClick = { store.toggleFavorite(v.id) }) {
                        Icon(
                            if (v.isFavorite) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                            contentDescription = "Favorite",
                            tint = if (v.isFavorite) Color(0xFFFF2D55) else MaterialTheme.colorScheme.onSurface,
                        )
                    }
                    if (!v.isDemo) {
                        Button(onClick = { store.remove(v.id) }) { Text("Remove") }
                    }
                }
            }
        }
    }
}

@Composable
private fun ModPane(store: AppStore) {
    val prefs by store.prefs.collectAsState()
    val profile by store.profile.collectAsState()
    val extras = LocalVibeExtras.current
    Column(Modifier.verticalScroll(rememberScrollState())) {
        Text("Mod Center", style = MaterialTheme.typography.headlineLarge)
        Text("Every switch changes real desktop behavior")
        Spacer(Modifier.height(12.dp))
        Box(
            Modifier
                .fillMaxWidth()
                .height(100.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(if (extras.amoled) Color.Black else MaterialTheme.colorScheme.surfaceVariant)
                .border(1.dp, extras.accent.copy(0.5f), RoundedCornerShape(12.dp))
                .padding(16.dp),
        ) {
            Column {
                Text(Branding.APP_NAME, color = extras.accent, style = MaterialTheme.typography.titleLarge)
                Text("@${profile.username}")
                if (prefs.showBadgeOnProfile && profile.badge.isDecoration) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Filled.Verified, null, tint = Color(profile.badge.color), modifier = Modifier.size(14.dp))
                        Text(" ${profile.badge.label}", color = Color(profile.badge.color))
                    }
                }
            }
        }
        Section("Appearance")
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            ThemeMode.entries.forEach { mode ->
                FilterChip(
                    selected = prefs.themeMode == mode,
                    onClick = { store.updatePrefs { it.copy(themeMode = mode, amoled = mode == ThemeMode.AMOLED || it.amoled) } },
                    label = { Text(mode.name) },
                )
            }
        }
        SwitchRow("AMOLED", prefs.amoled) { v -> store.updatePrefs { it.copy(amoled = v) } }
        Text("Accent")
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            AccentColor.entries.forEach { a ->
                Box(
                    Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(Color(a.color))
                        .border(if (prefs.accent == a) 3.dp else 1.dp, Color.White, CircleShape)
                        .clickable { store.updatePrefs { it.copy(accent = a) } },
                )
            }
        }
        Section("Playback")
        Text("Default speed ${"%.2f".format(prefs.defaultSpeed)}x")
        Slider(
            value = prefs.defaultSpeed,
            onValueChange = { v -> store.updatePrefs { it.copy(defaultSpeed = v) } },
            valueRange = 0.5f..2f,
        )
        SwitchRow("Auto-loop", prefs.autoLoop) { v -> store.updatePrefs { it.copy(autoLoop = v) } }
        SwitchRow("Auto-play", prefs.autoPlay) { v -> store.updatePrefs { it.copy(autoPlay = v) } }
        SwitchRow("Mute on launch", prefs.muteOnLaunch) { v -> store.updatePrefs { it.copy(muteOnLaunch = v) } }
        SwitchRow("Show demo videos", prefs.showDemo) { v -> store.updatePrefs { it.copy(showDemo = v) } }
        Section("Badges")
        SwitchRow("Show badge in feed", prefs.showBadgeInFeed) { v -> store.updatePrefs { it.copy(showBadgeInFeed = v) } }
        SwitchRow("Show badge on profile", prefs.showBadgeOnProfile) { v -> store.updatePrefs { it.copy(showBadgeOnProfile = v) } }
        Text(Branding.BADGE_DISCLAIMER, style = MaterialTheme.typography.bodySmall)
        Spacer(Modifier.height(24.dp))
        Text(Branding.ABOUT, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
private fun ProfilePane(store: AppStore) {
    val profile by store.profile.collectAsState()
    val prefs by store.prefs.collectAsState()
    val videos by store.videos.collectAsState()
    Column(Modifier.verticalScroll(rememberScrollState())) {
        Text("Profile", style = MaterialTheme.typography.headlineLarge)
        Text("Local profile · Windows desktop", color = LocalVibeExtras.current.accent)
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = profile.username,
            onValueChange = { v -> store.updateProfile { it.copy(username = v.take(32)) } },
            label = { Text("Username") },
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(
            value = profile.biography,
            onValueChange = { v -> store.updateProfile { it.copy(biography = v.take(280)) } },
            label = { Text("Biography") },
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(12.dp))
        Text("Visual badge (custom decoration)")
        Text(Branding.BADGE_DISCLAIMER, style = MaterialTheme.typography.bodySmall)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            BadgeStyle.entries.forEach { style ->
                FilterChip(
                    selected = profile.badge == style,
                    onClick = { store.updateProfile { it.copy(badge = style) } },
                    label = { Text(style.displayName) },
                )
            }
        }
        if (prefs.showBadgeOnProfile && profile.badge.isDecoration) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 8.dp)) {
                Icon(Icons.Filled.Verified, null, tint = Color(profile.badge.color))
                Text(" ${profile.badge.displayName} decoration")
            }
        }
        Spacer(Modifier.height(16.dp))
        Text("Local stats")
        Text("Videos: ${videos.size} · Favorites: ${videos.count { it.isFavorite }}")
    }
}

@Composable
private fun Section(title: String) {
    Text(
        title,
        style = MaterialTheme.typography.titleLarge,
        color = LocalVibeExtras.current.accent,
        modifier = Modifier.padding(top = 16.dp, bottom = 8.dp),
    )
}

@Composable
private fun SwitchRow(label: String, checked: Boolean, onChecked: (Boolean) -> Unit) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label)
        Switch(checked = checked, onCheckedChange = onChecked)
    }
}
