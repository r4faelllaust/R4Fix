package com.example.vibemod.ui.navigation

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.SettingsSuggest
import androidx.compose.material.icons.outlined.VideoLibrary
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.vibemod.domain.model.ModPreferences
import com.example.vibemod.domain.model.NavStyle
import com.example.vibemod.ui.discover.DiscoverScreen
import com.example.vibemod.ui.feed.FeedScreen
import com.example.vibemod.ui.library.LibraryScreen
import com.example.vibemod.ui.lock.PinLockScreen
import com.example.vibemod.ui.modcenter.ModCenterScreen
import com.example.vibemod.ui.profile.ProfileScreen
import com.example.vibemod.ui.settings.SettingsScreen
import com.example.vibemod.ui.theme.LocalVibeExtras

private data class NavItem(
    val route: Route,
    val label: String,
    val icon: ImageVector,
)

@Composable
fun VibeModRoot(
    prefs: ModPreferences,
    unlocked: Boolean,
    onUnlock: () -> Unit,
    onVerifyPin: (String) -> Boolean,
) {
    if (prefs.pinLockEnabled && !unlocked) {
        PinLockScreen(onVerify = onVerifyPin)
        return
    }

    val navController = rememberNavController()
    val backStack by navController.currentBackStackEntryAsState()
    val current = backStack?.destination?.route
    val extras = LocalVibeExtras.current
    val showLabels = prefs.navStyle != NavStyle.ICONS_ONLY && prefs.showBottomLabels
    val hideBar = current == Route.Settings.path

    val items = listOf(
        NavItem(Route.Feed, "Feed", Icons.Outlined.Home),
        NavItem(Route.Discover, "Discover", Icons.Outlined.Explore),
        NavItem(Route.Library, "Library", Icons.Outlined.VideoLibrary),
        NavItem(Route.ModCenter, "Mod", Icons.Outlined.SettingsSuggest),
        NavItem(Route.Profile, "Profile", Icons.Outlined.Person),
    )

    Scaffold(
        bottomBar = {
            AnimatedVisibility(
                visible = !hideBar,
                enter = fadeIn() + slideInVertically { it },
                exit = fadeOut() + slideOutVertically { it },
            ) {
                NavigationBar(
                    tonalElevation = if (prefs.navStyle == NavStyle.FLOATING) 8.dp else 0.dp,
                    containerColor = MaterialTheme.colorScheme.surface.copy(
                        alpha = if (extras.amoled) 0.92f else 0.98f,
                    ),
                ) {
                    items.forEach { item ->
                        val selected = current == item.route.path
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                navController.navigate(item.route.path) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            modifier = Modifier
                                .testTag("nav_${item.route.path}")
                                .semantics { contentDescription = "Navigate ${item.label}" },
                            icon = {
                                Icon(item.icon, contentDescription = item.label)
                            },
                            label = if (showLabels) {
                                { Text(item.label) }
                            } else {
                                null
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = extras.accent,
                                selectedTextColor = extras.accent,
                                indicatorColor = extras.accent.copy(alpha = 0.18f),
                            ),
                        )
                    }
                }
            }
        },
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = Route.Feed.path,
            modifier = Modifier.padding(padding),
        ) {
            composable(Route.Feed.path) { FeedScreen() }
            composable(Route.Discover.path) { DiscoverScreen() }
            composable(Route.Library.path) { LibraryScreen() }
            composable(Route.ModCenter.path) {
                ModCenterScreen(onOpenSettings = { navController.navigate(Route.Settings.path) })
            }
            composable(Route.Profile.path) {
                ProfileScreen(onOpenSettings = { navController.navigate(Route.Settings.path) })
            }
            composable(Route.Settings.path) {
                SettingsScreen(onBack = { navController.popBackStack() })
            }
        }
    }
}
