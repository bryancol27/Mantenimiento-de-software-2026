import request from 'supertest';
import { createExpressApp } from '../src/infrastructure/web/express.js';
import { createRouter } from '../src/infrastructure/web/routes.js';
import { ProductController } from '../src/adapters/controllers/ProductController.js';
import { GetProductDetails } from '../src/application/use-cases/GetProductDetails.js';
import { CreateProduct } from '../src/application/use-cases/CreateProduct.js';
import { CreateReview } from '../src/application/use-cases/CreateReview.js';
import { ListProducts } from '../src/application/use-cases/ListProducts.js';
import { InMemoryProductRepository, InMemoryReviewRepository } from './InMemoryRepositories.js';
import { Product } from '../src/domain/models/Product.js';
import { Review } from '../src/domain/models/Review.js';

describe('API Endpoints - HU-01: Obtener Detalle de un Producto con sus Reseñas', () => {
    let app;
    let productRepository;
    let reviewRepository;

    beforeEach(() => {
        productRepository = new InMemoryProductRepository();
        reviewRepository = new InMemoryReviewRepository();

        const listProductsUseCase = new ListProducts(productRepository, reviewRepository);
        const createProductUseCase = new CreateProduct(productRepository);
        const createReviewUseCase = new CreateReview(reviewRepository, productRepository);
        const getProductDetailsUseCase = new GetProductDetails(productRepository, reviewRepository);

        const productController = new ProductController({
            listProductsUseCase,
            createProductUseCase,
            createReviewUseCase,
            getProductDetailsUseCase,
        });

        const router = createRouter(productController);
        app = createExpressApp(router);
    });

    test('GET /api/products/:id - Escenario: Obtener un producto existente', async () => {
        // Dado que existe un producto con ID 1 (el ID en InMemoryRepository empieza en 1)
        const product = await productRepository.save(
            new Product({
                name: 'Laptop HP ProBook',
                description: 'AMD Ryzen 5, 16GB RAM, 512GB SSD',
                price: 799.99,
            })
        );

        // Y tiene 3 reseñas asociadas
        await reviewRepository.save(
            new Review({ productId: product.id, rating: 5, comment: 'Excelente' })
        );
        await reviewRepository.save(
            new Review({ productId: product.id, rating: 4, comment: 'Muy bueno' })
        );
        await reviewRepository.save(
            new Review({ productId: product.id, rating: 5, comment: 'Totalmente recomendado' })
        );

        // Cuando realice una petición GET a /api/products/1
        const response = await request(app)
            .get(`/api/products/${product.id}`)
            .expect('Content-Type', /json/)
            .expect(200);

        // Entonces la respuesta debe retornar un código 200 OK con los datos del producto (ID, nombre, descripción, precio) y un arreglo reviews que contenga el detalle completo de las 3 reseñas.
        expect(response.body).toBeDefined();
        expect(response.body.id).toBe(product.id);
        expect(response.body.name).toBe(product.name);
        expect(response.body.description).toBe(product.description);
        expect(response.body.price).toBe(product.price);
        expect(response.body.createdAt).toBeDefined();
        expect(response.body.reviews).toBeDefined();
        expect(response.body.reviews.length).toBe(3);

        // Verificar detalles completos de las reseñas
        expect(response.body.reviews[0].comment).toBe('Totalmente recomendado');
        expect(response.body.reviews[0].rating).toBe(5);
        expect(response.body.reviews[1].comment).toBe('Muy bueno');
        expect(response.body.reviews[1].rating).toBe(4);
        expect(response.body.reviews[2].comment).toBe('Excelente');
        expect(response.body.reviews[2].rating).toBe(5);
    });

    test('GET /api/products/:id - Escenario: Buscar un producto inexistente', async () => {
        // Dado que no existe un producto con ID 999
        const nonExistentId = 999;

        // Cuando realice una petición GET a /api/products/999
        const response = await request(app)
            .get(`/api/products/${nonExistentId}`)
            .expect('Content-Type', /json/)
            .expect(404);

        // Entonces la respuesta debe retornar un código 404 Not Found con el mensaje "El producto con ID 999 no existe.".
        expect(response.body).toEqual({
            error: `El producto con ID ${nonExistentId} no existe.`,
        });
    });
});
