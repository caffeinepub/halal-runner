import React, { useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CHARACTERS } from './characters';

// ─── Types ───────────────────────────────────────────────────────────────────

interface GameSceneProps {
  speed: number;
  selectedCharacter: number;
  activePowerUp: string | null;
  shieldActive: boolean;
  onCoinCollect: () => void;
  onGameOver: (score: number) => void;
  onScoreUpdate: (delta: number) => void;
  onPowerUpCollect: (type: 'shield' | 'buraq' | 'magnet') => void;
  score: number;
  magnetActive: boolean;
}

interface GameObjectData {
  id: number;
  z: number;
  lane: number; // -1, 0, 1
  type: 'obstacle-high' | 'obstacle-low' | 'coin' | 'powerup-shield' | 'powerup-buraq' | 'powerup-magnet' | 'lantern' | 'beads';
  collected: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LANE_WIDTH = 2.2;
const LANES = [-LANE_WIDTH, 0, LANE_WIDTH];
const TRACK_LENGTH = 80;
const SEGMENT_LENGTH = 10;
const NUM_SEGMENTS = 9;
const PLAYER_Z = 0;
const SPAWN_Z = -TRACK_LENGTH;
const DESPAWN_Z = 12;
const JUMP_FORCE = 7;
const GRAVITY = -18;
const SLIDE_DURATION = 600;
const LANE_SWITCH_SPEED = 12;

// ─── Shared geometry/material refs (created once) ────────────────────────────

// ─── Inner Scene ─────────────────────────────────────────────────────────────

interface InnerSceneProps extends GameSceneProps {
  isRunning: boolean;
}

function InnerScene({
  speed,
  selectedCharacter,
  activePowerUp,
  shieldActive,
  onCoinCollect,
  onGameOver,
  onScoreUpdate,
  onPowerUpCollect,
  score,
  magnetActive,
  isRunning,
}: InnerSceneProps) {
  const { camera } = useThree();

  // Player state refs (for animation loop)
  const playerRef = useRef<THREE.Group>(null);
  const playerLane = useRef(1); // 0=left, 1=center, 2=right
  const targetLaneX = useRef(0);
  const currentLaneX = useRef(0);
  const isJumping = useRef(false);
  const isSliding = useRef(false);
  const jumpVelocity = useRef(0);
  const playerY = useRef(0);
  const slideTimer = useRef(0);
  const gameOverFired = useRef(false);
  const scoreRef = useRef(score);
  const speedRef = useRef(speed);
  const isRunningRef = useRef(isRunning);
  const shieldRef = useRef(shieldActive);
  const magnetRef = useRef(magnetActive);
  const activePowerUpRef = useRef(activePowerUp);

  // Keep refs in sync
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { shieldRef.current = shieldActive; }, [shieldActive]);
  useEffect(() => { magnetRef.current = magnetActive; }, [magnetActive]);
  useEffect(() => { activePowerUpRef.current = activePowerUp; }, [activePowerUp]);

  // Track segments
  const segmentsRef = useRef<THREE.Group[]>([]);
  const segmentGroupRef = useRef<THREE.Group>(null);

  // Game objects
  const gameObjectsRef = useRef<GameObjectData[]>([]);
  const objectMeshesRef = useRef<Map<number, THREE.Mesh | THREE.Group>>(new Map());
  const objectGroupRef = useRef<THREE.Group>(null);
  const nextObjId = useRef(0);
  const spawnTimer = useRef(0);

  // Input
  const keysRef = useRef<Set<string>>(new Set());
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastInputRef = useRef<string | null>(null);

  const char = CHARACTERS[selectedCharacter] || CHARACTERS[0];

  // ── Input handlers ──────────────────────────────────────────────────────────

  const handleLeft = useCallback(() => {
    if (!isRunningRef.current) return;
    if (playerLane.current > 0) {
      playerLane.current--;
      targetLaneX.current = LANES[playerLane.current];
    }
  }, []);

  const handleRight = useCallback(() => {
    if (!isRunningRef.current) return;
    if (playerLane.current < 2) {
      playerLane.current++;
      targetLaneX.current = LANES[playerLane.current];
    }
  }, []);

  const handleJump = useCallback(() => {
    if (!isRunningRef.current) return;
    if (!isJumping.current && !isSliding.current) {
      isJumping.current = true;
      jumpVelocity.current = JUMP_FORCE;
    }
  }, []);

