import express from 'express';

export function createRouter(productController) {
    const router = express.Router();

    router.get('/products', productController.listProducts);
    router.post('/products', productController.createProduct);
    router.put('/products/:id', productController.updateProduct);
    router.post('/products/:productId/reviews', productController.createReview);

    return router;
}
