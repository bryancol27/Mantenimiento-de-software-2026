import { ListProducts } from '../src/application/use-cases/ListProducts.js';
import { InMemoryProductRepository, InMemoryReviewRepository } from './InMemoryRepositories.js';

describe('Caso de Uso: ListProducts', () => {
    let productRepository;
    let reviewRepository;
    let listProductsUseCase;

    beforeEach(() => {
        productRepository = new InMemoryProductRepository();
        reviewRepository = new InMemoryReviewRepository();
        listProductsUseCase = new ListProducts(productRepository, reviewRepository);
    });

    test('debería listar productos vacíos cuando no hay registros', async () => {
        const result = await listProductsUseCase.execute();
        expect(result).toEqual([]);
    });

    test('debería listar productos con su calificación promedio calculada correctamente', async () => {
        // Guardar dos productos
        const p1 = await productRepository.save({
            name: 'Mouse Óptico',
            description: '16000 DPI',
            price: 49.99,
        });
        const p2 = await productRepository.save({
            name: 'Auriculares Inalámbricos',
            description: 'Bluetooth 5.2',
            price: 89.99,
        });

        // Añadir reseñas al producto 1 (p1.id)
        await reviewRepository.save({ productId: p1.id, rating: 5, comment: 'Excelente!' });
        await reviewRepository.save({ productId: p1.id, rating: 4, comment: 'Muy bueno' });

        // Añadir reseñas al producto 2 (p2.id)
        await reviewRepository.save({ productId: p2.id, rating: 3, comment: 'Regular' });

        const result = await listProductsUseCase.execute();

        expect(result.length).toBe(2);

        // Buscar cada uno en el resultado
        const product1Result = result.find((p) => p.id === p1.id);
        const product2Result = result.find((p) => p.id === p2.id);

        expect(product1Result.reviewsCount).toBe(2);
        expect(product1Result.averageRating).toBe(4.5); // (5 + 4) / 2 = 4.5

        expect(product2Result.reviewsCount).toBe(1);
        expect(product2Result.averageRating).toBe(3);
    });
});
