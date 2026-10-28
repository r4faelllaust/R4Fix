package com.example.vibemod.ui.settings

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.vibemod.Branding
import com.example.vibemod.BuildConfig

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onBack: () -> Unit,
    vm: SettingsViewModel = hiltViewModel(),
) {
    val state by vm.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    var importText by remember { mutableStateOf("") }

    LaunchedEffect(state.message) {
        state.message?.let {
            snackbar.showSnackbar(it)
            vm.clearMessage()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
            )
        },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
        ) {
            Text("Preferences backup", style = MaterialTheme.typography.titleLarge)
            Text(
                "Export or import JSON. PIN hashes are included — treat exports as sensitive.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(8.dp))
            Button(onClick = vm::exportPrefs, modifier = Modifier.fillMaxWidth()) {
                Text("Export preferences to JSON")
            }
            state.exportJson?.let { json ->
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = json,
                    onValueChange = {},
                    readOnly = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(160.dp),
                    label = { Text("Exported JSON") },
                )
                OutlinedButton(
                    onClick = {
                        val clipboard =
                            context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("VibeMod prefs", json))
                    },
                    modifier = Modifier.fillMaxWidth(),
                ) { Text("Copy JSON") }
            }

            Spacer(Modifier.height(16.dp))
            OutlinedTextField(
                value = importText,
                onValueChange = { importText = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                label = { Text("Paste JSON to import") },
            )
            Button(
                onClick = { vm.importPrefs(importText) },
                modifier = Modifier.fillMaxWidth(),
                enabled = importText.isNotBlank(),
            ) { Text("Import preferences") }

            Spacer(Modifier.height(24.dp))
            Text("Reset", style = MaterialTheme.typography.titleLarge)
            OutlinedButton(
                onClick = vm::reset,
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Reset all settings & profile") }

            Spacer(Modifier.height(24.dp))
            Text("Privacy", style = MaterialTheme.typography.titleLarge)
            Text(
                "VibeMod stores preferences, PIN hash, search history, and video metadata on this " +
                    "device only. Demo streams use public sample URLs when enabled. " +
                    "There is no account system, analytics SDK, or remote social graph in this build.",
                style = MaterialTheme.typography.bodyMedium,
            )

            Spacer(Modifier.height(24.dp))
            Text("About", style = MaterialTheme.typography.titleLarge)
            Text(Branding.APP_NAME, style = MaterialTheme.typography.titleMedium)
            Text("Version ${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})")
            Text(Branding.ABOUT_BLURB, style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.height(32.dp))
        }
    }
}
