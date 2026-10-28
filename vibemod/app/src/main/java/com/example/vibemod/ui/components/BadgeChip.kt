package com.example.vibemod.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.vibemod.Branding
import com.example.vibemod.domain.model.BadgeStyle

@Composable
fun BadgeChip(
    style: BadgeStyle,
    modifier: Modifier = Modifier,
    showDisclaimer: Boolean = false,
) {
    if (!style.isDecoration) return
    val color = Color(style.accentHex)
    Row(
        modifier = modifier
            .background(color.copy(alpha = 0.15f), RoundedCornerShape(50))
            .border(1.dp, color.copy(alpha = 0.6f), RoundedCornerShape(50))
            .padding(horizontal = 8.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Icon(
            imageVector = Icons.Filled.Verified,
            contentDescription = "Custom ${style.displayName} badge decoration",
            tint = color,
            modifier = Modifier.size(14.dp),
        )
        Text(
            text = style.label,
            style = MaterialTheme.typography.labelSmall,
            color = color,
        )
    }
    if (showDisclaimer) {
        Text(
            text = Branding.BADGE_DISCLAIMER,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 4.dp),
        )
    }
}

@Composable
fun BadgeDot(style: BadgeStyle, modifier: Modifier = Modifier) {
    if (!style.isDecoration) return
    Icon(
        imageVector = Icons.Filled.Verified,
        contentDescription = "Custom decoration badge",
        tint = Color(style.accentHex),
        modifier = modifier
            .size(16.dp)
            .background(Color.Black.copy(alpha = 0.35f), CircleShape),
    )
}