  const handleSlide = useCallback(() => {
    if (!isRunningRef.current) return;
    if (!isJumping.current && !isSliding.current) {
      isSliding.current = true;
      slideTimer.current = SLIDE_DURATION;
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (keysRef.current.has(e.code)) return;
      keysRef.current.add(e.code);
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') handleLeft();
      if (e.code === 'ArrowRight' || e.code === 'KeyD') handleRight();
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') handleJump();
      if (e.code === 'ArrowDown' || e.code === 'KeyS') handleSlide();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY };
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartRef.current.x;
      const dy = t.clientY - touchStartRef.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (Math.max(absDx, absDy) < 20) return;
      if (absDx > absDy) {
        if (dx < 0) handleLeft(); else handleRight();
      } else {
        if (dy < 0) handleJump(); else handleSlide();
      }
      touchStartRef.current = null;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleLeft, handleRight, handleJump, handleSlide]);

  // ── Spawn game objects ──────────────────────────────────────────────────────

  const spawnObjects = useCallback((z: number) => {
    const types: GameObjectData['type'][] = [
      'coin', 'coin', 'coin', 'coin',
      'obstacle-high', 'obstacle-high', 'obstacle-low',
      'lantern', 'beads',
      'powerup-shield', 'powerup-buraq', 'powerup-magnet',
    ];
    const numObjs = 1 + Math.floor(Math.random() * 3);
    const usedLanes = new Set<number>();
    for (let i = 0; i < numObjs; i++) {
      let lane = Math.floor(Math.random() * 3);
      if (usedLanes.has(lane)) {
        lane = (lane + 1) % 3;
      }
      usedLanes.add(lane);
      const type = types[Math.floor(Math.random() * types.length)];
      gameObjectsRef.current.push({
        id: nextObjId.current++,
        z: z - i * 3,
        lane,
        type,
        collected: false,
      });
    }
  }, []);

  // ── Create mesh for object ──────────────────────────────────────────────────

