import express from 'express';

export function createRouter(productController) {
    const router = express.Router();

    router.get('/products', productController.listProducts);
    router.post('/products', productController.createProduct);
    router.get('/products/:id', productController.getProductDetails);

    // Rutas para reseñas asociadas a un producto
    router.put('/products/:id', productController.updateProduct);
    router.post('/products/:productId/reviews', productController.createReview);

    router.delete('/products/:productId', (req, res, next) =>
    productController.deleteProduct(req, res, next)
    );

    return router;
}
