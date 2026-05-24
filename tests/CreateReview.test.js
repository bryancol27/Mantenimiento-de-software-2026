import { CreateReview } from '../src/application/use-cases/CreateReview.js';
import { InMemoryProductRepository } from './InMemoryRepositories.js';
import { InMemoryReviewRepository } from './InMemoryRepositories.js';

describe('HU-05: CreateReview - restricción de una sola reseña por email', () => {
    let productRepository;
    let reviewRepository;
    let createReviewUseCase;

    beforeEach(async () => {
        productRepository = new InMemoryProductRepository();
        reviewRepository = new InMemoryReviewRepository();
        createReviewUseCase = new CreateReview(reviewRepository, productRepository);

        await productRepository.save({
            id: 1,
            name: 'Laptop',
            description: 'Buena laptop',
            price: 1000,
            createdAt: new Date().toISOString(),
        });
    });

    test('debería crear una reseña exitosamente cuando los datos son válidos', async () => {
        const result = await createReviewUseCase.execute({
            productId: 1,
            rating: 5,
            comment: 'Excelente producto',
            userEmail: 'juan@example.com',
        });

        expect(result.id).toBeDefined();
        expect(result.productId).toBe(1);
        expect(result.userEmail).toBe('juan@example.com');
    });

    test('debería lanzar 409 si el usuario ya reseñó el mismo producto', async () => {
        await createReviewUseCase.execute({
            productId: 1,
            rating: 5,
            comment: 'Primera reseña',
            userEmail: 'juan@example.com',
        });

        await expect(
            createReviewUseCase.execute({
                productId: 1,
                rating: 3,
                comment: 'Segunda reseña',
                userEmail: 'juan@example.com',
            })
        ).rejects.toMatchObject({
            message: 'El usuario juan@example.com ya ha reseñado este producto.',
            statusCode: 409,
        });
    });

    test('debería lanzar error si el email es inválido', async () => {
        await expect(
            createReviewUseCase.execute({
                productId: 1,
                rating: 4,
                comment: 'Buen producto',
                userEmail: 'correo-invalido',
            })
        ).rejects.toThrow('El email del usuario es obligatorio y debe ser válido.');
    });

    test('debería lanzar error si el producto no existe', async () => {
        await expect(
            createReviewUseCase.execute({
                productId: 999,
                rating: 4,
                comment: 'Buen producto',
                userEmail: 'juan@example.com',
            })
        ).rejects.toThrow('El producto con ID 999 no existe.');
    });
});