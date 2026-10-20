/** NEXUS CLIENT — module catalog (UI showcase / single-player fantasy) */

export const CATEGORIES = [
  { id: 'combat', name: 'Combat', desc: 'Erase anyone who looks at you wrong.' },
  { id: 'movement', name: 'Movement', desc: 'Physics is a suggestion. Speed is law.' },
  { id: 'player', name: 'Player', desc: 'Godmode energy. Inventory is optional.' },
  { id: 'render', name: 'Render', desc: 'See through walls, lies, and hopium.' },
  { id: 'world', name: 'World', desc: 'Rewrite the map while others mine cobble.' },
  { id: 'misc', name: 'Misc', desc: 'Chaos utilities the admins fear.' },
  { id: 'exploit', name: 'Exploit', desc: 'Broken on purpose. Tastefully demonic.' },
  { id: 'hud', name: 'HUD', desc: 'Flex so hard the FPS counter apologizes.' },
];

const S = {
  slider: (key, label, min, max, step, value, unit = '') => ({
    type: 'slider', key, label, min, max, step, value, unit,
  }),
  toggle: (key, label, value = true) => ({ type: 'toggle', key, label, value }),
  select: (key, label, options, value) => ({ type: 'select', key, label, options, value }),
  mode: (key, label, options, value) => ({ type: 'select', key, label, options, value }),
};

