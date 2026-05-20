import { CreateProduct } from '../src/application/use-cases/CreateProduct.js';
import { InMemoryProductRepository } from './InMemoryRepositories.js';

describe('Caso de Uso: CreateProduct', () => {
    let productRepository;
    let createProductUseCase;

    beforeEach(() => {
        productRepository = new InMemoryProductRepository();
        createProductUseCase = new CreateProduct(productRepository);
    });

    test('debería crear un producto exitosamente cuando los datos son válidos', async () => {
        const productData = {
            name: 'Laptop Gamer',
            description: 'Intel i9, 32GB RAM, RTX 4080',
            price: 1500.99,
        };

        const result = await createProductUseCase.execute(productData);

        expect(result.id).toBeDefined();
        expect(result.name).toBe(productData.name);
        expect(result.price).toBe(productData.price);
        expect(result.createdAt).toBeDefined();

        const stored = await productRepository.findById(result.id);
        expect(stored).not.toBeNull();
        expect(stored.name).toBe(productData.name);
    });

    test('debería lanzar un error si el nombre del producto es vacío', async () => {
        const invalidData = {
            name: '',
            price: 10,
        };

        await expect(createProductUseCase.execute(invalidData)).rejects.toThrow(
            'El nombre del producto es obligatorio y debe ser texto.'
        );
    });

    test('debería lanzar un error si el precio es negativo', async () => {
        const invalidData = {
            name: 'Teclado Mecánico',
            price: -50,
        };

        await expect(createProductUseCase.execute(invalidData)).rejects.toThrow(
            'El precio es obligatorio y debe ser un número no negativo.'
        );
    });
});
