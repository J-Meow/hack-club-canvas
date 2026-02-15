import { SQL } from "bun"

const sql = new SQL()
Bun.serve({
    port: 8214,
    routes: {
        "/": async () =>
            new Response(await Bun.file("public/index.html").bytes(), {
                headers: { "Content-Type": "text/html" },
            }),
        "/index.js": async () =>
            new Response(await Bun.file("public/index.js").bytes(), {
                headers: { "Content-Type": "text/javascript" },
            }),
        "/api/canvas": {
            GET: async () => {
                const events =
                    await sql`SELECT id, type, color, x, y, width, height FROM events`
                const canvasSize = { width: 0, height: 0 }
                const canvasPixels: { [key: string]: string } = {}
                events.forEach(
                    (event: {
                        type: string
                        id: number
                        width: number | undefined
                        height: number | undefined
                        x: number | undefined
                        y: number | undefined
                        color: string | undefined
                    }) => {
                        switch (event.type) {
                            case "boardsize":
                                canvasSize.width = event.width!
                                canvasSize.height = event.height!
                                break
                            case "pixel":
                                canvasPixels[event.x + "," + event.y] =
                                    event.color!
                                break
                            default:
                                console.log(
                                    "Unkown event type " +
                                        event.type +
                                        " with id " +
                                        event.id,
                                )
                        }
                    },
                )
                return Response.json({
                    ...canvasSize,
                    pixels: canvasPixels,
                })
            },
        },
    },
})

