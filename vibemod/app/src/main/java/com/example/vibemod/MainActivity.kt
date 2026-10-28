package com.example.vibemod

import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.core.view.WindowCompat
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.vibemod.ui.navigation.VibeModRoot
import com.example.vibemod.ui.theme.VibeModTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        WindowCompat.setDecorFitsSystemWindows(window, false)
        setContent {
            val vm: MainViewModel = hiltViewModel()
            val prefs by vm.preferences.collectAsStateWithLifecycle()
            val unlocked by vm.unlocked.collectAsStateWithLifecycle()

            LaunchedEffect(prefs.keepScreenOn) {
                if (prefs.keepScreenOn) {
                    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                } else {
                    window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                }
            }

            VibeModTheme(prefs = prefs) {
                Surface(modifier = Modifier.fillMaxSize()) {
                    VibeModRoot(
                        prefs = prefs,
                        unlocked = unlocked,
                        onUnlock = vm::unlock,
                        onVerifyPin = vm::verifyPin,
                    )
                }
            }
        }
    }
}
