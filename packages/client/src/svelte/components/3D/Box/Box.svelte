<script lang="ts">
  import { onMount } from "svelte"
  import { T } from "@threlte/core"
  import { OrbitControls, Edges } from "@threlte/extras"
  import Rat from "@components/3D/World/Models/RatAnimatedMoving.svelte"
  import { Tween } from "svelte/motion"
  import { Object3D } from "three"

  const rotationY = new Tween(0, { duration: 400 })
  const movingSpeed = new Tween(1, { duration: 200 })

  const target = new Tween({ x: 0, z: 0 }, { duration: 3000 })

  const pickTarget = async () => {
    const [x, z] = [
      Math.floor(Math.random() * 10) - 5,
      Math.floor(Math.random() * 10) - 5,
    ]
    const [dx, dz] = [x - target.current.x, z - target.current.z]

    const distance = Math.sqrt(dx * dx + dz * dz)
    const targetAngle = Math.atan2(dx, dz)

    // Compute the shortest rotation direction
    let angleDiff = targetAngle - rotationY.current
    angleDiff = ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI

    const newRotationY = rotationY.current + angleDiff

    rotationY.set(newRotationY, { duration: Math.abs(angleDiff) * 200 })

    movingSpeed.set(1)

    await target.set({ x, z }, { duration: distance * 500 })

    movingSpeed.set(0.2)

    setTimeout(pickTarget, 300 + Math.random() * 1000)
  }

  onMount(pickTarget)
</script>

<Rat
  scale={2}
  moving={movingSpeed}
  rotation.y={rotationY.current - Math.PI / 2}
  position.y={0.001}
  position.z={target.current.z}
  position.x={target.current.x}
></Rat>

<!-- <T.Mesh castShadow position.y={2}>
  <T.BoxGeometry args={[1, 1, 1]} />
  <T.MeshStandardMaterial />
</T.Mesh> -->
<T.PerspectiveCamera
  oncreate={r => r.lookAt(0, 0, 0)}
  fov={80}
  makeDefault
  position={[6, 9, 6]}
>
  <OrbitControls />
  <T.SpotLight
    target={(() => {
      const t = new Object3D()
      t.position.set(0, 0, -1)
      return t
    })()}
    color={0xc0daa4}
    intensity={10}
    castShadow
    angle={Math.PI + Math.PI / 2}
    penumbra={4}
    decay={0.1}
    distance={20}
  /></T.PerspectiveCamera
>
<T.Mesh rotation.x={-Math.PI / 2} receiveShadow>
  <T.PlaneGeometry args={[22, 22, 10, 10]} />
  <T.MeshStandardMaterial color={0xeeeeee} side={2} />
</T.Mesh>

<!-- <T.DirectionalLight
  position={[0, 11, 0]}
  oncreate={ref => ref.lookAt(11, 0, 0)}
  castShadow
  intensity={10}
/> -->
<T.AmbientLight intensity={0.4} />
