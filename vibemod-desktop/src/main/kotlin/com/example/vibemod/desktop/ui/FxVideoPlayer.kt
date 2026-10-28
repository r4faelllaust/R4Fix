package com.example.vibemod.desktop.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.awt.SwingPanel
import androidx.compose.ui.graphics.Color
import java.io.File
import javafx.application.Platform
import javafx.embed.swing.JFXPanel
import javafx.scene.Scene
import javafx.scene.layout.StackPane
import javafx.scene.media.Media
import javafx.scene.media.MediaPlayer
import javafx.scene.media.MediaView
import javafx.util.Duration
import javax.swing.JPanel

private object JavaFxInit {
    init {
        // Ensure toolkit is ready before first JFXPanel
        JFXPanel()
    }
}

@Composable
fun FxVideoPlayer(
    source: String,
    active: Boolean,
    muted: Boolean,
    speed: Float,
    looping: Boolean,
    autoPlay: Boolean,
    modifier: Modifier = Modifier,
) {
    remember { JavaFxInit }
    var errorText by remember(source) { mutableStateOf<String?>(null) }
    var playerRef by remember(source) { mutableStateOf<MediaPlayer?>(null) }

    val panel = remember(source) {
        val host = JPanel()
        host.layout = java.awt.BorderLayout()
        val fx = JFXPanel()
        host.add(fx, java.awt.BorderLayout.CENTER)
        Platform.runLater {
            try {
                val uri = if (source.startsWith("http")) {
                    source
                } else {
                    File(source).toURI().toString()
                }
                val media = Media(uri)
                val player = MediaPlayer(media).apply {
                    isAutoPlay = false
                    cycleCount = if (looping) MediaPlayer.INDEFINITE else 1
                    setOnError {
                        errorText = error?.message ?: "Playback error"
                    }
                }
                playerRef = player
                val view = MediaView(player).apply {
                    isPreserveRatio = true
                }
                val root = StackPane(view)
                fx.scene = Scene(root)
                fx.addComponentListener(object : java.awt.event.ComponentAdapter() {
                    override fun componentResized(e: java.awt.event.ComponentEvent?) {
                        Platform.runLater {
                            view.fitWidth = fx.width.toDouble()
                            view.fitHeight = fx.height.toDouble()
                        }
                    }
                })
            } catch (t: Throwable) {
                errorText = t.message ?: "Failed to open media"
            }
        }
        host
    }

    LaunchedEffect(active, autoPlay, playerRef) {
        Platform.runLater {
            val p = playerRef ?: return@runLater
            if (active && autoPlay) p.play() else p.pause()
        }
    }
    LaunchedEffect(muted, playerRef) {
        Platform.runLater { playerRef?.isMute = muted }
    }
    LaunchedEffect(speed, playerRef) {
        Platform.runLater { playerRef?.rate = speed.toDouble().coerceIn(0.5, 2.0) }
    }
    LaunchedEffect(looping, playerRef) {
        Platform.runLater {
            playerRef?.cycleCount = if (looping) MediaPlayer.INDEFINITE else 1
        }
    }

    DisposableEffect(source) {
        onDispose {
            Platform.runLater {
                playerRef?.stop()
                playerRef?.dispose()
                playerRef = null
            }
        }
    }

    Box(modifier.background(Color.Black)) {
        SwingPanel(
            factory = { panel },
            modifier = Modifier.fillMaxSize(),
            background = Color.Black,
        )
        errorText?.let {
            Text(it, color = Color.White, modifier = Modifier.align(Alignment.Center))
        }
    }
}

fun seekRelative(player: MediaPlayer?, seconds: Double) {
    Platform.runLater {
        val p = player ?: return@runLater
        val next = p.currentTime.add(Duration.seconds(seconds))
        p.seek(next)
    }
}
