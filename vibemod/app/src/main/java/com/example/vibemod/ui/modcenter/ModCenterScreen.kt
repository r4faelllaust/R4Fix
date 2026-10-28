package com.example.vibemod.ui.modcenter

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.vibemod.Branding
import com.example.vibemod.domain.model.AccentColor
import com.example.vibemod.domain.model.DoubleTapAction
import com.example.vibemod.domain.model.NavStyle
import com.example.vibemod.domain.model.ThemeMode
import com.example.vibemod.domain.model.VideoSort
import com.example.vibemod.ui.components.BadgeChip
import com.example.vibemod.ui.theme.LocalVibeExtras

@Composable
fun ModCenterScreen(
    onOpenSettings: () -> Unit,
    vm: ModCenterViewModel = hiltViewModel(),
) {
    val state by vm.uiState.collectAsStateWithLifecycle()
    val prefs = state.prefs
    val extras = LocalVibeExtras.current
    var pinInput by remember { mutableStateOf("") }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
            .testTag("mod_center_screen"),
    ) {
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column {
                Text("Mod Center", style = MaterialTheme.typography.headlineLarge)
                Text(
                    "Every switch changes real app behavior",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            TextButton(
                onClick = onOpenSettings,
                modifier = Modifier.testTag("mod_open_settings"),
            ) { Text("Settings") }
        }

        // Live preview
        SectionTitle("Live preview")
        val previewBg by animateColorAsState(
            if (extras.amoled) Color.Black else MaterialTheme.colorScheme.surfaceVariant,
            label = "previewBg",
        )
        Box(
            Modifier
                .fillMaxWidth()
                .height(120.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(previewBg)
                .border(1.dp, extras.accent.copy(alpha = 0.5f), RoundedCornerShape(16.dp))
                .padding(16.dp),
        ) {
            Column {
                Text(
                    Branding.APP_NAME,
                    style = MaterialTheme.typography.titleLarge,
                    color = extras.accent,
                )
                Text(
                    "@${state.profile.username}",
                    color = MaterialTheme.colorScheme.onSurface,
                )
                if (prefs.showBadgeOnProfile) {
                    Spacer(Modifier.height(6.dp))
                    BadgeChip(style = state.profile.badgeStyle)
                }
            }
        }

        SectionTitle("Appearance")
        ChipRow {
            ThemeMode.entries.forEach { mode ->
                FilterChip(
                    selected = prefs.themeMode == mode,
                    onClick = { vm.setThemeMode(mode) },
                    label = { Text(mode.name) },
                )
            }
        }
        ModSwitch("AMOLED black", prefs.amoledMode, vm::setAmoled)
        Text("Accent", style = MaterialTheme.typography.titleSmall)
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            AccentColor.entries.forEach { accent ->
                val selected = prefs.accentColor == accent
                Box(
                    Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(Color(accent.colorLong))
                        .border(
                            width = if (selected) 3.dp else 1.dp,
                            color = if (selected) Color.White else Color.Gray,
                            shape = CircleShape,
                        )
                        .clickable { vm.setAccent(accent) },
                )
            }
        }
        ChipRow {
            NavStyle.entries.forEach { style ->
                FilterChip(
                    selected = prefs.navStyle == style,
                    onClick = { vm.setNavStyle(style) },
                    label = { Text(style.name) },
                )
            }
        }
        ModSwitch("Bottom nav labels", prefs.showBottomLabels, vm::setShowBottomLabels)
        ModSwitch("Hide username overlay", prefs.hideUsernameOverlay, vm::setHideUsername)
        ModSwitch("Hide description overlay", prefs.hideDescriptionOverlay, vm::setHideDescription)
        ModSwitch("Hide action rail", prefs.hideActionRail, vm::setHideActionRail)
        Text("Animation scale ${(prefs.animationScale * 100).toInt()}%")
        Slider(
            value = prefs.animationScale,
            onValueChange = vm::setAnimationScale,
            valueRange = 0f..1.5f,
        )

        SectionTitle("Playback")
        Text("Default speed ${"%.2f".format(prefs.defaultPlaybackSpeed)}x")
        Slider(
            value = prefs.defaultPlaybackSpeed,
            onValueChange = vm::setDefaultSpeed,
            valueRange = 0.5f..2f,
            steps = 5,
        )
        ModSwitch("Auto-loop", prefs.autoLoop, vm::setAutoLoop)
        ModSwitch("Auto-play", prefs.autoPlay, vm::setAutoPlay)
        ModSwitch("Mute on launch", prefs.muteOnLaunch, vm::setMuteOnLaunch)

        SectionTitle("Feed")
        ChipRow {
            VideoSort.entries.forEach { sort ->
                FilterChip(
                    selected = prefs.videoSort == sort,
                    onClick = { vm.setVideoSort(sort) },
                    label = { Text(sort.name) },
                )
            }
        }
        ModSwitch("Show demo videos", prefs.showDemoVideos, vm::setShowDemo)
        ModSwitch("Swipe haptics", prefs.feedSwipeHaptics, vm::setFeedHaptics)

        SectionTitle("Privacy")
        ModSwitch("Remember search history", prefs.rememberSearchHistory, vm::setRememberSearch)
        ModSwitch("Clear search on exit", prefs.clearSearchOnExit, vm::setClearSearchOnExit)
        ModSwitch(
            "PIN lock",
            prefs.pinLockEnabled,
            onChecked = { enabled ->
                if (!enabled) vm.disablePin()
            },
        )
        if (!prefs.pinLockEnabled) {
            OutlinedTextField(
                value = pinInput,
                onValueChange = { pinInput = it.filter(Char::isDigit).take(8) },
                label = { Text("Set 4–8 digit PIN") },
                modifier = Modifier.fillMaxWidth(),
            )
            TextButton(
                onClick = {
                    if (pinInput.length in 4..8) {
                        vm.enablePin(pinInput)
                        pinInput = ""
                    }
                },
            ) { Text("Enable PIN lock") }
        } else {
            Text("PIN lock is on. Disable with the switch above.", color = extras.accent)
        }

        SectionTitle("Accessibility")
        ModSwitch("Reduced motion", prefs.reducedMotion, vm::setReducedMotion)
        ModSwitch("Large touch targets", prefs.largeTouchTargets, vm::setLargeTouch)
        ModSwitch("High contrast text", prefs.highContrastText, vm::setHighContrast)

        SectionTitle("Gestures")
        ModSwitch("Seek via horizontal drag", prefs.seekViaGestures, vm::setSeekGestures)
        ModSwitch("Haptic feedback", prefs.hapticFeedback, vm::setHaptics)
        Text("Double-tap action")
        ChipRow {
            DoubleTapAction.entries.forEach { action ->
                FilterChip(
                    selected = prefs.doubleTapAction == action,
                    onClick = { vm.setDoubleTap(action) },
                    label = { Text(action.name) },
                )
            }
        }

        SectionTitle("Badges")
        ModSwitch("Show badge in feed", prefs.showBadgeInFeed, vm::setShowBadgeFeed)
        ModSwitch("Show badge on profile", prefs.showBadgeOnProfile, vm::setShowBadgeProfile)
        Text(Branding.BADGE_DISCLAIMER, style = MaterialTheme.typography.bodySmall)

        SectionTitle("Advanced")
        ModSwitch("Keep screen on", prefs.keepScreenOn, vm::setKeepScreenOn)
        ModSwitch("Debug overlay", prefs.debugOverlay, vm::setDebugOverlay)
        Text(
            "Remote social features: unsupported in this build (no backend).",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(32.dp))
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleLarge,
        color = LocalVibeExtras.current.accent,
        modifier = Modifier.padding(top = 20.dp, bottom = 8.dp),
    )
}

@Composable
private fun ModSwitch(label: String, checked: Boolean, onChecked: (Boolean) -> Unit) {
    Row(
        Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label, style = MaterialTheme.typography.bodyLarge, modifier = Modifier.weight(1f))
        Switch(checked = checked, onCheckedChange = onChecked)
    }
}

@Composable
private fun ChipRow(content: @Composable () -> Unit) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(vertical = 4.dp),
    ) {
        content()
    }
}
