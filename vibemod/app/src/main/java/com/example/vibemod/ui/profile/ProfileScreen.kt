package com.example.vibemod.ui.profile

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.vibemod.Branding
import com.example.vibemod.domain.model.BadgeStyle
import com.example.vibemod.ui.components.BadgeChip
import com.example.vibemod.ui.theme.LocalVibeExtras

@Composable
fun ProfileScreen(
    onOpenSettings: () -> Unit,
    vm: ProfileViewModel = hiltViewModel(),
) {
    val state by vm.uiState.collectAsStateWithLifecycle()
    val extras = LocalVibeExtras.current
    val profile = state.profile

    val avatarPicker = rememberLauncherForActivityResult(
        ActivityResultContracts.PickVisualMedia(),
    ) { uri -> vm.setAvatar(uri) }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
    ) {
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("Profile", style = MaterialTheme.typography.headlineLarge)
            IconButton(onClick = onOpenSettings) {
                Icon(Icons.Outlined.Settings, contentDescription = "Settings")
            }
        }

        Text(
            "Local profile · stats are demo/local only",
            style = MaterialTheme.typography.labelLarge,
            color = extras.accent,
        )

        Spacer(Modifier.height(20.dp))

        Box(
            Modifier
                .size(96.dp)
                .align(Alignment.CenterHorizontally)
                .clip(CircleShape)
                .background(
                    Brush.linearGradient(listOf(extras.accent, Color(0xFFA855F7))),
                )
                .border(2.dp, extras.accent, CircleShape)
                .clickable {
                    avatarPicker.launch(
                        PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly),
                    )
                },
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = profile.username.take(1).uppercase(),
                style = MaterialTheme.typography.displayLarge,
                color = Color.White,
            )
        }

        Spacer(Modifier.height(16.dp))

        OutlinedTextField(
            value = profile.username,
            onValueChange = vm::setUsername,
            label = { Text("Username") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Spacer(Modifier.height(8.dp))
        OutlinedTextField(
            value = profile.biography,
            onValueChange = vm::setBiography,
            label = { Text("Biography") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2,
        )

        Spacer(Modifier.height(16.dp))
        Text("Visual badge (custom decoration)", style = MaterialTheme.typography.titleMedium)
        Text(
            Branding.BADGE_DISCLAIMER,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(8.dp))
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth(),
        ) {
            // wrap chips
        }
        BadgeStyle.entries.chunked(3).forEach { row ->
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(vertical = 4.dp),
            ) {
                row.forEach { style ->
                    FilterChip(
                        selected = profile.badgeStyle == style,
                        onClick = { vm.setBadge(style) },
                        label = { Text(style.displayName) },
                    )
                }
            }
        }

        if (state.showBadge && profile.badgeStyle.isDecoration) {
            Spacer(Modifier.height(8.dp))
            BadgeChip(style = profile.badgeStyle, showDisclaimer = true)
        }

        Spacer(Modifier.height(24.dp))
        Text("Local stats", style = MaterialTheme.typography.titleMedium)
        Row(
            Modifier
                .fillMaxWidth()
                .padding(top = 12.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
        ) {
            StatCell("Videos", profile.localVideoCount.toString())
            StatCell("Favorites", profile.favoriteCount.toString())
            StatCell("Demo views", profile.demoViews.toString())
        }
        Text(
            "These numbers never leave this device.",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 8.dp),
        )
    }
}

@Composable
private fun StatCell(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, style = MaterialTheme.typography.headlineMedium)
        Text(label, style = MaterialTheme.typography.labelMedium)
    }
}
