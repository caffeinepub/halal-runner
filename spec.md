# Specification

## Summary
**Goal:** Build "Deen Runner," a 3D endless runner game (Subway Surfers style) with a halal Islamic theme, using React Three Fiber for all rendering and gameplay, with a Motoko backend for leaderboard persistence.

**Planned changes:**
- Implement 3D endless runner core loop: auto-forward movement on a three-lane track, lane switching (left/right arrows + swipe), jump (up arrow/swipe), slide (down arrow/swipe), collision detection triggering game over, and gradually increasing speed
- Build procedurally generated Islamic-themed 3D environment: mosque architecture (minarets, domes, arched doorways), Arabic geometric tile patterns on floors/walls, crescent/star decorations, and desert/bazaar scenery tiling seamlessly
- Add coin (gold dinars with crescent motif) and collectible (lanterns, prayer beads) mechanics with a HUD showing real-time coin count and distance score
- Implement three Islamic-themed power-ups: Barakah Shield (temporary invincibility), Buraq Boost (speed burst with visual trail), and Coin Magnet (auto-collects nearby coins), each with a HUD timer bar
- Create a character selection screen with at least three Muslim-themed 3D characters (boy in kufi, girl in hijab, scholar with turban); selection persists for the session
- Design main menu screen (logo, Play, Character Select, Leaderboard buttons) and game-over screen (final score, coins, personal best, Retry/Return to Menu)
- Apply cohesive warm desert color palette (sand gold, terracotta, deep teal, ivory) with Arabic calligraphy-inspired typography and Islamic geometric pattern motifs across all UI screens
- Implement Motoko backend for persistent top-10 leaderboard: store nickname, score, and coin count per run; post-game "Submit Score" flow; leaderboard screen accessible from main menu

**User-visible outcome:** Players can select a Muslim-themed character, run an infinite 3D Islamic-themed track, collect coins and power-ups, avoid obstacles, and submit their score to a persistent leaderboard viewable from the main menu.
