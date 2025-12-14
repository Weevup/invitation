"use client"

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { Users, CheckCircle2, Clock } from 'lucide-react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Text3D, Center, RoundedBox, MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface Event {
  id: string
  name: string
  startsAt: string
  venueName?: string
}

interface CheckinStats {
  total: number
  checkedIn: number
  pending: number
  percentageCheckedIn: number
}

interface Guest {
  id: string
  firstName: string
  lastName: string
}

interface AnimatedGuest {
  id: string
  initials: string
  x: number
  z: number
  targetX: number
  targetZ: number
  speed: number
  color: string
  skinTone: string
  isWalking: boolean
  rotation: number
}

const GUEST_COLORS = [
  '#FF6B9D', '#C084FC', '#60A5FA', '#34D399', '#FBBF24',
  '#F87171', '#A78BFA', '#38BDF8', '#4ADE80', '#FB923C'
]

const SKIN_TONES = ['#FFDFC4', '#F0C8A0', '#D4A574', '#8D5524', '#5C3836']

// 3D Water component with animated shader
function Water() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.opacity = 0.85 + Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[8, 12]} />
      <meshStandardMaterial
        color="#40E0D0"
        transparent
        opacity={0.85}
        roughness={0.1}
        metalness={0.3}
      />
    </mesh>
  )
}

