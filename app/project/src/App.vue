<template>
  <v-app>
    <v-main class="d-flex justify-center align-center">
      <v-container style="width: 600px">
        <h2 class="text-center my-4">🌟투니 짤 만들어 쓰기🎨</h2>
        <v-card>
          <canvas id="canvas" height="400" width="568" />
        </v-card>

        <v-tabs v-model="tab" class="mt-4">
          <v-tab value="face">얼굴</v-tab>
          <v-tab value="hands">손</v-tab>
          <v-tab value="head">머리</v-tab>
          <v-tab value="background">배경</v-tab>
          <v-tab value="save">저장</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="face">
            <v-btn
              v-for="item in faceItems"
              :key="item.file"
              class="ma-2"
              :variant="activeItems.has(item.file) ? 'tonal' : 'elevated'"
              @click="toggleItem(item, 'face')"
            >
              {{ item.name }}
            </v-btn>
          </v-window-item>
          <v-window-item value="hands">
            <v-btn
              v-for="item in handItems"
              :key="item.file"
              class="ma-2"
              :variant="activeItems.has(item.file) ? 'tonal' : 'elevated'"
              @click="toggleItem(item, 'hands')"
            >
              {{ item.name }}
            </v-btn>
          </v-window-item>
          <v-window-item value="head">
            <v-btn
              v-for="item in headItems"
              :key="item.file"
              class="ma-2"
              :variant="activeItems.has(item.file) ? 'tonal' : 'elevated'"
              @click="toggleItem(item, 'head')"
            >
              {{ item.name }}
            </v-btn>
          </v-window-item>
          <v-window-item value="background">
            <v-btn class="ma-2" @click="triggerFileUpload">배경 업로드</v-btn>
            <input ref="fileInput" style="display: none" type="file" @change="handleFileUpload" />
            <v-menu v-model="colorPickerMenu" :close-on-content-click="false">
              <template #activator="{ props }">
                <v-btn class="ma-2" v-bind="props"> 배경 색 선택하기 </v-btn>
              </template>
              <v-color-picker v-model="canvasBackgroundColor" />
            </v-menu>
            <v-btn class="ma-2" @click="removeBackgroundImage">배경 제거</v-btn>
          </v-window-item>
          <v-window-item value="save">
            <v-btn class="ma-2" @click="saveCanvasAsImage">현재 모습 저장하기</v-btn>
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import * as fabric from 'fabric'
import { onMounted, ref, watch } from 'vue'

interface Item {
  file: string
  name: string
}

const tab = ref('face')
const faceItems = ref<Item[]>([])
const handItems = ref<Item[]>([])
const headItems = ref<Item[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const colorPickerMenu = ref(false)
const canvasBackgroundColor = ref('#f0f0f0')
const activeItems = ref<Set<string>>(new Set())
let canvas: fabric.Canvas

onMounted(() => {
  canvas = new fabric.Canvas('canvas', {
    backgroundColor: canvasBackgroundColor.value,
    selection: false,
  })

  faceItems.value = [
    { file: 'Sunglasses_color.png', name: '컬러 선글라스' },
    { file: 'Sunglasses_black.png', name: '블랙 선글라스' },
    { file: 'Glasses_NoLenses.png', name: '안경테' },
    { file: 'Glasses_round.png', name: '동글이 안경' },
    { file: 'Glasses_Lenses.png', name: '안경' },
    { file: 'Eyepatch.png', name: '안대' },
  ]

  handItems.value = [
    { file: 'TennisRacket.png', name: '테니스 라켓' },
    { file: 'Hamburger.png', name: '햄버거' },
    { file: 'MacBook.png', name: '맥북' },
    { file: 'Coffee.png', name: '커피' },
    { file: 'BoxingGloves.png', name: '복싱 글러브' },
    { file: 'AppleWatch.png', name: '애플워치' },
    { file: 'BasketballBall.png', name: '농구공' },
  ]

  headItems.value = [
    { file: 'Headgear.png', name: '헤드기어' },
    { file: 'BaseballCap.png', name: '야구모자' },
    { file: 'Hardhat.png', name: '안전모' },
    { file: 'Bangs.png', name: '앞머리' },
    { file: 'AirpodMax.png', name: '에어팟 맥스' },
  ]

  fabric.FabricImage.fromURL('/src/assets/images/default.png').then((img) => {
    if (canvas.width && canvas.height) {
      img.scaleToWidth(canvas.width)
      img.scaleToHeight(canvas.height)
    }
    canvas.centerObject(img)
    canvas.add(img)
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
})

watch(canvasBackgroundColor, (newColor) => {
  if (canvas) {
    canvas.backgroundColor = newColor
    canvas.renderAll()
  }
})

const toggleItem = async (item: Item, category: string) => {
  if (activeItems.value.has(item.file)) {
    const objectToRemove = canvas.getObjects().find((obj) => obj.get('itemId') === item.file)
    if (objectToRemove) {
      canvas.remove(objectToRemove)
      canvas.renderAll()
    }
    activeItems.value.delete(item.file)
  } else {
    const imageUrl = `/src/assets/images/${category}/${item.file}`
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

    if (canvas.width && canvas.height) {
      img.scaleToWidth(canvas.width)
      img.scaleToHeight(canvas.height)
    }

    canvas.centerObject(img)
    canvas.add(img)
    canvas.renderAll()

    activeItems.value.add(item.file)
  }
}

const saveCanvasAsImage = () => {
  if (canvas) {
    const dataURL = canvas.toDataURL({
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

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const reader = new FileReader()
    reader.addEventListener('load', async (f) => {
      const data = f.target?.result as string
      const img = await fabric.FabricImage.fromURL(data)
      if (canvas.width && canvas.height && img.width && img.height) {
        img.scaleToWidth(canvas.width)
        img.scaleToHeight(canvas.height)
        canvas.backgroundImage = img
        canvas.requestRenderAll()
      }
    })
    reader.readAsDataURL(file)
  }
}

const removeBackgroundImage = () => {
  canvas.backgroundImage = undefined
  canvas.renderAll()
}
</script>

<style>
.v-application {
}
</style>
