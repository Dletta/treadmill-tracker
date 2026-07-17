/**
 * Generate an ISO String
 * @returns {string} timestamp
 */
function timestamp() {
  return new Date().toISOString();
}

async function main () {
    // @ts-ignore
    const server = Bun.serve({
        // `routes` requires Bun v1.2.3+
        routes: {
            // Static routes
            /**
             * Handle all requests matching sub
             * @param {Request} req 
             * @returns {Promise<Response>}
             */
            "/*": async req => {
                let url = new URL(req.url, `http://${req.headers.get("host")}`);
                if (url.pathname.endsWith('/')) {
                    // @ts-ignore
                    return new Response(await Bun.file("./index.html"), { headers: { "Content-Type": "text/html" } })
                } else if (url.pathname.endsWith(".css")) {
                    // @ts-ignore
                    return new Response(await Bun.file(`./${url.pathname}`), { headers: { "Content-Type": "text/css" } })
                } else if (url.pathname.endsWith(".js")) {
                    // @ts-ignore
                    return new Response(await Bun.file(`./${url.pathname}`), { headers: { "Content-Type": "application/javascript" } })
                } else {
                    return new Response("Not Found", { status: 404 });
                }
            },
        },
    });

        console.log(`Server running at ${server.url}`);
}

main()