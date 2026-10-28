package com.example.vibemod

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Instrumented smoke test — requires a device/emulator.
 * Verifies bottom navigation destinations are reachable.
 */
@RunWith(AndroidJUnit4::class)
class NavigationSmokeTest {

    @get:Rule
    val rule = createAndroidComposeRule<MainActivity>()

    @Test
    fun opensDiscoverFromBottomNav() {
        rule.onNodeWithText("Discover").performClick()
        rule.onNodeWithText("Discover").assertExists()
    }

    @Test
    fun opensModCenter() {
        rule.onNodeWithText("Mod").performClick()
        rule.onNodeWithText("Mod Center").assertExists()
    }
}
