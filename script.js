const getRandomNumberBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const setCssVariable = (
  variableName,
  value,
  element = document.querySelector(":root")
) => {
  element.style.setProperty(variableName, value)
}

const canvas = document.querySelector(".canvas")
const ctx = canvas.getContext("2d")
const size = { width: innerWidth, height: innerHeight }

canvas.width = size.width
canvas.height = size.height

const numberOfBubbles = Math.floor(
  parseInt(innerHeight) * parseInt(innerWidth) * 0.0003
)

class Color {
  constructor(hue, saturation, lightness, alpha = 1) {
    this.hue = hue
    this.saturation = saturation
    this.lightness = lightness
    this.alpha = alpha
  }

  toString = () =>
    `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha})`
}

// Shades of a hue
let hue = Math.random() * 361

// how much Hue value of Bubbles Randomize (it adds to a random value from 0 to the Value you choose)
const hueDeviation = 45
const hueIncreaseDecreaseAmountWhenChange = 5

const bubbleAlphaValue = 0.7
let bubbleSaturationValue = 100
const bubbleSaturationIncreaseDecreaseAmountWhenChange = 5

const bubbleSize = {
  min: 30,
  max: 75
}
// radius of the mouse pointer
const pointerHoverRadius = 50
const pointerShownColor = new Color(hue, 80, 20, 0.3)
const pointerHiddenColor = new Color(0, 0, 0, 0)
let pointerShown = false

const bubbleLightnessValues = [
  20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85
]

const colors = bubbleLightnessValues.map(bubbleLightnessValue => {
  return new Color(
    hue - Math.random() * hueDeviation,
    bubbleSaturationValue,
    bubbleLightnessValue,
    bubbleAlphaValue
  )
})

class Bubble {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color

    // the value is saved so it'd be retained when hue increases/ decreases
    this.deviatedFromOriginalHue = this.color.hue - hue
  }
  draw() {
    ctx.fillStyle = this.color.toString()
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    ctx.fill()
  }
  move() {
    this.y += getRandomNumberBetween(-1, 1)
    this.x += getRandomNumberBetween(-1, 1)

    // control if it goes out of bounds
    if (this.x > size.width + this.radius) {
      this.x = -this.radius
    }
    if (this.x < -this.radius) {
      this.x = size.width + this.radius
    }
    if (this.y > size.height + this.radius) {
      this.y = -this.radius
    }
    if (this.y < -this.radius) {
      this.y = size.height + this.radius
    }
  }
}

let bubbles = []

const drawBubbles = () => {
  ctx.clearRect(0, 0, size.width, size.height)
  bubbles.forEach(bubble => {
    bubble.draw()
    bubble.move()
  })
  pointer.draw()

  requestAnimationFrame(drawBubbles)
}

const pointer = new Bubble(
  0,
  0,
  pointerHoverRadius,
  pointerShown ? pointerShownColor : pointerHiddenColor
)

canvas.addEventListener("mousemove", e => {
  // maked hovered bubbles move to a random position
  bubbles
    .filter(
      bubble =>
        e.offsetX >= bubble.x - bubble.radius - pointerHoverRadius &&
        e.offsetX <= bubble.x + bubble.radius + pointerHoverRadius &&
        e.offsetY >= bubble.y - bubble.radius - pointerHoverRadius &&
        e.offsetY <= bubble.y + bubble.radius + pointerHoverRadius
    )
    .forEach(bubble => {
      bubble.x = Math.random() * size.width
      bubble.y = Math.random() * size.height
    })

  // change pointer location
  pointer.x = e.offsetX
  pointer.y = e.offsetY
})

// if size changes redraw
window.addEventListener("resize", () => {
  size.width = innerWidth
  size.height = innerHeight
  canvas.width = size.width
  canvas.height = size.height
})

// initialize the bubbles
bubbles = Array(numberOfBubbles)
  .fill()
  .map(() => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)]

    const bubble = new Bubble(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      getRandomNumberBetween(bubbleSize.min, bubbleSize.max),
      randomColor
    )
    return bubble
  })

window.addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "x":
      pointer.color = pointerShown ? pointerHiddenColor : pointerShownColor
      pointerShown = !pointerShown
      return
    default:
      return
  }
})

window.addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "ArrowDown":
      hue -= hueIncreaseDecreaseAmountWhenChange
      for (const bubble of bubbles) {
        bubble.color.hue = hue + bubble.deviatedFromOriginalHue
      }

      // change var(--hue)
      setCssVariable("--hue", hue)

      return

    case "ArrowUp":
      hue += hueIncreaseDecreaseAmountWhenChange
      for (const bubble of bubbles) {
        bubble.color.hue = hue + bubble.deviatedFromOriginalHue
      }

      // change var(--hue)
      setCssVariable("--hue", hue)

      return
    case "ArrowLeft":
      bubbleSaturationValue = Math.max(
        bubbleSaturationValue -
          bubbleSaturationIncreaseDecreaseAmountWhenChange,
        0
      )

      for (const bubble of bubbles) {
        bubble.color.saturation = bubbleSaturationValue
      }

      // update var(--saturation)
      setCssVariable("--saturation", bubbleSaturationValue + "%")

      return

    case "ArrowRight":
      bubbleSaturationValue = Math.min(
        bubbleSaturationValue +
          bubbleSaturationIncreaseDecreaseAmountWhenChange,
        100
      )

      for (const bubble of bubbles) {
        bubble.color.saturation = bubbleSaturationValue
      }

      // update var(--saturation)
      setCssVariable("--saturation", bubbleSaturationValue + "%")

      return

    default:
      return
  }
})

// TODO: add pointer to show the position of the mouse
setCssVariable("--saturation", bubbleSaturationValue + "%")
setCssVariable("--hue", hue)
drawBubbles()
