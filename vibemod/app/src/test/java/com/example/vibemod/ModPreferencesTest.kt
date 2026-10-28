package com.example.vibemod

import com.example.vibemod.domain.model.ModPreferences
import com.example.vibemod.domain.model.ThemeMode
import com.google.common.truth.Truth.assertThat
import org.junit.Test

class ModPreferencesTest {

    @Test
    fun clampsSpeed() {
        assertThat(ModPreferences(defaultPlaybackSpeed = 9f).clampedSpeed()).isEqualTo(2f)
        assertThat(ModPreferences(defaultPlaybackSpeed = 0.1f).clampedSpeed()).isEqualTo(0.5f)
    }

    @Test
    fun reducedMotionZeroesAnimation() {
        assertThat(
            ModPreferences(reducedMotion = true, animationScale = 1.2f).animationMultiplier(),
        ).isEqualTo(0f)
    }

    @Test
    fun amoledThemeForcesEffectiveAmoled() {
        assertThat(ModPreferences(themeMode = ThemeMode.AMOLED, amoledMode = false).effectiveAmoled())
            .isTrue()
    }
}
