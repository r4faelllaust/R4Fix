package com.example.vibemod

import com.google.common.truth.Truth.assertThat
import org.junit.Test

class PinHashTest {

    private fun hashPin(pin: String): String {
        val digest = java.security.MessageDigest.getInstance("SHA-256")
        val bytes = digest.digest(pin.toByteArray(Charsets.UTF_8))
        return bytes.joinToString("") { "%02x".format(it) }
    }

    @Test
    fun hashIsDeterministic() {
        assertThat(hashPin("1234")).isEqualTo(hashPin("1234"))
    }

    @Test
    fun differentPinsDiffer() {
        assertThat(hashPin("1234")).isNotEqualTo(hashPin("4321"))
    }

    @Test
    fun hashLooksLikeSha256Hex() {
        assertThat(hashPin("9999")).matches("[0-9a-f]{64}")
    }
}