// Pool lane lines
function PoolLanes() {
  return (
    <group position={[0, 0.06, 0]}>
      {[-2.5, 0, 2.5].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.05, 11]} />
          <meshBasicMaterial color="#00BFFF" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// 3D Character component - cute low-poly style
function Character3D({ guest, position }: { guest: AnimatedGuest; position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null)
  const [bobOffset, setBobOffset] = useState(0)

  useFrame((state) => {
    if (groupRef.current) {
      // Smooth movement towards target
      const dx = guest.targetX - guest.x
      const dz = guest.targetZ - guest.z

      // Bob animation when walking
      if (guest.isWalking) {
        setBobOffset(Math.sin(state.clock.elapsedTime * 8) * 0.05)
      } else {
        setBobOffset(Math.sin(state.clock.elapsedTime * 2) * 0.02)
      }

      // Look direction
      if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
        groupRef.current.rotation.y = Math.atan2(dx, dz)
      }
    }
  })

  const bodyColor = new THREE.Color(guest.color)
  const skinColor = new THREE.Color(guest.skinTone)

  return (
    <group ref={groupRef} position={[position[0], position[1] + bobOffset, position[2]]}>
      {/* Shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.25, 16]} />
        <meshBasicMaterial color="black" transparent opacity={0.2} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.35, 0]}>
        <capsuleGeometry args={[0.18, 0.3, 8, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.15, 16, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.9} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.06, 0.77, 0.14]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
      <mesh position={[-0.06, 0.77, 0.14]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#333333" />
      </mesh>

      {/* Blush */}
      <mesh position={[0.12, 0.72, 0.12]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#FFB6C1" transparent opacity={0.5} />
      </mesh>
      <mesh position={[-0.12, 0.72, 0.12]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#FFB6C1" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

// Lounge chair
function LoungeChair({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* Base */}
      <RoundedBox args={[0.8, 0.15, 1.8]} radius={0.05} position={[0, 0.15, 0]}>
        <meshStandardMaterial color={color} roughness={0.7} />
      </RoundedBox>
      {/* Back rest */}
      <RoundedBox args={[0.7, 0.1, 0.6]} radius={0.03} position={[0, 0.35, -0.5]} rotation={[0.5, 0, 0]}>
        <meshStandardMaterial color={color} roughness={0.7} />
      </RoundedBox>
      {/* Legs */}
      {[[-0.3, 0, -0.7], [0.3, 0, -0.7], [-0.3, 0, 0.7], [0.3, 0, 0.7]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// Parasol / Umbrella
function Parasol({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
  })

  return (
    <group ref={ref} position={position}>
      {/* Pole */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
      {/* Canopy */}
      <mesh position={[0, 2.1, 0]}>
        <coneGeometry args={[1.2, 0.4, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Top */}
      <mesh position={[0, 2.35, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  )
}

// Palm tree / Plant
function Plant({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.02
    }
  })

  return (
    <group ref={ref} position={position}>
      {/* Pot */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.25, 0.2, 0.3, 8]} />
        <meshStandardMaterial color="#D2691E" roughness={0.9} />
      </mesh>
      {/* Leaves */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <mesh key={i} position={[0, 0.5, 0]} rotation={[0.3, THREE.MathUtils.degToRad(angle), 0]}>
          <coneGeometry args={[0.15, 0.6, 4]} />
          <meshStandardMaterial color="#228B22" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// Pool structure
function PoolStructure() {
  return (
    <group>
      {/* Pool border / deck */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#FFE4EC" roughness={0.8} />
      </mesh>

      {/* Pool walls */}
      <RoundedBox args={[9, 0.5, 13]} radius={0.1} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#E8E8E8" roughness={0.5} />
      </RoundedBox>

      {/* Inner pool (water container) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[8.2, 0.4, 12.2]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.3} />
      </mesh>
    </group>
  )
}

// Animated scene with characters
function PoolScene({ guests }: { guests: AnimatedGuest[] }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 10, -5]} intensity={0.4} color="#FFB6C1" />

      {/* Pool */}
      <PoolStructure />
      <Water />
      <PoolLanes />

      {/* Lounge chairs - Left side */}
      <LoungeChair position={[-6, 0, -3]} color="#FF69B4" />
      <LoungeChair position={[-6, 0, 0]} color="#FF69B4" />
      <LoungeChair position={[-6, 0, 3]} color="#FF69B4" />

      {/* Lounge chairs - Right side */}
      <LoungeChair position={[6, 0, -3]} color="#87CEEB" />
      <LoungeChair position={[6, 0, 0]} color="#87CEEB" />
      <LoungeChair position={[6, 0, 3]} color="#87CEEB" />

      {/* Parasols */}
      <Parasol position={[-6.5, 0, -4.5]} color="#FF6B9D" />
      <Parasol position={[-6.5, 0, 4.5]} color="#C084FC" />
      <Parasol position={[6.5, 0, -4.5]} color="#60A5FA" />
      <Parasol position={[6.5, 0, 4.5]} color="#34D399" />

      {/* Plants */}
      <Plant position={[-8, 0, -7]} />
      <Plant position={[8, 0, -7]} />
      <Plant position={[-8, 0, 7]} />
      <Plant position={[8, 0, 7]} />
      <Plant position={[0, 0, 8]} />
      <Plant position={[0, 0, -8]} />

      {/* Characters */}
      {guests.map((guest) => (
        <Float key={guest.id} speed={2} floatIntensity={0.1}>
          <Character3D
            guest={guest}
            position={[guest.x, 0, guest.z]}
          />
        </Float>
      ))}

      {/* Environment */}
      <Environment preset="sunset" />
    </>
  )
}

// Camera controller for smooth isometric view
function CameraController() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(15, 15, 15)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return (
    <OrbitControls
      enablePan={false}
      enableZoom={true}
      minDistance={10}
      maxDistance={30}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 3}
      autoRotate
      autoRotateSpeed={0.3}
    />
  )
}

export default function DisplayPage() {
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [stats, setStats] = useState<CheckinStats>({
    total: 0,
    checkedIn: 0,
    pending: 0,
    percentageCheckedIn: 0
  })
  const [guests, setGuests] = useState<Guest[]>([])
  const [animatedGuests, setAnimatedGuests] = useState<AnimatedGuest[]>([])
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isEventStarted, setIsEventStarted] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/checkin-guests`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data.event)
        setStats(data.stats)

        const checkedIn = data.guests
          .filter((g: { checkins?: unknown[] }) => g.checkins && g.checkins.length > 0)
          .map((g: { id: string; firstName: string; lastName: string }) => ({
            id: g.id,
            firstName: g.firstName,
            lastName: g.lastName,
          }))

        setGuests(checkedIn)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [eventId])

  // Initialize and animate guests
  useEffect(() => {
    const newAnimatedGuests: AnimatedGuest[] = guests.map((guest, index) => {
      const existing = animatedGuests.find(ag => ag.id === guest.id)
      if (existing) return existing

      // Random position around the pool area
      const angle = (index / Math.max(guests.length, 1)) * Math.PI * 2
      const radius = 4 + Math.random() * 3
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      return {
        id: guest.id,
        initials: `${guest.firstName.charAt(0)}${guest.lastName.charAt(0)}`,
        x,
        z,
        targetX: x,
        targetZ: z,
        speed: 0.02 + Math.random() * 0.02,
        color: GUEST_COLORS[index % GUEST_COLORS.length],
        skinTone: SKIN_TONES[index % SKIN_TONES.length],
        isWalking: false,
        rotation: Math.random() * Math.PI * 2
      }
    })

    setAnimatedGuests(newAnimatedGuests)
  }, [guests])

  // Animation loop for guest movement
  useEffect(() => {
    const moveGuests = () => {
      setAnimatedGuests(prev => prev.map(guest => {
        const dx = guest.targetX - guest.x
        const dz = guest.targetZ - guest.z
        const distance = Math.sqrt(dx * dx + dz * dz)

        if (distance < 0.1) {
          // Pick new random target around pool
          const angle = Math.random() * Math.PI * 2
          const radius = 3 + Math.random() * 4
          return {
            ...guest,
            targetX: Math.cos(angle) * radius,
            targetZ: Math.sin(angle) * radius,
            isWalking: false
          }
        }

        return {
          ...guest,
          x: guest.x + (dx / distance) * guest.speed,
          z: guest.z + (dz / distance) * guest.speed,
          isWalking: true,
          rotation: Math.atan2(dx, dz)
        }
      }))
    }

    const interval = setInterval(moveGuests, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  useEffect(() => {
    if (!event?.startsAt) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const eventTime = new Date(event.startsAt).getTime()
      const distance = eventTime - now

      if (distance < 0) {
        setIsEventStarted(true)
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setIsEventStarted(false)
      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [event?.startsAt])

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-black/30 backdrop-blur-md border-b border-white/10 p-4 z-20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-transparent">
              {event?.name || 'Chargement...'}
            </h1>
            <p className="text-gray-400 text-sm">Piscine Molitor • Live 3D</p>
          </div>

          {!isEventStarted && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] rounded-2xl px-5 py-2 shadow-lg">
              <Clock className="h-5 w-5 text-white" />
              <span className="text-white font-bold font-mono text-xl">
                {String(countdown.hours).padStart(2, '0')}:
                {String(countdown.minutes).padStart(2, '0')}:
                {String(countdown.seconds).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [15, 15, 15], fov: 35 }}>
          <Suspense fallback={null}>
            <PoolScene guests={animatedGuests} />
            <CameraController />
          </Suspense>
        </Canvas>

        {/* Stats panel */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-black/60 backdrop-blur-xl rounded-3xl px-8 py-5 shadow-2xl border border-white/20 flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-4xl font-bold text-white">{stats.checkedIn}</p>
                <p className="text-gray-400 text-sm font-medium">Arrivés</p>
              </div>
            </div>

            <div className="w-px h-16 bg-white/20" />

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-4xl font-bold text-white">{stats.total}</p>
                <p className="text-gray-400 text-sm font-medium">Attendus</p>
              </div>
            </div>

            <div className="w-px h-16 bg-white/20" />

            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-transparent">
                {stats.percentageCheckedIn}%
              </p>
              <p className="text-gray-400 text-sm font-medium">Présence</p>
            </div>
          </div>
        </div>

        {/* Live badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 shadow-lg z-10 border border-white/20">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white text-sm font-bold">EN DIRECT</span>
        </div>

        {/* Guest count bubble */}
        {animatedGuests.length > 0 && (
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2 shadow-lg z-10 border border-white/20">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {animatedGuests.slice(0, 4).map((g, i) => (
                  <div
                    key={g.id}
                    className="w-8 h-8 rounded-full border-2 border-black/50 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: g.color, zIndex: 4 - i }}
                  >
                    {g.initials}
                  </div>
                ))}
                {animatedGuests.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-black/50 flex items-center justify-center text-white text-xs font-bold">
                    +{animatedGuests.length - 4}
                  </div>
                )}
              </div>
              <span className="text-gray-300 text-sm">sur place</span>
            </div>
          </div>
        )}

        {/* Instruction hint */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/50 text-sm">
          Glissez pour pivoter la caméra • Pincez pour zoomer
        </div>
      </div>
    </div>
  )
}
