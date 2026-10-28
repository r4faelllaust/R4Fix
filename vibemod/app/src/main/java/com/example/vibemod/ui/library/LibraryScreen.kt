package com.example.vibemod.ui.library

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.vibemod.domain.model.VideoFilter
import com.example.vibemod.domain.model.VideoSort
import com.example.vibemod.ui.theme.LocalVibeExtras

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibraryScreen(vm: LibraryViewModel = hiltViewModel()) {
    val state by vm.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val extras = LocalVibeExtras.current

    val picker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
    ) { uri ->
        if (uri != null) vm.importUri(uri)
    }

    LaunchedEffect(state.message) {
        state.message?.let {
            snackbar.showSnackbar(it)
            vm.clearMessage()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    picker.launch(
                        PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly),
                    )
                },
                containerColor = extras.accent,
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Import video")
            }
        },
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
        ) {
            Text("Library", style = MaterialTheme.typography.headlineLarge)
            Text(
                "Import, organize, favorite, and remove local videos",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            Row(
                Modifier
                    .padding(vertical = 8.dp)
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                VideoSort.entries.forEach { s ->
                    FilterChip(
                        selected = state.sort == s,
                        onClick = { vm.setSort(s) },
                        label = {
                            Text(
                                when (s) {
                                    VideoSort.RECENT -> "Recent"
                                    VideoSort.TITLE -> "Title"
                                    VideoSort.DURATION -> "Duration"
                                    VideoSort.FAVORITES_FIRST -> "Favorites"
                                },
                            )
                        },
                    )
                }
            }

            Row(
                Modifier
                    .padding(bottom = 8.dp)
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                VideoFilter.entries.forEach { f ->
                    FilterChip(
                        selected = state.filter == f,
                        onClick = { vm.setFilter(f) },
                        label = {
                            Text(f.name.lowercase().replaceFirstChar { it.titlecase() })
                        },
                    )
                }
            }

            if (state.importing) {
                Text("Importing…", color = extras.accent)
            }

            LazyColumn(
                contentPadding = PaddingValues(bottom = 96.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                if (state.videos.isEmpty()) {
                    item {
                        Text(
                            "Your library is empty. Tap + to import a video you own.",
                            modifier = Modifier.padding(24.dp),
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
                items(state.videos, key = { it.id }) { video ->
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .padding(vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Column(Modifier.weight(1f)) {
                            Text(video.title, style = MaterialTheme.typography.titleMedium)
                            Text(
                                buildString {
                                    append(video.category)
                                    if (video.isDemo) append(" · DEMO")
                                    if (video.fileMissing) append(" · missing file")
                                    video.collection?.let { append(" · $it") }
                                },
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                        IconButton(onClick = {
                            vm.setCollection(
                                video,
                                if (video.collection == null) "Favorites+" else null,
                            )
                        }) {
                            Icon(Icons.Filled.Folder, contentDescription = "Toggle collection")
                        }
                        IconButton(onClick = { vm.toggleFavorite(video) }) {
                            Icon(
                                if (video.isFavorite) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                                contentDescription = "Favorite",
                                tint = if (video.isFavorite) {
                                    MaterialTheme.colorScheme.error
                                } else {
                                    MaterialTheme.colorScheme.onSurface
                                },
                            )
                        }
                        if (!video.isDemo) {
                            IconButton(onClick = { vm.remove(video) }) {
                                Icon(Icons.Filled.Delete, contentDescription = "Remove")
                            }
                        }
                    }
                }
            }
        }
    }
}
