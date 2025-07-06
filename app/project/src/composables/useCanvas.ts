import { ref, watch, type Ref } from 'vue'
import * as fabric from 'fabric'
import { type Item } from './useCharacterItems'

export function useCanvas(canvasBackgroundColor: Ref<string>) {
  const canvas = ref<fabric.Canvas | null>(null)
  const activeItems = ref<Set<string>>(new Set())

  const initializeCanvas = (id: string) => {
    const newCanvas = new fabric.Canvas(id, {
      backgroundColor: canvasBackgroundColor.value,
      selection: false,
    })

    fabric.FabricImage.fromURL('/images/default.png').then((img) => {
      if (newCanvas.width && newCanvas.height) {
        img.scaleToWidth(newCanvas.width)
        img.scaleToHeight(newCanvas.height)
      }
      newCanvas.centerObject(img)
      newCanvas.add(img)
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
    })

    canvas.value = newCanvas
  }

  watch(canvasBackgroundColor, (newColor) => {
    if (canvas.value) {
      canvas.value.backgroundColor = newColor
      canvas.value.renderAll()
    }
  })

  const toggleItem = async (item: Item, category: string) => {
    if (!canvas.value) return

    if (activeItems.value.has(item.file)) {
      const objectToRemove = canvas.value.getObjects().find((obj) => obj.get('itemId') === item.file)
      if (objectToRemove) {
        canvas.value.remove(objectToRemove)
        canvas.value.renderAll()
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

      if (canvas.value.width && canvas.value.height) {
        img.scaleToWidth(canvas.value.width)
        img.scaleToHeight(canvas.value.height)
      }

      canvas.value.centerObject(img)
      canvas.value.add(img)
      canvas.value.renderAll()

      activeItems.value.add(item.file)
    }
  }

  const saveCanvasAsImage = () => {
    if (canvas.value) {
      const dataURL = canvas.value.toDataURL({
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
    if (!canvas.value) return
    const target = e.target as HTMLInputElement
    if (target.files && target.files[0]) {
      const file = target.files[0]
      const reader = new FileReader()
      reader.addEventListener('load', async (f) => {
        const data = f.target?.result as string
        const img = await fabric.FabricImage.fromURL(data)
        if (canvas.value?.width && canvas.value?.height && img.width && img.height) {
          img.scaleToWidth(canvas.value.width)
          img.scaleToHeight(canvas.value.height)
          canvas.value.backgroundImage = img
          canvas.value.requestRenderAll()
        }
      })
      reader.readAsDataURL(file)
    }
  }

  const removeBackgroundImage = () => {
    if (canvas.value) {
      canvas.value.backgroundImage = undefined
      canvas.value.renderAll()
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