  const createObjectMesh = useCallback((obj: GameObjectData): THREE.Mesh | THREE.Group => {
    switch (obj.type) {
      case 'obstacle-high': {
        const group = new THREE.Group();
        // Pillar obstacle
        const geo = new THREE.BoxGeometry(1.2, 2.2, 1.2);
        const mat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 1.1;
        // Arch top
        const archGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 8);
        const archMat = new THREE.MeshLambertMaterial({ color: 0xC9A84C });
        const arch = new THREE.Mesh(archGeo, archMat);
        arch.position.y = 2.35;
        group.add(mesh, arch);
        return group;
      }
      case 'obstacle-low': {
        const group = new THREE.Group();
        const geo = new THREE.BoxGeometry(1.8, 0.7, 1.0);
        const mat = new THREE.MeshLambertMaterial({ color: 0x6B3A2A });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 0.35;
        group.add(mesh);
        return group;
      }
      case 'coin': {
        const geo = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 16);
        const mat = new THREE.MeshLambertMaterial({ color: 0xFFD700, emissive: 0xAA8800, emissiveIntensity: 0.3 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = Math.PI / 2;
        mesh.position.y = 0.8;
        return mesh;
      }
      case 'lantern': {
        const group = new THREE.Group();
        const bodyGeo = new THREE.OctahedronGeometry(0.3);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xFF8C00, emissive: 0xFF4400, emissiveIntensity: 0.5 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.9;
        const topGeo = new THREE.ConeGeometry(0.2, 0.3, 8);
        const topMat = new THREE.MeshLambertMaterial({ color: 0xC9A84C });
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.y = 1.25;
        group.add(body, top);
        return group;
      }
      case 'beads': {
        const group = new THREE.Group();
        for (let i = 0; i < 5; i++) {
          const geo = new THREE.SphereGeometry(0.12, 8, 8);
          const mat = new THREE.MeshLambertMaterial({ color: 0x228B22, emissive: 0x114411, emissiveIntensity: 0.2 });
          const bead = new THREE.Mesh(geo, mat);
          const angle = (i / 5) * Math.PI * 2;
          bead.position.set(Math.cos(angle) * 0.3, 0.8 + Math.sin(angle) * 0.15, 0);
          group.add(bead);
        }
        return group;
      }
      case 'powerup-shield': {
        const group = new THREE.Group();
        const geo = new THREE.OctahedronGeometry(0.4);
        const mat = new THREE.MeshLambertMaterial({ color: 0xFFD700, emissive: 0xFFAA00, emissiveIntensity: 0.6 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 1.0;
        const ringGeo = new THREE.TorusGeometry(0.5, 0.06, 8, 24);
        const ringMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveIntensity: 0.4 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = 1.0;
        group.add(mesh, ring);
        return group;
      }
      case 'powerup-buraq': {
        const group = new THREE.Group();
        const geo = new THREE.ConeGeometry(0.35, 0.7, 6);
        const mat = new THREE.MeshLambertMaterial({ color: 0x00FFFF, emissive: 0x008888, emissiveIntensity: 0.6 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 1.0;
        mesh.rotation.z = Math.PI;
        const wingGeo = new THREE.PlaneGeometry(0.8, 0.4);
        const wingMat = new THREE.MeshLambertMaterial({ color: 0x88FFFF, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const wingL = new THREE.Mesh(wingGeo, wingMat);
        wingL.position.set(-0.5, 1.0, 0);
        wingL.rotation.z = 0.4;
        const wingR = new THREE.Mesh(wingGeo, wingMat);
        wingR.position.set(0.5, 1.0, 0);
        wingR.rotation.z = -0.4;
        group.add(mesh, wingL, wingR);
        return group;
      }
      case 'powerup-magnet': {
        const group = new THREE.Group();
        const geo = new THREE.TorusGeometry(0.35, 0.12, 8, 16, Math.PI);
        const mat = new THREE.MeshLambertMaterial({ color: 0xFF4444, emissive: 0xAA0000, emissiveIntensity: 0.4 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 1.0;
        mesh.rotation.x = Math.PI / 2;
        group.add(mesh);
        return group;
      }
      default: {
        const geo = new THREE.SphereGeometry(0.3);
        const mat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        return new THREE.Mesh(geo, mat);
      }
    }
  }, []);

  // ── Initialize scene ────────────────────────────────────────────────────────

  useEffect(() => {
    // Reset game state
    playerLane.current = 1;
    targetLaneX.current = 0;
    currentLaneX.current = 0;
    isJumping.current = false;
    isSliding.current = false;
    jumpVelocity.current = 0;
    playerY.current = 0;
    gameOverFired.current = false;
    gameObjectsRef.current = [];
    nextObjId.current = 0;
    spawnTimer.current = 0;

    // Clear object meshes
    if (objectGroupRef.current) {
      while (objectGroupRef.current.children.length > 0) {
        objectGroupRef.current.remove(objectGroupRef.current.children[0]);
      }
    }
    objectMeshesRef.current.clear();

    // Spawn initial objects
    for (let i = 1; i <= 8; i++) {
      spawnObjects(-i * 10);
    }
  }, [spawnObjects]);

  // ── Main game loop ──────────────────────────────────────────────────────────

  useFrame((_, delta) => {
    if (!isRunningRef.current || gameOverFired.current) return;

    const dt = Math.min(delta, 0.05);
    const spd = speedRef.current;

    // ── Player horizontal movement ──
    const lerpSpeed = LANE_SWITCH_SPEED * dt;
    currentLaneX.current += (targetLaneX.current - currentLaneX.current) * Math.min(lerpSpeed, 1);

    // ── Player jump/slide ──
    if (isJumping.current) {
      jumpVelocity.current += GRAVITY * dt;
      playerY.current += jumpVelocity.current * dt;
      if (playerY.current <= 0) {
        playerY.current = 0;
        isJumping.current = false;
        jumpVelocity.current = 0;
      }
    }

    if (isSliding.current) {
      slideTimer.current -= dt * 1000;
      if (slideTimer.current <= 0) {
        isSliding.current = false;
        slideTimer.current = 0;
      }
    }

    // ── Update player mesh ──
    if (playerRef.current) {
      playerRef.current.position.x = currentLaneX.current;
      playerRef.current.position.y = playerY.current;
      const scaleY = isSliding.current ? 0.5 : 1;
      playerRef.current.scale.y = THREE.MathUtils.lerp(playerRef.current.scale.y, scaleY, 0.3);
      // Running bob
      const time = performance.now() * 0.005;
      playerRef.current.rotation.z = Math.sin(time * 2) * 0.05;
    }

    // ── Scroll track segments ──
    if (segmentGroupRef.current) {
      segmentGroupRef.current.position.z += spd * dt;
      if (segmentGroupRef.current.position.z > SEGMENT_LENGTH) {
        segmentGroupRef.current.position.z -= SEGMENT_LENGTH * NUM_SEGMENTS;
      }
    }

    // ── Spawn new objects ──
    spawnTimer.current += spd * dt;
    if (spawnTimer.current > 12) {
      spawnTimer.current = 0;
      spawnObjects(SPAWN_Z);
    }

    // ── Update game objects ──
    const toRemove: number[] = [];
    const playerX = currentLaneX.current;
    const playerYPos = playerY.current;
    const playerH = isSliding.current ? 0.5 : 1.8;

    for (const obj of gameObjectsRef.current) {
      obj.z += spd * dt;

      const mesh = objectMeshesRef.current.get(obj.id);
      if (mesh) {
        mesh.position.z = obj.z;
        // Animate collectibles
        if (obj.type === 'coin' || obj.type === 'lantern' || obj.type === 'beads') {
          mesh.rotation.y += dt * 2;
        }
        if (obj.type.startsWith('powerup')) {
          mesh.rotation.y += dt * 3;
          const t = performance.now() * 0.003;
          mesh.position.y = Math.sin(t + obj.id) * 0.15;
        }
      }

      // Despawn behind player
      if (obj.z > DESPAWN_Z) {
        toRemove.push(obj.id);
        continue;
      }

      // Collision detection
      if (!obj.collected && obj.z > -1.5 && obj.z < 1.5) {
        const objX = LANES[obj.lane];
        const dx = Math.abs(playerX - objX);

        // Magnet auto-collect coins
        if (magnetRef.current && (obj.type === 'coin' || obj.type === 'lantern' || obj.type === 'beads')) {
          if (dx < 3.0) {
            obj.collected = true;
            onCoinCollect();
            toRemove.push(obj.id);
            continue;
          }
        }

        if (dx < 0.9) {
          if (obj.type === 'coin') {
            obj.collected = true;
            onCoinCollect();
            toRemove.push(obj.id);
          } else if (obj.type === 'lantern' || obj.type === 'beads') {
            obj.collected = true;
            onCoinCollect();
            toRemove.push(obj.id);
          } else if (obj.type === 'powerup-shield') {
            obj.collected = true;
            onPowerUpCollect('shield');
            toRemove.push(obj.id);
          } else if (obj.type === 'powerup-buraq') {
            obj.collected = true;
            onPowerUpCollect('buraq');
            toRemove.push(obj.id);
          } else if (obj.type === 'powerup-magnet') {
            obj.collected = true;
            onPowerUpCollect('magnet');
            toRemove.push(obj.id);
          } else if (obj.type === 'obstacle-high') {
            // High obstacle: can jump over (player Y > 1.2) or slide under (no, too tall)
            const canJumpOver = playerYPos > 1.2;
            if (!canJumpOver) {
              if (shieldRef.current) {
                // Shield absorbs hit
              } else if (!gameOverFired.current) {
                gameOverFired.current = true;
                onGameOver(scoreRef.current);
              }
            }
          } else if (obj.type === 'obstacle-low') {
            // Low obstacle: can slide under
            const canSlideUnder = isSliding.current;
            if (!canSlideUnder) {
              if (shieldRef.current) {
                // Shield absorbs
              } else if (!gameOverFired.current) {
                gameOverFired.current = true;
                onGameOver(scoreRef.current);
              }
            }
          }
        }
      }
    }

    // Remove collected/despawned objects
    for (const id of toRemove) {
      const mesh = objectMeshesRef.current.get(id);
      if (mesh && objectGroupRef.current) {
        objectGroupRef.current.remove(mesh);
      }
      objectMeshesRef.current.delete(id);
      const idx = gameObjectsRef.current.findIndex(o => o.id === id);
      if (idx !== -1) gameObjectsRef.current.splice(idx, 1);
    }

    // Add new object meshes
    for (const obj of gameObjectsRef.current) {
      if (!objectMeshesRef.current.has(obj.id) && objectGroupRef.current) {
        const mesh = createObjectMesh(obj);
        mesh.position.set(LANES[obj.lane], 0, obj.z);
        objectGroupRef.current.add(mesh);
        objectMeshesRef.current.set(obj.id, mesh);
      }
    }

    // ── Score ──
    onScoreUpdate(spd * dt * 0.5);

    // ── Camera follow ──
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 1, -5);
  });

  // ── Render ──────────────────────────────────────────────────────────────────

  const charDef = CHARACTERS[selectedCharacter] || CHARACTERS[0];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} color={0xFFE8C0} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        color={0xFFD080}
        castShadow
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color={0x8080FF} />

      {/* Sky */}
      <mesh position={[0, 0, -50]}>
        <planeGeometry args={[200, 80]} />
        <meshBasicMaterial color={0x1A3A5C} />
      </mesh>

      {/* Stars */}
      {Array.from({ length: 60 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 80,
            10 + Math.random() * 20,
            -40 - Math.random() * 20,
          ]}
        >
          <sphereGeometry args={[0.05 + Math.random() * 0.08, 4, 4]} />
          <meshBasicMaterial color={0xFFFFDD} />
        </mesh>
      ))}

      {/* Moon */}
      <mesh position={[15, 18, -45]}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color={0xFFF8DC} />
      </mesh>
      {/* Moon crescent shadow */}
      <mesh position={[16.2, 18.2, -44.8]}>
        <sphereGeometry args={[1.7, 16, 16]} />
        <meshBasicMaterial color={0x1A3A5C} />
      </mesh>

      {/* Background minarets */}
      {[-20, -8, 8, 20].map((x, i) => (
        <group key={i} position={[x, 0, -35]}>
          {/* Minaret body */}
          <mesh position={[0, 5, 0]}>
            <cylinderGeometry args={[0.5, 0.7, 10, 8]} />
            <meshLambertMaterial color={0xD4A96A} />
          </mesh>
          {/* Minaret top */}
          <mesh position={[0, 10.5, 0]}>
            <coneGeometry args={[0.6, 2, 8]} />
            <meshLambertMaterial color={0x1A6B6B} />
          </mesh>
          {/* Crescent on top */}
          <mesh position={[0, 12, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.3, 0.06, 8, 16, Math.PI * 1.5]} />
            <meshLambertMaterial color={0xFFD700} />
          </mesh>
          {/* Dome */}
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[1.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshLambertMaterial color={0x1A6B6B} />
          </mesh>
        </group>
      ))}

      {/* Track segments */}
      <group ref={segmentGroupRef}>
        {Array.from({ length: NUM_SEGMENTS }).map((_, i) => (
          <TrackSegment key={i} z={-i * SEGMENT_LENGTH} />
        ))}
      </group>

      {/* Game objects group */}
      <group ref={objectGroupRef} />

      {/* Player */}
      <group ref={playerRef} position={[0, 0, PLAYER_Z]}>
        <PlayerMesh charDef={charDef} isSliding={isSliding} isJumping={isJumping} shieldActive={shieldActive} activePowerUp={activePowerUp} />
      </group>
    </>
  );
}

// ─── Track Segment ────────────────────────────────────────────────────────────

function TrackSegment({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      {/* Floor */}
      <mesh position={[0, -0.05, -SEGMENT_LENGTH / 2]} receiveShadow>
        <boxGeometry args={[LANE_WIDTH * 3 + 1, 0.1, SEGMENT_LENGTH]} />
        <meshLambertMaterial color={0xC4A265} />
      </mesh>
      {/* Lane dividers */}
      {[-LANE_WIDTH / 2, LANE_WIDTH / 2].map((x, i) => (
        <mesh key={i} position={[x, 0.01, -SEGMENT_LENGTH / 2]}>
          <boxGeometry args={[0.08, 0.02, SEGMENT_LENGTH]} />
          <meshLambertMaterial color={0xFFD700} />
        </mesh>
      ))}
      {/* Left wall */}
      <mesh position={[-LANE_WIDTH * 1.5 - 0.5, 1.5, -SEGMENT_LENGTH / 2]}>
        <boxGeometry args={[0.3, 3, SEGMENT_LENGTH]} />
        <meshLambertMaterial color={0xD4A96A} />
      </mesh>
      {/* Right wall */}
      <mesh position={[LANE_WIDTH * 1.5 + 0.5, 1.5, -SEGMENT_LENGTH / 2]}>
        <boxGeometry args={[0.3, 3, SEGMENT_LENGTH]} />
        <meshLambertMaterial color={0xD4A96A} />
      </mesh>
      {/* Arch decorations every segment */}
      <ArchDecoration x={-LANE_WIDTH * 1.5 - 0.5} z={-2} />
      <ArchDecoration x={LANE_WIDTH * 1.5 + 0.5} z={-2} />
      <ArchDecoration x={-LANE_WIDTH * 1.5 - 0.5} z={-7} />
      <ArchDecoration x={LANE_WIDTH * 1.5 + 0.5} z={-7} />
    </group>
  );
}

function ArchDecoration({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.5, 0]}>
        <torusGeometry args={[0.6, 0.12, 8, 16, Math.PI]} />
        <meshLambertMaterial color={0xC9A84C} />
      </mesh>
    </group>
  );
}

// ─── Player Mesh ──────────────────────────────────────────────────────────────

interface PlayerMeshProps {
  charDef: typeof CHARACTERS[0];
  isSliding: React.MutableRefObject<boolean>;
  isJumping: React.MutableRefObject<boolean>;
  shieldActive: boolean;
  activePowerUp: string | null;
}

function PlayerMesh({ charDef, shieldActive, activePowerUp }: PlayerMeshProps) {
  const skinColor = parseInt(charDef.skinColor.replace('#', ''), 16);
  const bodyColor = parseInt(charDef.bodyColor.replace('#', ''), 16);
  const clothColor = parseInt(charDef.clothColor.replace('#', ''), 16);
  const headwearColor = parseInt(charDef.headwearColor.replace('#', ''), 16);

  return (
    <group>
      {/* Shield effect */}
      {shieldActive && (
        <mesh>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshLambertMaterial color={0xFFD700} transparent opacity={0.25} />
        </mesh>
      )}
      {/* Buraq trail */}
      {activePowerUp === 'buraq' && (
        <mesh position={[0, 0.5, 0.8]}>
          <coneGeometry args={[0.4, 1.5, 8]} />
          <meshLambertMaterial color={0x00FFFF} transparent opacity={0.4} />
        </mesh>
      )}
      {/* Body (torso) */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.4]} />
        <meshLambertMaterial color={bodyColor} />
      </mesh>
      {/* Cloth/robe overlay */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.65, 1.2, 0.45]} />
        <meshLambertMaterial color={clothColor} transparent opacity={0.7} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.65, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.45]} />
        <meshLambertMaterial color={skinColor} />
      </mesh>
      {/* Headwear */}
      {charDef.headwearType === 'kufi' && (
        <mesh position={[0, 1.98, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.22, 12]} />
          <meshLambertMaterial color={headwearColor} />
        </mesh>
      )}
      {charDef.headwearType === 'hijab' && (
        <>
          <mesh position={[0, 1.85, 0]}>
            <sphereGeometry args={[0.32, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
            <meshLambertMaterial color={headwearColor} />
          </mesh>
          <mesh position={[0, 1.4, 0.1]}>
            <boxGeometry args={[0.7, 0.6, 0.1]} />
            <meshLambertMaterial color={headwearColor} />
          </mesh>
        </>
      )}
      {charDef.headwearType === 'turban' && (
        <mesh position={[0, 1.95, 0]}>
          <torusGeometry args={[0.22, 0.14, 8, 16]} />
          <meshLambertMaterial color={headwearColor} />
        </mesh>
      )}
      {/* Left arm */}
      <mesh position={[-0.42, 0.9, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshLambertMaterial color={skinColor} />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.42, 0.9, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshLambertMaterial color={skinColor} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.18, 0.2, 0]}>
        <boxGeometry args={[0.2, 0.5, 0.22]} />
        <meshLambertMaterial color={bodyColor} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.18, 0.2, 0]}>
        <boxGeometry args={[0.2, 0.5, 0.22]} />
        <meshLambertMaterial color={bodyColor} />
      </mesh>
    </group>
  );
}

// ─── Main GameScene export ────────────────────────────────────────────────────

export default function GameScene(props: GameSceneProps) {
  const isRunning = !props.score || true; // always running when mounted

  return (
    <div id="game-canvas-container">
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 60 }}
        gl={{ antialias: true }}
        style={{ background: '#0D1F35' }}
      >
        <InnerScene {...props} isRunning={true} />
      </Canvas>
    </div>
  );
}