export const MODULES = [
  // ── COMBAT ──────────────────────────────────────────
  {
    id: 'killaura', cat: 'combat', name: 'KillAura', bind: 'R',
    desc: 'Auto-aims and deletes every entity in range. Multi-target orbital mode included.',
    settings: [
      S.slider('range', 'Range', 3, 8, 0.1, 6.0, 'b'),
      S.slider('aps', 'APS', 8, 25, 1, 18),
      S.mode('mode', 'Mode', ['Single', 'Switch', 'Multi', 'Orbit'], 'Multi'),
      S.toggle('players', 'Players', true),
      S.toggle('mobs', 'Mobs', true),
      S.toggle('throughWalls', 'Through Walls', true),
      S.toggle('criticals', 'Force Crits', true),
    ],
  },
  {
    id: 'aimassist', cat: 'combat', name: 'AimAssist', bind: 'None',
    desc: 'Silky aim magnet that snaps onto heads like destiny.',
    settings: [
      S.slider('strength', 'Strength', 1, 100, 1, 72, '%'),
      S.slider('fov', 'FOV', 10, 180, 1, 90, '°'),
      S.toggle('playersOnly', 'Players Only', true),
    ],
  },
  {
    id: 'reach', cat: 'combat', name: 'Reach', bind: 'None',
    desc: 'Hit from another ZIP code. Refs will cry.',
    settings: [S.slider('distance', 'Distance', 3, 7, 0.05, 5.5, 'b')],
  },
  {
    id: 'velocity', cat: 'combat', name: 'Velocity', bind: 'None',
    desc: 'Knockback? Never heard of her. Stand still and farm.',
    settings: [
      S.slider('horizontal', 'Horizontal', 0, 100, 1, 0, '%'),
      S.slider('vertical', 'Vertical', 0, 100, 1, 0, '%'),
      S.mode('mode', 'Mode', ['Cancel', 'Reduce', 'Jump Reset'], 'Cancel'),
    ],
  },
  {
    id: 'criticals', cat: 'combat', name: 'Criticals', bind: 'None',
    desc: 'Every hit is a crit. Gravity works for you now.',
    settings: [S.mode('mode', 'Mode', ['Packet', 'Jump', 'MiniJump', 'More'], 'Packet')],
  },
  {
    id: 'autocrystal', cat: 'combat', name: 'AutoCrystal', bind: 'C',
    desc: 'Place + break crystals at machine speed. Endgame PvP annihilation.',
    settings: [
      S.slider('placeRange', 'Place Range', 3, 6, 0.1, 5.2, 'b'),
      S.slider('breakRange', 'Break Range', 3, 6, 0.1, 5.5, 'b'),
      S.slider('speed', 'Speed', 1, 20, 1, 16, 'tps'),
      S.toggle('predict', 'Predict', true),
      S.toggle('antiSuicide', 'Anti Suicide', true),
      S.toggle('facePlace', 'Face Place', true),
    ],
  },
  {
    id: 'anchoraura', cat: 'combat', name: 'AnchorAura', bind: 'None',
    desc: 'Respawn anchors go brrr. Netherite dreams crushed instantly.',
    settings: [
      S.slider('range', 'Range', 3, 6, 0.1, 5.0, 'b'),
      S.toggle('autoCharge', 'Auto Charge', true),
      S.toggle('autoBreak', 'Auto Break', true),
    ],
  },
  {
    id: 'autototem', cat: 'combat', name: 'AutoTotem', bind: 'None',
    desc: 'Totem teleports into offhand before death can load.',
    settings: [
      S.slider('health', 'Health Trigger', 1, 20, 0.5, 8, '❤'),
      S.toggle('hotbar', 'Hotbar Fallback', true),
    ],
  },
  {
    id: 'offhand', cat: 'combat', name: 'Offhand', bind: 'None',
    desc: 'Smart offhand: totem / crystal / gap / shield on demand.',
    settings: [S.mode('item', 'Preferred', ['Totem', 'Crystal', 'Gap', 'Shield', 'Auto'], 'Auto')],
  },
  {
    id: 'surround', cat: 'combat', name: 'Surround', bind: 'V',
    desc: 'Instant obsidian coffin. You become unkillable architecture.',
    settings: [
      S.toggle('center', 'Center', true),
      S.toggle('rotate', 'Rotate', false),
      S.slider('blocksPerTick', 'Blocks/Tick', 1, 8, 1, 4),
    ],
  },
  {
    id: 'autoweb', cat: 'combat', name: 'AutoWeb', bind: 'None',
    desc: 'Web their feet mid-combo. Sticky doom.',
    settings: [S.slider('range', 'Range', 3, 6, 0.1, 4.5, 'b')],
  },
  {
    id: 'bowaimbot', cat: 'combat', name: 'BowAimbot', bind: 'None',
    desc: 'Arrows with GPS. Predicts movement like a prophet.',
    settings: [
      S.slider('predict', 'Predict', 0, 3, 0.1, 1.4),
      S.toggle('silent', 'Silent Aim', true),
    ],
  },
  {
    id: 'triggerbot', cat: 'combat', name: 'TriggerBot', bind: 'None',
    desc: 'Clicks the instant crosshair kisses a hitbox.',
    settings: [S.slider('delay', 'Delay', 0, 100, 1, 12, 'ms')],
  },
  {
    id: 'wtap', cat: 'combat', name: 'W-Tap', bind: 'None',
    desc: 'Perfect sprint resets. Combo machine.',
    settings: [S.mode('mode', 'Mode', ['W-Tap', 'S-Tap', 'Sprint Reset'], 'W-Tap')],
  },
  {
    id: 'autopot', cat: 'combat', name: 'AutoPot', bind: 'None',
    desc: 'Splash pots yourself mid-fight without thinking.',
    settings: [
      S.slider('health', 'Health', 1, 20, 0.5, 12, '❤'),
      S.toggle('throw', 'Auto Throw', true),
    ],
  },
  {
    id: 'autofish', cat: 'combat', name: 'PvpFish', bind: 'None',
    desc: 'Yes, fishing rod PvP automation. Absolute menace energy.',
    settings: [S.toggle('pull', 'Auto Pull', true)],
  },

  // ── MOVEMENT ────────────────────────────────────────
  {
    id: 'fly', cat: 'movement', name: 'Fly', bind: 'G',
    desc: 'Creative flight in survival. Touch the skybox.',
    settings: [
      S.slider('speed', 'Speed', 0.5, 20, 0.1, 3.5),
      S.mode('mode', 'Mode', ['Vanilla', 'Creative', 'Glide', 'Packet', 'Jetpack'], 'Creative'),
    ],
  },
  {
    id: 'speed', cat: 'movement', name: 'Speed', bind: 'None',
    desc: 'Sonic.exe meets Minecraft. Leave particles of shame.',
    settings: [
      S.slider('multiplier', 'Multiplier', 1, 10, 0.1, 2.8, 'x'),
      S.mode('mode', 'Mode', ['Strafe', 'YPort', 'BHop', 'OnGround', 'NCP'], 'Strafe'),
    ],
  },
  {
    id: 'bhop', cat: 'movement', name: 'BunnyHop', bind: 'None',
    desc: 'CS-tier air control. Never touch grass again.',
    settings: [S.slider('boost', 'Boost', 1, 5, 0.05, 2.2, 'x')],
  },
  {
    id: 'longjump', cat: 'movement', name: 'LongJump', bind: 'None',
    desc: 'Jump across biomes. Olympics are canceled.',
    settings: [S.slider('boost', 'Boost', 1, 8, 0.1, 4.0)],
  },
  {
    id: 'jesus', cat: 'movement', name: 'Jesus', bind: 'None',
    desc: 'Walk on water and lava. Biblical flex.',
    settings: [S.mode('mode', 'Mode', ['Solid', 'Bounce', 'Dolphin'], 'Solid')],
  },
  {
    id: 'step', cat: 'movement', name: 'Step', bind: 'None',
    desc: 'Instant step-up. Stairs are for NPCs.',
    settings: [S.slider('height', 'Height', 1, 10, 0.5, 2.5, 'b')],
  },
  {
    id: 'scaffold', cat: 'movement', name: 'Scaffold', bind: 'None',
    desc: 'Bridge to the moon while looking at chat.',
    settings: [
      S.mode('mode', 'Mode', ['Normal', 'Telly', 'GodBridge', 'KeepY'], 'Telly'),
      S.toggle('tower', 'Tower', true),
      S.toggle('sprint', 'Sprint', true),
      S.slider('placeDelay', 'Place Delay', 0, 5, 1, 0, 't'),
    ],
  },
  {
    id: 'elytrafly', cat: 'movement', name: 'ElytraFly', bind: 'None',
    desc: 'Firework-free elytra cruise missiles.',
    settings: [
      S.slider('speed', 'Speed', 1, 15, 0.1, 6.5),
      S.mode('mode', 'Mode', ['Boost', 'Control', 'Packet', 'Firework'], 'Control'),
    ],
  },
  {
    id: 'nofall', cat: 'movement', name: 'NoFall', bind: 'None',
    desc: 'Fall from orbit. Land with 20 hearts and attitude.',
    settings: [S.mode('mode', 'Mode', ['Packet', 'Spoof', 'Bucket'], 'Packet')],
  },
  {
    id: 'phase', cat: 'movement', name: 'Phase', bind: 'None',
    desc: 'Clip through blocks like a ghost with unfinished business.',
    settings: [S.mode('mode', 'Mode', ['Clip', 'Packet', 'Skip'], 'Clip')],
  },
  {
    id: 'spider', cat: 'movement', name: 'Spider', bind: 'None',
    desc: 'Climb any wall. No vines required.',
    settings: [S.slider('speed', 'Climb Speed', 0.1, 2, 0.05, 0.4)],
  },
  {
    id: 'highjump', cat: 'movement', name: 'HighJump', bind: 'None',
    desc: 'Launch vertically into the stratosphere.',
    settings: [S.slider('height', 'Height', 1, 20, 0.5, 6)],
  },
  {
    id: 'airjump', cat: 'movement', name: 'AirJump', bind: 'None',
    desc: 'Infinite mid-air jumps. Parkour gods weep.',
    settings: [S.slider('jumps', 'Max Jumps', 1, 50, 1, 99)],
  },
  {
    id: 'boatfly', cat: 'movement', name: 'BoatFly', bind: 'None',
    desc: 'Boats were never meant to fly. We disagree.',
    settings: [S.slider('speed', 'Speed', 1, 20, 0.5, 8)],
  },
  {
    id: 'entityfly', cat: 'movement', name: 'EntityFly', bind: 'None',
    desc: 'Ride anything into the sky. Pigs included.',
    settings: [S.slider('speed', 'Speed', 1, 10, 0.1, 3)],
  },
  {
    id: 'safewalk', cat: 'movement', name: 'SafeWalk', bind: 'None',
    desc: 'Edge control so clean you never yeet yourself.',
    settings: [S.toggle('scaffoldOnly', 'With Scaffold', false)],
  },

  // ── PLAYER ──────────────────────────────────────────
  {
    id: 'godmode', cat: 'player', name: 'GodMode', bind: 'None',
    desc: 'Damage? XP? Hunger? All optional DLC.',
    settings: [
      S.toggle('damage', 'Negate Damage', true),
      S.toggle('hunger', 'Lock Hunger', true),
      S.toggle('fire', 'Fire Immune', true),
    ],
  },
  {
    id: 'regen', cat: 'player', name: 'Regen', bind: 'None',
    desc: 'Heal faster than crystals can place.',
    settings: [S.slider('speed', 'Heal Speed', 1, 20, 1, 10)],
  },
  {
    id: 'nofood', cat: 'player', name: 'NoHunger', bind: 'None',
    desc: 'Saturation forever. Steak is decorative now.',
    settings: [],
  },
  {
    id: 'autogap', cat: 'player', name: 'AutoGap', bind: 'None',
    desc: 'Chugs enchanted golden apples on cooldown like a gamer Gatorade.',
    settings: [
      S.slider('health', 'Health', 1, 20, 0.5, 14, '❤'),
      S.toggle('crapple', 'Allow Crapples', true),
    ],
  },
  {
    id: 'fastuse', cat: 'player', name: 'FastUse', bind: 'None',
    desc: 'Eat, drink, bow-charge — all instantly.',
    settings: [S.slider('ticks', 'Use Ticks', 1, 32, 1, 2)],
  },
  {
    id: 'fastplace', cat: 'player', name: 'FastPlace', bind: 'None',
    desc: 'Place blocks at packet warp speed.',
    settings: [S.slider('delay', 'Delay', 0, 4, 1, 0, 't')],
  },
  {
    id: 'fastbreak', cat: 'player', name: 'FastBreak', bind: 'None',
    desc: 'Instant mine energy. Obsidian melts like butter.',
    settings: [S.slider('multiplier', 'Multiplier', 1, 50, 0.5, 12, 'x')],
  },
  {
    id: 'nuker', cat: 'player', name: 'Nuker', bind: 'None',
    desc: 'Delete a sphere of the world per tick. Creative grief simulator.',
    settings: [
      S.slider('range', 'Range', 1, 8, 0.5, 4.5, 'b'),
      S.mode('mode', 'Mode', ['All', 'Ores', 'Flatten'], 'All'),
    ],
  },
  {
    id: 'inventory', cat: 'player', name: 'InvCleaner', bind: 'None',
    desc: 'Auto-drop trash, keep only the god kit.',
    settings: [
      S.toggle('keepTotems', 'Keep Totems', true),
      S.toggle('keepGaps', 'Keep Gaps', true),
      S.toggle('keepPearls', 'Keep Pearls', true),
    ],
  },
  {
    id: 'autotool', cat: 'player', name: 'AutoTool', bind: 'None',
    desc: 'Switches to the correct tool before the block notices.',
    settings: [S.toggle('switchBack', 'Switch Back', true)],
  },
  {
    id: 'cheststealer', cat: 'player', name: 'ChestStealer', bind: 'None',
    desc: 'Vacuum entire chests in milliseconds.',
    settings: [
      S.slider('delay', 'Delay', 0, 100, 5, 10, 'ms'),
      S.toggle('close', 'Auto Close', true),
    ],
  },
  {
    id: 'noforce', cat: 'player', name: 'AntiKnock', bind: 'None',
    desc: 'Explosions push everyone else. You stand unbothered.',
    settings: [],
  },
  {
    id: 'middleclick', cat: 'player', name: 'MiddleClickPearl', bind: 'None',
    desc: 'Middle-click = pearl. Movement tech unlocked.',
    settings: [],
  },
  {
    id: 'antihunger', cat: 'player', name: 'AntiHunger', bind: 'None',
    desc: 'Sprint forever without losing a drumstick of hunger.',
    settings: [],
  },
  {
    id: 'derp', cat: 'player', name: 'Derp', bind: 'None',
    desc: 'Spin head like a broken animatronic. Psychological warfare.',
    settings: [S.mode('mode', 'Mode', ['Spin', 'Nod', 'Random'], 'Spin')],
  },

  // ── RENDER ──────────────────────────────────────────
  {
    id: 'esp', cat: 'render', name: 'ESP', bind: 'None',
    desc: 'Boxes, tracers, nametags — nobody hides.',
    settings: [
      S.toggle('players', 'Players', true),
      S.toggle('items', 'Items', true),
      S.toggle('crystals', 'Crystals', true),
      S.toggle('tracers', 'Tracers', true),
      S.toggle('nametags', 'Nametags', true),
    ],
  },
  {
    id: 'storageesp', cat: 'render', name: 'StorageESP', bind: 'None',
    desc: 'Chests, shulkers, ender chests glow through stone.',
    settings: [
      S.toggle('chests', 'Chests', true),
      S.toggle('shulkers', 'Shulkers', true),
      S.toggle('enders', 'Ender Chests', true),
    ],
  },
  {
    id: 'xray', cat: 'render', name: 'XRay', bind: 'X',
    desc: 'See every ore vein like the world is glass.',
    settings: [
      S.toggle('diamond', 'Diamond', true),
      S.toggle('ancient', 'Ancient Debris', true),
      S.toggle('emerald', 'Emerald', true),
      S.toggle('spawner', 'Spawners', true),
    ],
  },
  {
    id: 'fullbright', cat: 'render', name: 'FullBright', bind: 'None',
    desc: 'Gamma 1000. Darkness is banned.',
    settings: [S.slider('gamma', 'Gamma', 1, 1000, 1, 1000)],
  },
  {
    id: 'freecam', cat: 'render', name: 'FreeCam', bind: 'None',
    desc: 'Detach camera. Scout bases while your body AFKs.',
    settings: [S.slider('speed', 'Speed', 0.5, 10, 0.1, 2)],
  },
  {
    id: 'tracers', cat: 'render', name: 'Tracers', bind: 'None',
    desc: 'Laser lines from crosshair to every threat.',
    settings: [S.slider('width', 'Width', 0.5, 4, 0.1, 1.2)],
  },
  {
    id: 'chams', cat: 'render', name: 'Chams', bind: 'None',
    desc: 'Players render through walls in cursed neon.',
    settings: [S.mode('mode', 'Mode', ['Fill', 'Glow', 'Wire'], 'Glow')],
  },
  {
    id: 'nametags', cat: 'render', name: 'NameTags+', bind: 'None',
    desc: 'Health, armor, totems, ping — all floating over heads.',
    settings: [
      S.toggle('health', 'Health', true),
      S.toggle('totems', 'Totem Pops', true),
      S.toggle('ping', 'Ping', true),
    ],
  },
  {
    id: 'holeesp', cat: 'render', name: 'HoleESP', bind: 'None',
    desc: 'Highlights safe holes and death traps in crystal PvP.',
    settings: [
      S.toggle('safe', 'Safe Holes', true),
      S.toggle('unsafe', 'Unsafe Holes', true),
    ],
  },
  {
    id: 'blockesp', cat: 'render', name: 'BlockESP', bind: 'None',
    desc: 'Custom block highlighting. Portal frames never escape.',
    settings: [],
  },
  {
    id: 'viewmodel', cat: 'render', name: 'ViewModel', bind: 'None',
    desc: 'Hand & item transforms that look illegal in screenshots.',
    settings: [
      S.slider('scale', 'Scale', 0.1, 3, 0.05, 1),
      S.slider('x', 'Offset X', -2, 2, 0.05, 0),
      S.slider('y', 'Offset Y', -2, 2, 0.05, 0),
    ],
  },
  {
    id: 'norender', cat: 'render', name: 'NoRender', bind: 'None',
    desc: 'Disable fire, nausea, bosses bars, and visual pain.',
    settings: [
      S.toggle('fire', 'Fire Overlay', true),
      S.toggle('nausea', 'Nausea', true),
      S.toggle('boss', 'Boss Bar', false),
      S.toggle('scoreboard', 'Scoreboard', false),
    ],
  },
  {
    id: 'breadcrumbs', cat: 'render', name: 'Breadcrumbs', bind: 'None',
    desc: 'Leave a glowing path of where you walked. Never get lost.',
    settings: [S.slider('life', 'Life', 1, 60, 1, 20, 's')],
  },
  {
    id: 'logoutspots', cat: 'render', name: 'LogoutSpots', bind: 'None',
    desc: 'Marks where players logged. Ambush coordinates included.',
    settings: [],
  },
  {
    id: 'trajectories', cat: 'render', name: 'Trajectories', bind: 'None',
    desc: 'Predict pearl / bow / potion arcs before you throw.',
    settings: [],
  },

  // ── WORLD ───────────────────────────────────────────
  {
    id: 'timer', cat: 'world', name: 'Timer', bind: 'None',
    desc: 'Speed up or slow down the entire game clock.',
    settings: [S.slider('speed', 'Timer Speed', 0.1, 5, 0.05, 1.8, 'x')],
  },
  {
    id: 'nuker2', cat: 'world', name: 'WorldEater', bind: 'None',
    desc: 'Industrial-scale terrain deletion. Stripmine the dimension.',
    settings: [S.slider('radius', 'Radius', 1, 12, 1, 6, 'b')],
  },
  {
    id: 'liquidplace', cat: 'world', name: 'LiquidPlace', bind: 'None',
    desc: 'Place blocks on liquids like they are solid ground.',
    settings: [],
  },
  {
    id: 'noweather', cat: 'world', name: 'NoWeather', bind: 'None',
    desc: 'Rain and thunder muted. Pure PvP clarity.',
    settings: [],
  },
  {
    id: 'time', cat: 'world', name: 'CustomTime', bind: 'None',
    desc: 'Lock client time to noon forever.',
    settings: [S.slider('time', 'Time', 0, 24000, 100, 6000)],
  },
  {
    id: 'newchunks', cat: 'world', name: 'NewChunks', bind: 'None',
    desc: 'Highlights freshly generated chunks. Base hunting meta.',
    settings: [],
  },
  {
    id: 'stashfinder', cat: 'world', name: 'StashFinder', bind: 'None',
    desc: 'Alerts when dense storage clusters enter render distance.',
    settings: [S.slider('threshold', 'Chest Threshold', 5, 100, 1, 20)],
  },
  {
    id: 'autobuild', cat: 'world', name: 'AutoBuild', bind: 'None',
    desc: 'Stamp schematics into the world at inhuman pace.',
    settings: [S.mode('schematic', 'Schematic', ['Box', 'Pyramid', 'WitherCage', 'Custom'], 'Box')],
  },
  {
    id: 'lawns', cat: 'world', name: 'Lawnmower', bind: 'None',
    desc: 'Auto-break grass/flowers. Aesthetic tyranny.',
    settings: [],
  },
  {
    id: 'portalgod', cat: 'world', name: 'PortalGod', bind: 'None',
    desc: 'Faster portal entry + weird nether tricks.',
    settings: [S.toggle('instant', 'Instant Enter', true)],
  },

  // ── MISC ────────────────────────────────────────────
  {
    id: 'spammer', cat: 'misc', name: 'ChatSpammer', bind: 'None',
    desc: 'Custom chat macros on a timer. Psychological operations.',
    settings: [
      S.slider('delay', 'Delay', 1, 30, 1, 5, 's'),
      S.mode('mode', 'Mode', ['Random', 'Order', 'AntiSpam Bypass'], 'AntiSpam Bypass'),
    ],
  },
  {
    id: 'fakeplayer', cat: 'misc', name: 'FakePlayer', bind: 'None',
    desc: 'Spawn a local dummy to test your KillAura geometry.',
    settings: [],
  },
  {
    id: 'anticheat', cat: 'misc', name: 'AntiAntiCheat', bind: 'None',
    desc: 'Rotations & packet hygiene that look suspiciously vanilla.',
    settings: [
      S.toggle('strafeFix', 'Strafe Fix', true),
      S.toggle('groundSpoof', 'Ground Spoof', true),
      S.mode('rotations', 'Rotations', ['Silent', 'Smooth', 'Snap'], 'Smooth'),
    ],
  },
  {
    id: 'notifier', cat: 'misc', name: 'TotemPopNotifier', bind: 'None',
    desc: 'Screams in chat every time someone pops. Humiliation DLC.',
    settings: [S.toggle('self', 'Count Self', true)],
  },
  {
    id: 'autolog', cat: 'misc', name: 'AutoLog', bind: 'None',
    desc: 'Panic disconnect below a health threshold.',
    settings: [S.slider('health', 'Health', 1, 20, 0.5, 6, '❤')],
  },
  {
    id: 'autoreconnect', cat: 'misc', name: 'AutoReconnect', bind: 'None',
    desc: 'Rejoin instantly after kick/ban attempts fail to stick.',
    settings: [S.slider('delay', 'Delay', 0, 15, 0.5, 1.5, 's')],
  },
  {
    id: 'packetlogger', cat: 'misc', name: 'PacketLogger', bind: 'None',
    desc: 'Dev console for watching the wire like a hawk.',
    settings: [],
  },
  {
    id: 'coords', cat: 'misc', name: 'CoordSpoof', bind: 'None',
    desc: 'Fake F3 coords for stream-safe paranoia.',
    settings: [S.slider('offset', 'Offset', 100, 100000, 100, 10000)],
  },
  {
    id: 'deathwaypoint', cat: 'misc', name: 'DeathWaypoint', bind: 'None',
    desc: 'Never lose a death stash again.',
    settings: [],
  },
  {
    id: 'macros', cat: 'misc', name: 'MacroPad', bind: 'None',
    desc: 'Bind entire kits and hotbar swaps to one key.',
    settings: [],
  },

  // ── EXPLOIT ─────────────────────────────────────────
  {
    id: 'dupemanager', cat: 'exploit', name: 'DupeAssistant', bind: 'None',
    desc: 'UI helper for classic single-player / plugin dupe setups. Fantasy mode.',
    settings: [S.mode('method', 'Method', ['Chunk Ban Adjacent', 'Door', 'Llama', 'Manual'], 'Manual')],
  },
  {
    id: 'chunkban', cat: 'exploit', name: 'ChunkBan', bind: 'None',
    desc: 'Theoretical chunk overload toolkit. For private test worlds only.',
    settings: [S.slider('books', 'Book Count', 1, 100, 1, 20)],
  },
  {
    id: 'crasher', cat: 'exploit', name: 'ClientCrashTest', bind: 'None',
    desc: 'Self-crash test patterns so you can harden YOUR own client.',
    settings: [S.mode('type', 'Type', ['Particle', 'Entity', 'Window'], 'Particle')],
  },
  {
    id: 'packetfly', cat: 'exploit', name: 'PacketFly', bind: 'None',
    desc: 'The legendary clip-fly. Vertical crime.',
    settings: [
      S.slider('speed', 'Speed', 0.01, 1, 0.01, 0.1),
      S.mode('mode', 'Mode', ['Factor', 'Slow', 'Phase'], 'Factor'),
    ],
  },
  {
    id: 'disabler', cat: 'exploit', name: 'Disabler', bind: 'None',
    desc: 'AntiCheat confusion rituals. Packet alchemy.',
    settings: [S.mode('target', 'Target', ['NCP', 'Vulcan', 'Grim', 'Matrix', 'All'], 'Grim')],
  },
  {
    id: 'goditems', cat: 'exploit', name: 'IllegalItems', bind: 'None',
    desc: 'Creative-only illegal stacks & enchants menu for private servers.',
    settings: [
      S.toggle('32k', '32k Weapons', true),
      S.toggle('overstack', 'Overstacked', true),
      S.toggle('godarmor', 'God Armor', true),
    ],
  },
  {
    id: 'mountbypass', cat: 'exploit', name: 'MountBypass', bind: 'None',
    desc: 'Weird entity ride edge cases. Chaos on a saddle.',
    settings: [],
  },
  {
    id: 'nppu', cat: 'exploit', name: 'NoPush', bind: 'None',
    desc: 'Ignore entity/block push. Become a statue of violence.',
    settings: [
      S.toggle('players', 'Players', true),
      S.toggle('blocks', 'Blocks', true),
      S.toggle('water', 'Water', true),
    ],
  },
  {
    id: 'pingspoof', cat: 'exploit', name: 'PingSpoof', bind: 'None',
    desc: 'Fake your ping for mind games and bypass experiments.',
    settings: [S.slider('ping', 'Fake Ping', 0, 1000, 10, 420, 'ms')],
  },
  {
    id: 'console', cat: 'exploit', name: 'OpSelf', bind: 'None',
    desc: 'If you already have console on YOUR world — one-click creative god kit.',
    settings: [
      S.toggle('creative', 'Creative', true),
      S.toggle('op', 'Op', true),
      S.toggle('kit', 'Give God Kit', true),
    ],
  },

  // ── HUD ─────────────────────────────────────────────
  {
    id: 'arraylist', cat: 'hud', name: 'ArrayList', bind: 'None',
    desc: 'Classic enabled-module watermark flex on your screen.',
    settings: [
      S.mode('color', 'Color', ['Static', 'Wave', 'Astolfo', 'Rainbow'], 'Wave'),
      S.toggle('sidebar', 'Side Bar', true),
    ],
  },
  {
    id: 'watermark', cat: 'hud', name: 'Watermark', bind: 'None',
    desc: 'NEXUS Ω branding burned into every clip.',
    settings: [S.mode('style', 'Style', ['Minimal', 'Boxed', 'CSGO'], 'Boxed')],
  },
  {
    id: 'targethud', cat: 'hud', name: 'TargetHUD', bind: 'None',
    desc: 'Fancy target panel with health animation and pop count.',
    settings: [S.toggle('armor', 'Show Armor', true)],
  },
  {
    id: 'session', cat: 'hud', name: 'SessionInfo', bind: 'None',
    desc: 'Playtime, kills, pops, crystals/hour. Flex sheet.',
    settings: [],
  },
  {
    id: 'radar', cat: 'hud', name: 'Radar', bind: 'None',
    desc: 'Mini radar of entities around you.',
    settings: [S.slider('size', 'Size', 40, 200, 5, 100, 'px')],
  },
  {
    id: 'hotbarkeybinds', cat: 'hud', name: 'HotbarBinds', bind: 'None',
    desc: 'Show binds above hotbar slots. Pro layout.',
    settings: [],
  },
  {
    id: 'notifications', cat: 'hud', name: 'Notifications', bind: 'None',
    desc: 'Sleek enable/disable toasts when modules flip.',
    settings: [S.mode('style', 'Style', ['Toast', 'Chat', 'Both'], 'Toast')],
  },
  {
    id: 'crosshair', cat: 'hud', name: 'CustomCrosshair', bind: 'None',
    desc: 'Crosshair that looks like it has a kill count.',
    settings: [
      S.slider('size', 'Size', 2, 20, 1, 8),
      S.slider('gap', 'Gap', 0, 10, 1, 3),
    ],
  },
];

export const PROFILE_PRESETS = {
  RAGE: {
    enable: [
      'killaura', 'velocity', 'criticals', 'autocrystal', 'autototem', 'surround',
      'speed', 'scaffold', 'nofall', 'esp', 'xray', 'fullbright', 'arraylist',
      'watermark', 'targethud', 'notifications', 'anticheat',
    ],
  },
  LEGIT: {
    enable: [
      'aimassist', 'triggerbot', 'wtap', 'autototem', 'fullbright', 'esp',
      'nametags', 'arraylist', 'notifications', 'safewalk',
    ],
  },
  HVH: {
    enable: [
      'killaura', 'autocrystal', 'anchoraura', 'autototem', 'offhand', 'surround',
      'autoweb', 'speed', 'fly', 'phase', 'packetfly', 'esp', 'holeesp', 'chams',
      'targethud', 'arraylist', 'disabler', 'velocity', 'criticals', 'pingspoof',
    ],
  },
  GHOST: {
    enable: ['aimassist', 'reach', 'triggerbot', 'fullbright', 'notifications'],
  },
  GOD: {
    enable: 'ALL',
  },
};
