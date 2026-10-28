package com.example.vibemod.ui.feed

import android.content.Intent
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
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
import androidx.compose.foundation.pager.VerticalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Loop
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.VolumeOff
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.vibemod.ui.components.BadgeDot
import com.example.vibemod.ui.components.VideoPlayer
import com.example.vibemod.ui.theme.LocalVibeExtras
import kotlinx.coroutines.flow.distinctUntilChanged

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun FeedScreen(vm: FeedViewModel = hiltViewModel()) {
    val state by vm.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val extras = LocalVibeExtras.current
    val pagerState = rememberPagerState(pageCount = { state.videos.size })

    LaunchedEffect(pagerState, state.prefs.feedSwipeHaptics) {
        snapshotFlow { pagerState.settledPage }
            .distinctUntilChanged()
            .collect { page ->
                vm.setIndex(page)
                if (state.prefs.feedSwipeHaptics && state.prefs.hapticFeedback) {
                    vibrateLight(context)
                }
            }
    }

    if (state.videos.isEmpty()) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("No videos yet", style = MaterialTheme.typography.headlineMedium)
                Spacer(Modifier.height(8.dp))
                Text(
                    "Import clips from Library, or enable demo videos in Mod Center.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
        return
    }

    Box(Modifier.fillMaxSize()) {
        VerticalPager(
            state = pagerState,
            modifier = Modifier.fillMaxSize(),
            key = { state.videos[it].id },
        ) { page ->
            val video = state.videos[page]
            Box(Modifier.fillMaxSize()) {
                VideoPlayer(
                    video = video,
                    isActive = page == pagerState.settledPage,
                    prefs = state.prefs,
                    muted = state.muted,
                    speed = state.speed,
                    looping = state.looping,
                    onToggleMute = vm::toggleMute,
                    onFavorite = { vm.toggleFavorite(video.id, video.isFavorite) },
                )

                Box(
                    Modifier
                        .fillMaxWidth()
                        .align(Alignment.BottomCenter)
                        .height(220.dp)
                        .background(
                            Brush.verticalGradient(
                                listOf(Color.Transparent, Color.Black.copy(alpha = 0.75f)),
                            ),
                        ),
                )

                Column(
                    Modifier
                        .align(Alignment.BottomStart)
                        .padding(start = 16.dp, end = 88.dp, bottom = 24.dp),
                ) {
                    if (!state.prefs.hideUsernameOverlay) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "@${video.authorName}",
                                style = MaterialTheme.typography.titleMedium,
                                color = Color.White,
                            )
                            if (state.prefs.showBadgeInFeed) {
                                BadgeDot(
                                    style = state.profile.badgeStyle,
                                    modifier = Modifier.padding(start = 6.dp),
                                )
                            }
                            if (video.isDemo) {
                                Text(
                                    text = " · DEMO",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = extras.accent,
                                    modifier = Modifier.padding(start = 6.dp),
                                )
                            }
                        }
                    }
                    if (!state.prefs.hideDescriptionOverlay) {
                        Spacer(Modifier.height(6.dp))
                        Text(
                            text = video.title,
                            style = MaterialTheme.typography.bodyLarge,
                            color = Color.White,
                        )
                        AnimatedVisibility(
                            visible = state.showDetails,
                            enter = fadeIn(),
                            exit = fadeOut(),
                        ) {
                            Text(
                                text = video.description,
                                style = MaterialTheme.typography.bodyMedium,
                                color = Color.White.copy(alpha = 0.85f),
                                modifier = Modifier.padding(top = 4.dp),
                            )
                        }
                    }
                }

                if (!state.prefs.hideActionRail) {
                    Column(
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(end = 12.dp, bottom = 32.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        FeedAction(
                            icon = if (video.isFavorite) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                            label = "Favorite",
                            tint = if (video.isFavorite) Color(0xFFFF2D55) else Color.White,
                        ) { vm.toggleFavorite(video.id, video.isFavorite) }
                        FeedAction(
                            icon = if (state.muted) Icons.Filled.VolumeOff else Icons.Filled.VolumeUp,
                            label = "Mute",
                        ) { vm.toggleMute() }
                        FeedAction(icon = Icons.Filled.Speed, label = "${state.speed}x") {
                            vm.cycleSpeed()
                        }
                        FeedAction(
                            icon = Icons.Filled.Loop,
                            label = if (state.looping) "Loop on" else "Loop off",
                            tint = if (state.looping) extras.accent else Color.White,
                        ) { vm.toggleLoop() }
                        FeedAction(icon = Icons.Filled.Info, label = "Details") {
                            vm.toggleDetails()
                        }
                        FeedAction(icon = Icons.Filled.Share, label = "Share") {
                            val share = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(
                                    Intent.EXTRA_TEXT,
                                    "${video.title} — shared from VibeMod (local/demo)",
                                )
                            }
                            context.startActivity(Intent.createChooser(share, "Share video"))
                        }
                    }
                }

                if (state.prefs.debugOverlay) {
                    Text(
                        text = "idx=$page speed=${state.speed} mute=${state.muted}",
                        color = Color.Lime,
                        style = MaterialTheme.typography.labelSmall,
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .padding(12.dp)
                            .background(Color.Black.copy(0.5f), RoundedCornerShape(6.dp))
                            .padding(6.dp),
                    )
                }
            }
        }
    }
}

@Composable
private fun FeedAction(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    tint: Color = Color.White,
    onClick: () -> Unit,
) {
    val extras = LocalVibeExtras.current
    val size = if (extras.largeTouchTargets) 56.dp else 48.dp
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        IconButton(
            onClick = onClick,
            modifier = Modifier
                .size(size)
                .clip(CircleShape)
                .background(Color.Black.copy(alpha = 0.35f))
                .semantics { contentDescription = label },
        ) {
            Icon(icon, contentDescription = label, tint = tint)
        }
        Text(label, style = MaterialTheme.typography.labelSmall, color = Color.White)
    }
}

@Suppress("DEPRECATION")
private fun vibrateLight(context: android.content.Context) {
    try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val manager = context.getSystemService(VibratorManager::class.java)
            manager?.defaultVibrator?.vibrate(
                VibrationEffect.createOneShot(12, VibrationEffect.DEFAULT_AMPLITUDE),
            )
        } else {
            val vibrator = context.getSystemService(Vibrator::class.java)
            vibrator?.vibrate(VibrationEffect.createOneShot(12, VibrationEffect.DEFAULT_AMPLITUDE))
        }
    } catch (_: Exception) {
    }
}

private val Color.Companion.Lime: Color get() = Color(0xFFB8FF00)
