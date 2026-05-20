import express from 'express';

export function createRouter(productController) {
    const router = express.Router();

    // Rutas para productos
    router.get('/products', productController.listProducts);
    router.post('/products', productController.createProduct);

    // Rutas para reseñas asociadas a un producto
    router.post('/products/:productId/reviews', productController.createReview);

    return router;
}
