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
const transform = { x: 0, y: 0, zoom: 1 }
function toBoardCoords(x, y, center = false) {
    if (!center) {
        x -= (-size.width * pixelSize) / 2
        y -= (-size.height * pixelSize) / 2
    }
    x -= transform.x
    y -= transform.y
    x -= innerWidth / 2
    y -= innerHeight / 2
    x /= pixelSize
    y /= pixelSize
    return { x, y }
}
let dragging = false
function cursor(name) {
    canvas.style.cursor = name
}
canvas.addEventListener("mousedown", (ev) => {
    dragging = true
    cursor("grabbing")
    lastCursorPositionCentered = toBoardCoords(ev.clientX, ev.clientY, true)
})
addEventListener("mouseup", (ev) => {
    dragging = false
    cursor("grab")
    lastCursorPositionCentered = toBoardCoords(ev.clientX, ev.clientY, true)
})
cursor("grab")
let lastCursorPositionCentered = { x: undefined, y: undefined }
addEventListener("mousemove", (ev) => {
    if (dragging) {
        transform.x += ev.movementX
        transform.y += ev.movementY
    }
    lastCursorPositionCentered = toBoardCoords(ev.clientX, ev.clientY, true)
})
const zoomMin = 10
const zoomMax = 1000
addEventListener(
    "wheel",
    (ev) => {
        if (typeof lastCursorPositionCentered.x == "undefined") {
            lastCursorPositionCentered = toBoardCoords(
                ev.clientX,
                ev.clientY,
                true,
            )
        }
        if (ev.ctrlKey || ev.metaKey || ev.altKey) {
            const originalZoom = pixelSize
            pixelSize -= ev.deltaY
            if (pixelSize < zoomMin) {
                pixelSize = zoomMin
            }
            if (pixelSize > zoomMax) {
                pixelSize = zoomMax
            }
            const zoomChange = pixelSize - originalZoom
            transform.x -= zoomChange * lastCursorPositionCentered.x
            transform.y -= zoomChange * lastCursorPositionCentered.y
        } else {
            transform.x -= ev.deltaX
            transform.y -= ev.deltaY
            lastCursorPositionCentered = toBoardCoords(
                ev.clientX,
                ev.clientY,
                true,
            )
        }
        ev.preventDefault()
    },
    { passive: false },
)
function draw() {
    ctx.clearRect(0, 0, innerWidth, innerHeight)
    ctx.save()
    ctx.translate((-size.width * pixelSize) / 2, (-size.height * pixelSize) / 2)
    ctx.translate(innerWidth / 2, innerHeight / 2)
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
