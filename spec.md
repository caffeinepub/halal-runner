# Specification

## Summary
**Goal:** Full visual overhaul of the Deen Runner 3D game — upgrading the environment, character models, obstacles/collectibles, lighting, and all UI screens to a richer, more immersive Islamic-themed aesthetic.

**Planned changes:**
- Overhaul the 3D game environment in GameScene.tsx with detailed Islamic architecture (multi-tiered minarets, domed mosques, pointed arched doorways, geometric latticework), colourful geometric tile floor patterns, a layered desert skybox (warm amber-to-teal gradient with crescent moon and stars), and bazaar market stall side scenery; all segments tile seamlessly for infinite scroll
- Upgrade the three player character 3D models (Ahmad with kufi, Fatima with hijab, Sheikh Omar with turban) with distinguishable stylised facial features, properly shaped culturally appropriate headwear, coloured clothing with fabric fold materials, and idle/run bobbing animation
- Enhance obstacle visuals with culturally themed shapes (stone archway barriers, Arabic-script crates, ornate pots); make coins glow gold with a spinning shimmer; give special collectibles (prayer beads, lanterns, Quran scrolls) distinct glowing auras; add golden particle burst on collection
- Improve scene lighting with a warm amber directional sun light, secondary deep-teal ambient fill, point lights near lanterns and collectibles, and shadow casting/receiving on the ground plane and key props
- Redesign all UI screens (MainMenu, CharacterSelect, GameOver, Leaderboard, GameHUD) with Islamic geometric SVG/CSS pattern backgrounds, Cinzel Decorative font headings, glowing gold/terracotta buttons with hover effects, frosted semi-transparent panels with geometric border accents, and consistent desert palette (sand gold, terracotta, deep teal, ivory)
- Use the new hero background image on the main menu and the geometric tile texture as a repeating panel background across UI screens

**User-visible outcome:** Players see a fully overhauled game with richly detailed Islamic architecture, expressive character models, glowing collectibles with particle effects, atmospheric desert lighting, and a polished immersive UI across all screens.
