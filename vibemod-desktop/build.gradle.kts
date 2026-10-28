import org.jetbrains.compose.desktop.application.dsl.TargetFormat

plugins {
    kotlin("jvm") version "2.0.21"
    id("org.jetbrains.compose") version "1.7.1"
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21"
    id("org.openjfx.javafxplugin") version "0.1.0"
}

group = "com.example.vibemod"
version = "1.0.0"

kotlin {
    jvmToolchain(21)
}

javafx {
    version = "21.0.2"
    modules = listOf("javafx.controls", "javafx.media", "javafx.swing", "javafx.graphics")
}

dependencies {
    implementation(compose.desktop.currentOs)
    implementation(compose.material3)
    implementation(compose.materialIconsExtended)
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-swing:1.9.0")
    implementation("com.google.code.gson:gson:2.11.0")
    testImplementation(kotlin("test"))
}

compose.desktop {
    application {
        mainClass = "com.example.vibemod.desktop.MainKt"
        nativeDistributions {
            targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Deb, TargetFormat.Exe)
            packageName = "VibeMod"
            packageVersion = "1.0.0"
            description = "VibeMod — local-first short video player"
            copyright = "© 2026 VibeMod"
            vendor = "VibeMod"
            windows {
                menuGroup = "VibeMod"
                upgradeUuid = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
            }
        }
    }
}
