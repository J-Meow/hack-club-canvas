const canvas = document.getElementById("main")
const ctx = canvas.getContext("2d")
function resize() {
    canvas.width = innerWidth
    canvas.height = innerHeight
}
resize()
addEventListener("resize", resize)
let pixels = {}
const size = { width: 0, height: 0 }
;(async () => {
    const response = await fetch("/api/canvas")
    const json = await response.json()
    size.width = json.width
    size.height = json.height
    pixels = json.pixels
})()
let pixelSize = 20
const transform = { x: 20, y: 20 }
function draw() {
    ctx.clearRect(0, 0, innerWidth, innerHeight)
    ctx.save()
    ctx.translate(transform.x, transform.y)
    ctx.fillStyle = "#eeeeee"
    ctx.fillRect(0, 0, size.width * pixelSize, size.height * pixelSize)
    Object.keys(pixels).forEach((pixelLocation) => {
        const pixel = pixels[pixelLocation]
        const x = parseInt(pixelLocation.split(",")[0])
        const y = parseInt(pixelLocation.split(",")[1])
        ctx.fillStyle = pixel
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    })
    ctx.restore()
    requestAnimationFrame(draw)
}
draw()
