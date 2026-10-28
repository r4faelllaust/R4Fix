package com.example.vibemod

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Emulator / device instrumented suite covering startup, navigation,
 * profile badges, Mod Center theme controls, and settings entry.
 */
@LargeTest
@RunWith(AndroidJUnit4::class)
class VibeModInstrumentedTest {

    @get:Rule
    val rule = createAndroidComposeRule<MainActivity>()

    @Test
    fun appStartsOnFeed() {
        rule.onNodeWithTag("nav_feed").assertExists()
        // Demo catalog or empty-state copy should be visible after seed
        rule.waitUntil(timeoutMillis = 15_000) {
            rule.onAllNodesWithText("DEMO", substring = true).fetchSemanticsNodes().isNotEmpty() ||
                rule.onAllNodesWithText("No videos yet").fetchSemanticsNodes().isNotEmpty() ||
                rule.onAllNodesWithText("Tap to play").fetchSemanticsNodes().isNotEmpty() ||
                rule.onAllNodesWithText("Feed").fetchSemanticsNodes().isNotEmpty()
        }
    }

    @Test
    fun bottomNavigationReachesAllTabs() {
        rule.onNodeWithTag("nav_discover").performClick()
        rule.onNodeWithText("Discover").assertIsDisplayed()

        rule.onNodeWithTag("nav_library").performClick()
        rule.onNodeWithText("Library").assertIsDisplayed()

        rule.onNodeWithTag("nav_mod").performClick()
        rule.onNodeWithText("Mod Center").assertIsDisplayed()

        rule.onNodeWithTag("nav_profile").performClick()
        rule.onNodeWithText("Profile").assertIsDisplayed()

        rule.onNodeWithTag("nav_feed").performClick()
    }

    @Test
    fun profileBadgeSelectorShowsDisclaimer() {
        rule.onNodeWithTag("nav_profile").performClick()
        rule.onNodeWithText("Gold").performClick()
        rule.onNodeWithText("Custom decoration only", substring = true).assertIsDisplayed()
        rule.onNodeWithText("Blue").performClick()
        rule.onNodeWithText("Purple").performClick()
        rule.onNodeWithText("Creator").performClick()
        rule.onNodeWithText("Developer").performClick()
    }

    @Test
    fun modCenterThemeAndAccentToggles() {
        rule.onNodeWithTag("nav_mod").performClick()
        rule.onNodeWithText("Mod Center").assertIsDisplayed()
        rule.onNodeWithText("Appearance").assertIsDisplayed()
        // Theme chips
        rule.onNodeWithText("LIGHT").performClick()
        rule.onNodeWithText("AMOLED").performClick()
        rule.onNodeWithText("DARK").performClick()
        // Playback section exists
        rule.onNodeWithText("Playback").assertIsDisplayed()
        rule.onNodeWithText("Auto-loop").assertExists()
        rule.onNodeWithText("Auto-play").assertExists()
        rule.onNodeWithText("Mute on launch").assertExists()
    }

    @Test
    fun settingsOpensFromModCenter() {
        rule.onNodeWithTag("nav_mod").performClick()
        rule.onNodeWithText("Settings").performClick()
        rule.onNodeWithText("Preferences backup").assertIsDisplayed()
        rule.onNodeWithText("Privacy").assertIsDisplayed()
        rule.onNodeWithText("About").assertIsDisplayed()
    }
}
