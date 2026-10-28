package com.example.vibemod

import com.example.vibemod.domain.model.BadgeStyle
import com.google.common.truth.Truth.assertThat
import org.junit.Test

class BadgeStyleTest {

    @Test
    fun noneIsNotDecoration() {
        assertThat(BadgeStyle.NONE.isDecoration).isFalse()
    }

    @Test
    fun styledBadgesAreDecoration() {
        listOf(
            BadgeStyle.BLUE,
            BadgeStyle.GOLD,
            BadgeStyle.PURPLE,
            BadgeStyle.CREATOR,
            BadgeStyle.DEVELOPER,
        ).forEach {
            assertThat(it.isDecoration).isTrue()
            assertThat(it.label).isNotEmpty()
        }
    }

    @Test
    fun accentColorsDistinct() {
        val colors = BadgeStyle.entries.filter { it.isDecoration }.map { it.accentHex }.toSet()
        assertThat(colors.size).isEqualTo(5)
    }
}
