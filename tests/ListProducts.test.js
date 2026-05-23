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
        expect(result.data).toEqual([]);
        expect(result.total).toBe(0);
        expect(result.page).toBe(1);
        expect(result.totalPages).toBe(1);
    });

    test('debería listar productos con su calificación promedio calculada correctamente', async () => {
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
        await reviewRepository.save({ productId: p1.id, rating: 5, comment: 'Excelente!' });
        await reviewRepository.save({ productId: p1.id, rating: 4, comment: 'Muy bueno' });
        await reviewRepository.save({ productId: p2.id, rating: 3, comment: 'Regular' });

        const result = await listProductsUseCase.execute();

        expect(result.data).toHaveLength(2);
        const product1Result = result.data.find((p) => p.id === p1.id);
        const product2Result = result.data.find((p) => p.id === p2.id);
        expect(product1Result.reviewsCount).toBe(2);
        expect(product1Result.averageRating).toBe(4.5);
        expect(product2Result.reviewsCount).toBe(1);
        expect(product2Result.averageRating).toBe(3);
    });

    test('debería filtrar por rango de precio y paginar ordenando por id descendente', async () => {
        for (let i = 1; i <= 20; i++) {
            await productRepository.save({
                name: `Producto ${i}`,
                description: `Desc ${i}`,
                price: 10 + Math.round(((i - 1) * 490) / 19),
            });
        }

        const result = await listProductsUseCase.execute({
            minPrice: 50,
            maxPrice: 200,
            limit: 5,
            page: 1,
        });

        expect(result.data).toHaveLength(5);
        expect(result.page).toBe(1);
        expect(result.totalPages).toBe(Math.ceil(result.total / 5));
        result.data.forEach((p) => {
            expect(p.price).toBeGreaterThanOrEqual(50);
            expect(p.price).toBeLessThanOrEqual(200);
        });
        for (let i = 1; i < result.data.length; i++) {
            expect(result.data[i - 1].id).toBeGreaterThan(result.data[i].id);
        }
    });
});
