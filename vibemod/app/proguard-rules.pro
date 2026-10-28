# VibeMod — keep Hilt / Room generated code
-keep class dagger.hilt.** { *; }
-keep class * extends androidx.room.RoomDatabase
-dontwarn com.google.devtools.ksp.**
