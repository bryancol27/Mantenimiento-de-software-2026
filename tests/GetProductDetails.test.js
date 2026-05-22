import { GetProductDetails } from '../src/application/use-cases/GetProductDetails.js';
import { InMemoryProductRepository, InMemoryReviewRepository } from './InMemoryRepositories.js';
import { Product } from '../src/domain/models/Product.js';
import { Review } from '../src/domain/models/Review.js';

describe('Caso de Uso: GetProductDetails', () => {
    let productRepository;
    let reviewRepository;
    let getProductDetailsUseCase;

    beforeEach(() => {
        productRepository = new InMemoryProductRepository();
        reviewRepository = new InMemoryReviewRepository();
        getProductDetailsUseCase = new GetProductDetails(productRepository, reviewRepository);
    });

    test('debería obtener un producto existente con sus reseñas asociadas', async () => {
        // Guardar un producto
        const product = await productRepository.save(
            new Product({
                name: 'Laptop HP ProBook',
                description: 'AMD Ryzen 5, 16GB RAM, 512GB SSD',
                price: 799.99,
            })
        );

        // Añadir 3 reseñas asociadas al producto
        await reviewRepository.save(
            new Review({ productId: product.id, rating: 5, comment: 'Excelente' })
        );
        await reviewRepository.save(
            new Review({ productId: product.id, rating: 4, comment: 'Muy bueno' })
        );
        await reviewRepository.save(
            new Review({ productId: product.id, rating: 5, comment: 'Totalmente recomendado' })
        );

        const result = await getProductDetailsUseCase.execute({ id: product.id });

        expect(result.id).toBe(product.id);
        expect(result.name).toBe(product.name);
        expect(result.description).toBe(product.description);
        expect(result.price).toBe(product.price);
        expect(result.createdAt).toBeDefined();

        expect(result.reviews).toBeDefined();
        expect(result.reviews.length).toBe(3);

        // Validar el detalle completo de las reseñas (el repositorio en memoria las ordena de forma descendente por id por defecto, o similar)
        // En InMemoryReviewRepository: return this.reviews.filter((r) => r.productId === productId).sort((a, b) => b.id - a.id);
        // Por ende, la última reseña guardada estará de primera en la lista
        expect(result.reviews[0].comment).toBe('Totalmente recomendado');
        expect(result.reviews[0].rating).toBe(5);
        expect(result.reviews[1].comment).toBe('Muy bueno');
        expect(result.reviews[1].rating).toBe(4);
        expect(result.reviews[2].comment).toBe('Excelente');
        expect(result.reviews[2].rating).toBe(5);
    });

    test('debería lanzar un error si el producto no existe', async () => {
        const nonExistentId = 999;
        await expect(getProductDetailsUseCase.execute({ id: nonExistentId })).rejects.toThrow(
            `El producto con ID ${nonExistentId} no existe.`
        );
    });
});
