import { ref } from 'vue'

export type Item = {
  file: string
  name: string
}

export function useCharacterItems() {
  const faceItems = ref<Item[]>([
    { file: 'Sunglasses_color.png', name: '컬러 선글라스' },
    { file: 'Sunglasses_black.png', name: '블랙 선글라스' },
    { file: 'Glasses_NoLenses.png', name: '안경테' },
    { file: 'Glasses_round.png', name: '동글이 안경' },
    { file: 'Glasses_Lenses.png', name: '안경' },
    { file: 'Eyepatch.png', name: '안대' },
  ])

  const handItems = ref<Item[]>([
    { file: 'TennisRacket.png', name: '테니스 라켓' },
    { file: 'Hamburger.png', name: '햄버거' },
    { file: 'MacBook.png', name: '맥북' },
    { file: 'Coffee.png', name: '커피' },
    { file: 'BoxingGloves.png', name: '복싱 글러브' },
    { file: 'AppleWatch.png', name: '애플워치' },
    { file: 'BasketballBall.png', name: '농구공' },
  ])

  const headItems = ref<Item[]>([
    { file: 'Headgear.png', name: '헤드기어' },
    { file: 'BaseballCap.png', name: '야구모자' },
    { file: 'Hardhat.png', name: '안전모' },
    { file: 'Bangs.png', name: '앞머리' },
    { file: 'AirpodMax.png', name: '에어팟 맥스' },
  ])

  return {
    faceItems,
    handItems,
    headItems,
  }
}
