package com.example.vibemod.ui.navigation

sealed class Route(val path: String) {
    data object Feed : Route("feed")
    data object Discover : Route("discover")
    data object Library : Route("library")
    data object ModCenter : Route("mod")
    data object Profile : Route("profile")
    data object Settings : Route("settings")
    data object Lock : Route("lock")
}

val bottomDestinations = listOf(
    Route.Feed,
    Route.Discover,
    Route.Library,
    Route.ModCenter,
    Route.Profile,
)
