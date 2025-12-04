import { NextResponse } from 'next/server';

/**
 * GET /api/docs - Serve Swagger UI HTML
 */
export async function GET() {
  const swaggerUIHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>API Documentation</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
    <div id="swagger-ui"></div>

    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            // Begin Swagger UI call
            const ui = SwaggerUIBundle({
                url: "/api/swagger",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });

            window.ui = ui;
        };
    </script>
</body>
</html>`;

  return new NextResponse(swaggerUIHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
