import express from 'express';

export function createExpressApp(router) {
    const app = express();

    app.use(express.json());

    // Endpoint de verificación de salud
    app.get('/health', (req, res) => {
        res.json({
            status: 'UP',
            timestamp: new Date().toISOString(),
        });
    });

    // Registrar rutas de la API bajo el prefijo /api
    app.use('/api', router);

    // Middleware de manejo de errores globales
    app.use((err, req, res, _next) => {
        console.error(err.stack);
        res.status(500).json({
            error: 'Ocurrió un error interno en el servidor.',
        });
    });

    return app;
}
