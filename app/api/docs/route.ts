import { NextResponse } from 'next/server';

/**
 * GET /api/docs - Serve Swagger UI HTML
 *
 * This serves the Swagger UI interface pointing to the OpenAPI spec at /openapi.json
 */
export async function GET() {
  const swaggerUIHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>API Documentation</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; padding: 0; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>

    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            // Swagger UI configuration
            const ui = SwaggerUIBundle({
                url: "/api/openapi.json",
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
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}
