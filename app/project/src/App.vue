<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCharacterItems } from '@/composables/useCharacterItems'
import { useCanvas } from '@/composables/useCanvas'
import { useFireworks } from '@/composables/useFireworks'

const tab = ref('face')
const fileInput = ref<HTMLInputElement | null>(null)
const colorPickerMenu = ref(false)
const canvasBackgroundColor = ref('#f0f0f0')
const fireworksContainer = ref<HTMLElement | null>(null)

const { faceItems, handItems, headItems } = useCharacterItems()
const { activeItems, initializeCanvas, toggleItem, saveCanvasAsImage, handleFileUpload, removeBackgroundImage } =
  useCanvas(canvasBackgroundColor)
const { start: startFireworks } = useFireworks(fireworksContainer)

onMounted(() => {
  initializeCanvas('canvas')
})

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleSave = () => {
  saveCanvasAsImage()
  startFireworks()
}
</script>

<template>
  <v-app>
    <div ref="fireworksContainer" class="fireworks-container" />
    <v-main class="d-flex justify-center align-center">
      <v-container class="app-container">
        <h2 class="text-center my-4">투니 짤 만들어 쓰기🎨</h2>
        <v-card>
          <canvas id="canvas" />
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
            <v-btn class="ma-2" @click="handleSave">현재 모습 저장하기</v-btn>
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
.fireworks-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  pointer-events: none;
}
main.v-main .app-container {
  width: 100%;
  max-width: 600px;
}
</style>
