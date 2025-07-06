import { ref, watch, onUnmounted, type Ref } from 'vue'
import * as fabric from 'fabric'
import { type Item } from './useCharacterItems'

let canvasInstance: fabric.Canvas | null = null
let canvasContainer: HTMLElement | null = null

const scaleBaseImage = (obj: fabric.Object, canvas: fabric.Canvas) => {
  if (canvas.width && canvas.height) {
    obj.scaleToWidth(canvas.width)
    obj.scaleToHeight(canvas.height)
    canvas.centerObject(obj)
  }
}

const scaleItem = (obj: fabric.Object, canvas: fabric.Canvas) => {
  if (canvas.width && canvas.height) {
    obj.scaleToWidth(canvas.width)
    obj.scaleToHeight(canvas.height)
    canvas.centerObject(obj)
  }
}

const scaleBackgroundImage = (img: fabric.FabricImage, canvas: fabric.Canvas) => {
  if (canvas.width && canvas.height && img.width && img.height) {
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height)
    img.set({
      scaleX: scale,
      scaleY: scale,
      originX: 'center',
      originY: 'center',
      left: canvas.width / 2,
      top: canvas.height / 2,
    })
  }
}

export const useCanvas = (canvasBackgroundColor: Ref<string>) => {
  const activeItems = ref<Set<string>>(new Set())

  const resizeCanvas = () => {
    if (!canvasInstance || !canvasContainer) return

    const width = canvasContainer.clientWidth
    const height = width * (400 / 568)
    canvasInstance.setDimensions({ width, height })

    if (canvasInstance.backgroundImage instanceof fabric.FabricImage) {
      scaleBackgroundImage(canvasInstance.backgroundImage, canvasInstance)
    }

    canvasInstance.getObjects().forEach((obj) => {
      if (obj.get('itemId')) {
        scaleItem(obj, canvasInstance!)
      } else {
        scaleBaseImage(obj, canvasInstance!)
      }
    })

    canvasInstance.renderAll()
  }

  const initializeCanvas = (id: string) => {
    const canvasEl = document.getElementById(id)
    if (!canvasEl) return

    canvasContainer = canvasEl.parentElement

    canvasInstance = new fabric.Canvas(id, {
      backgroundColor: canvasBackgroundColor.value,
      selection: false,
    })

    fabric.FabricImage.fromURL('/images/default.png').then((img) => {
      img.set({
        selectable: false,
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
        hoverCursor: 'default',
        moveCursor: 'default',
      })
      scaleBaseImage(img, canvasInstance!)
      canvasInstance!.add(img)
    })
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
  }

  onUnmounted(() => {
    window.removeEventListener('resize', resizeCanvas)
  })

  watch(canvasBackgroundColor, (newColor) => {
    if (canvasInstance) {
      canvasInstance.backgroundColor = newColor
      canvasInstance.renderAll()
    }
  })

  const toggleItem = async (item: Item, category: string) => {
    if (!canvasInstance) return

    if (activeItems.value.has(item.file)) {
      const objectToRemove = canvasInstance.getObjects().find((obj) => obj.get('itemId') === item.file)
      if (objectToRemove) {
        canvasInstance.remove(objectToRemove)
        canvasInstance.renderAll()
      }
      activeItems.value.delete(item.file)
    } else {
      const imageUrl = `/images/${category}/${item.file}`
      const img = await fabric.FabricImage.fromURL(imageUrl)

      img.set({
        itemId: item.file,
        selectable: false,
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
        hoverCursor: 'default',
        moveCursor: 'default',
      })

      scaleItem(img, canvasInstance)
      canvasInstance.add(img)
      canvasInstance.renderAll()

      activeItems.value.add(item.file)
    }
  }

  const saveCanvasAsImage = () => {
    if (canvasInstance) {
      const dataURL = canvasInstance.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
      })
      const link = document.createElement('a')
      link.href = dataURL
      link.download = 'tooni.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleFileUpload = (e: Event) => {
    if (!canvasInstance) return
    const target = e.target as HTMLInputElement
    if (target.files && target.files[0]) {
      const file = target.files[0]
      const reader = new FileReader()
      reader.addEventListener('load', async (f) => {
        const data = f.target?.result as string
        const img = await fabric.FabricImage.fromURL(data)
        scaleBackgroundImage(img, canvasInstance!)
        canvasInstance!.backgroundImage = img
        canvasInstance!.requestRenderAll()
      })
      reader.readAsDataURL(file)
    }
  }

  const removeBackgroundImage = () => {
    if (canvasInstance) {
      canvasInstance.backgroundImage = undefined
      canvasInstance.renderAll()
    }
  }

  return {
    activeItems,
    initializeCanvas,
    toggleItem,
    saveCanvasAsImage,
    handleFileUpload,
    removeBackgroundImage,
  }
}
