import { ref, watch, type Ref } from 'vue'
import { Fireworks } from 'fireworks-js'

export function useFireworks(container: Ref<HTMLElement | null>) {
  const fireworks = ref<Fireworks | null>(null)

  watch(container, (newContainer) => {
    if (newContainer) {
      if (fireworks.value) {
        fireworks.value.stop()
      }
      const element = (newContainer as any).$el || newContainer
      fireworks.value = new Fireworks(element, {
        autoresize: true,
        opacity: 0.5,
        acceleration: 1.05,
        friction: 1,
        gravity: 1.5,
        particles: 50,
        traceSpeed: 10,
        explosion: 5,
        intensity: 30,
        flickering: 50,
        lineStyle: 'round',
        hue: {
          min: 0,
          max: 360,
        },
        delay: {
          min: 30,
          max: 60,
        },
        rocketsPoint: {
          min: 50,
          max: 50,
        },
        lineWidth: {
          explosion: {
            min: 1,
            max: 3,
          },
          trace: {
            min: 1,
            max: 2,
          },
        },
        brightness: {
          min: 50,
          max: 80,
        },
        decay: {
          min: 0.015,
          max: 0.03,
        },
        mouse: {
          click: false,
          move: false,
          max: 1,
        },
      })
    }
  })

  const start = () => {
    if (!fireworks.value) return
    fireworks.value.start()
    setTimeout(() => {
      fireworks.value?.stop()
    }, 5000)
  }

  return {
    start,
  }
}
