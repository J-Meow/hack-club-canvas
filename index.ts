import { SQL } from "bun"

const sql = new SQL()

async function currentState() {
    const events =
        await sql`SELECT id, type, color, x, y, width, height FROM events`
    const canvasSize = { width: 0, height: 0 }
    const canvasPixels: { [key: string]: string } = {}
    const allowedColors: string[] = []
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
                    canvasPixels[event.x + "," + event.y] = event.color!
                    break
                case "addcolor":
                    if (allowedColors.includes(event.color!)) {
                        console.log(
                            "Color " +
                                event.color +
                                " already allowed with id " +
                                event.id,
                        )
                        break
                    }
                    allowedColors.push(event.color!)
                    break
                case "removecolor":
                    if (!allowedColors.includes(event.color!)) {
                        console.log(
                            "Color " +
                                event.color +
                                " can't be disallowed because it is already not allowed with id " +
                                event.id,
                        )
                        break
                    }
                    allowedColors.splice(allowedColors.indexOf(event.color!), 1)
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
    return {
        ...canvasSize,
        pixels: canvasPixels,
        allowedColors,
    }
}

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
                return Response.json(await currentState())
            },
            POST: async (req) => {
                const json = (await req.json()) as {
                    color: string
                    x: number
                    y: number
                }
                // TODO: Add better validation

                const boardState = await currentState()
                if (!boardState.allowedColors.includes(json.color)) {
                    return Response.json(
                        { error: "Color not in list of allowed colors" },
                        { status: 400 },
                    )
                }

                await sql`INSERT INTO events("type", "x", "y", "color") VALUES('pixel', ${json.x}, ${json.y}, ${json.color})`
                return Response.json(await currentState())
            },
        },
    },
})

