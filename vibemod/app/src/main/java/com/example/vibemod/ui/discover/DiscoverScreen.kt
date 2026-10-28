package com.example.vibemod.ui.discover

import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.AssistChip
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.vibemod.domain.model.VideoFilter

@Composable
fun DiscoverScreen(vm: DiscoverViewModel = hiltViewModel()) {
    val state by vm.uiState.collectAsStateWithLifecycle()

    Column(
        Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 12.dp),
    ) {
        Text("Discover", style = MaterialTheme.typography.headlineLarge)
        Text(
            "Search locally imported and demo video metadata",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 12.dp),
        )

        OutlinedTextField(
            value = state.query,
            onValueChange = vm::onQueryChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Titles, authors, categories…") },
            leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
            trailingIcon = {
                if (state.query.isNotEmpty()) {
                    IconButton(onClick = { vm.onQueryChange("") }) {
                        Icon(Icons.Filled.Clear, contentDescription = "Clear")
                    }
                }
            },
            singleLine = true,
        )

        Row(
            Modifier
                .padding(vertical = 8.dp)
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            VideoFilter.entries.forEach { f ->
                FilterChip(
                    selected = state.filter == f,
                    onClick = { vm.setFilter(f) },
                    label = { Text(f.name.lowercase().replaceFirstChar { it.titlecase() }) },
                )
            }
        }

        Row(
            Modifier
                .padding(bottom = 8.dp)
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            FilterChip(
                selected = state.selectedCategory == null,
                onClick = { vm.selectCategory(null) },
                label = { Text("All categories") },
            )
            state.categories.forEach { cat ->
                FilterChip(
                    selected = state.selectedCategory == cat,
                    onClick = { vm.selectCategory(cat) },
                    label = { Text(cat) },
                )
            }
        }

        if (state.history.isNotEmpty() && state.rememberHistory && state.query.isBlank()) {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text("Recent searches", style = MaterialTheme.typography.titleMedium)
                TextButton(onClick = vm::clearHistory) { Text("Clear") }
            }
            Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                state.history.forEach { item ->
                    AssistChip(onClick = { vm.selectHistory(item) }, label = { Text(item) })
                }
            }
        }

        TextButton(onClick = vm::submitSearch, modifier = Modifier.padding(vertical = 4.dp)) {
            Text("Save search to history")
        }

        LazyColumn(
            contentPadding = PaddingValues(bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            if (state.results.isEmpty()) {
                item {
                    Text(
                        "No matches",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(24.dp),
                    )
                }
            }
            items(state.results, key = { it.id }) { video ->
                Column(
                    Modifier
                        .fillMaxWidth()
                        .clickable { }
                        .padding(vertical = 10.dp),
                ) {
                    Text(video.title, style = MaterialTheme.typography.titleMedium)
                    Text(
                        "${video.authorName} · ${video.category}" +
                            if (video.isDemo) " · DEMO" else "",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}
