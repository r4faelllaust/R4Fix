package com.example.vibemod.ui.components

import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.annotation.OptIn
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import com.example.vibemod.domain.model.DoubleTapAction
import com.example.vibemod.domain.model.ModPreferences
import com.example.vibemod.domain.model.VideoItem
import kotlin.math.abs

@OptIn(UnstableApi::class)
@Composable
fun VideoPlayer(
    video: VideoItem,
    isActive: Boolean,
    prefs: ModPreferences,
    muted: Boolean,
    speed: Float,
    looping: Boolean,
    onToggleMute: () -> Unit,
    onFavorite: () -> Unit,
    onDoubleTapSeek: (forward: Boolean) -> Unit = {},
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    var isPlaying by remember(video.id) { mutableStateOf(prefs.autoPlay) }
    var buffering by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var positionMs by remember { mutableLongStateOf(0L) }
    var dragAccum by remember { mutableFloatStateOf(0f) }

    val player = remember(video.id) {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(video.uri))
            prepare()
            playWhenReady = false
            repeatMode = if (prefs.autoLoop) Player.REPEAT_MODE_ONE else Player.REPEAT_MODE_OFF
            volume = if (prefs.muteOnLaunch) 0f else 1f
            setPlaybackSpeed(prefs.clampedSpeed())
        }
    }

    DisposableEffect(video.id) {
        val listener = object : Player.Listener {
            override fun onPlaybackStateChanged(playbackState: Int) {
                buffering = playbackState == Player.STATE_BUFFERING
                if (playbackState == Player.STATE_READY) error = null
            }

            override fun onPlayerError(e: androidx.media3.common.PlaybackException) {
                error = e.message ?: "Playback failed"
                buffering = false
            }

            override fun onIsPlayingChanged(playing: Boolean) {
                isPlaying = playing
            }
        }
        player.addListener(listener)
        onDispose {
            player.removeListener(listener)
            player.release()
        }
    }

    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner, player) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_PAUSE -> player.pause()
                Lifecycle.Event.ON_RESUME -> if (isActive && prefs.autoPlay) player.play()
                else -> Unit
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    LaunchedEffect(isActive, prefs.autoPlay) {
        if (isActive && prefs.autoPlay) player.play() else player.pause()
    }
    LaunchedEffect(muted) { player.volume = if (muted) 0f else 1f }
    LaunchedEffect(speed) { player.setPlaybackSpeed(speed.coerceIn(0.5f, 2f)) }
    LaunchedEffect(looping) {
        player.repeatMode = if (looping) Player.REPEAT_MODE_ONE else Player.REPEAT_MODE_OFF
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color.Black)
            .pointerInput(video.id, prefs.doubleTapAction, prefs.seekViaGestures) {
                detectTapGestures(
                    onTap = {
                        if (player.isPlaying) player.pause() else player.play()
                    },
                    onDoubleTap = { offset ->
                        when (prefs.doubleTapAction) {
                            DoubleTapAction.LIKE -> onFavorite()
                            DoubleTapAction.PLAY_PAUSE -> {
                                if (player.isPlaying) player.pause() else player.play()
                            }
                            DoubleTapAction.SEEK_FORWARD -> {
                                val forward = offset.x > size.width / 2f
                                val delta = if (forward) 10_000L else -10_000L
                                player.seekTo((player.currentPosition + delta).coerceAtLeast(0L))
                                onDoubleTapSeek(forward)
                            }
                            DoubleTapAction.NONE -> Unit
                        }
                    },
                )
            }
            .then(
                if (prefs.seekViaGestures) {
                    Modifier.pointerInput(video.id) {
                        detectHorizontalDragGestures(
                            onDragEnd = {
                                if (abs(dragAccum) > 40f) {
                                    val delta = (dragAccum * 30).toLong()
                                    player.seekTo((player.currentPosition + delta).coerceAtLeast(0L))
                                }
                                dragAccum = 0f
                            },
                            onHorizontalDrag = { _, amount ->
                                dragAccum += amount
                            },
                        )
                    }
                } else {
                    Modifier
                },
            ),
    ) {
        if (video.fileMissing) {
            Text(
                "File missing or inaccessible",
                color = Color.White,
                modifier = Modifier.align(Alignment.Center),
            )
        } else {
            AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        useController = false
                        resizeMode = AspectRatioFrameLayout.RESIZE_MODE_ZOOM
                        this.player = player
                        layoutParams = FrameLayout.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT,
                        )
                    }
                },
                update = { it.player = player },
                modifier = Modifier.fillMaxSize(),
            )
        }

        if (buffering && error == null) {
            CircularProgressIndicator(
                modifier = Modifier.align(Alignment.Center),
                color = MaterialTheme.colorScheme.primary,
            )
        }
        error?.let {
            Text(
                text = it,
                color = Color.White,
                modifier = Modifier.align(Alignment.Center),
            )
        }
        if (!isPlaying && !buffering && error == null) {
            Text(
                text = "Tap to play",
                color = Color.White.copy(alpha = 0.8f),
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.align(Alignment.Center),
            )
        }
    }
}
