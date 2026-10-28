package com.example.vibemod.desktop

import com.example.vibemod.desktop.model.BadgeStyle
import com.example.vibemod.desktop.model.ModPreferences
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class BadgeAndPrefsTest {
    @Test
    fun noneIsNotDecoration() {
        assertFalse(BadgeStyle.NONE.isDecoration)
    }

    @Test
    fun goldIsDecoration() {
        assertTrue(BadgeStyle.GOLD.isDecoration)
        assertEquals("Gold", BadgeStyle.GOLD.label)
    }

    @Test
    fun defaultPrefsPrivacyFirst() {
        val p = ModPreferences()
        assertTrue(p.amoled)
        assertTrue(p.showDemo)
    }
}
