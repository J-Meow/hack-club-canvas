Bun.serve({
    port: 8214,
    routes: {
        "/": new Response(await Bun.file("public/index.html").bytes(), {
            headers: { "Content-Type": "text/html" },
        }),
    },
})

