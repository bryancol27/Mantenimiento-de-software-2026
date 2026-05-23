import { UpdateProduct } from '../src/application/use-cases/UpdateProduct.js';
import { InMemoryProductRepository } from './InMemoryRepositories.js';

describe('Caso de Uso: UpdateProduct', () => {
    let productRepository;
    let updateProductUseCase;

    beforeEach(() => {
        productRepository = new InMemoryProductRepository();
        updateProductUseCase = new UpdateProduct(productRepository);
    });

    test('debería actualizar nombre y precio con datos válidos y persistir los cambios', async () => {
        const saved = await productRepository.save({
            name: 'Teclado',
            description: 'Mecánico RGB',
            price: 50,
        });

        const result = await updateProductUseCase.execute(saved.id, {
            name: 'Teclado Modificado',
            price: 55.99,
        });

        expect(result.name).toBe('Teclado Modificado');
        expect(result.price).toBe(55.99);
        expect(result.description).toBe('Mecánico RGB');

        const stored = await productRepository.findById(saved.id);
        expect(stored.name).toBe('Teclado Modificado');
        expect(stored.price).toBe(55.99);
    });

    test('debería rechazar precio negativo sin alterar el producto en la base de datos', async () => {
        const saved = await productRepository.save({
            name: 'Teclado',
            description: 'Mecánico RGB',
            price: 50,
        });

        await expect(updateProductUseCase.execute(saved.id, { price: -10 })).rejects.toThrow(
            'El precio es obligatorio y debe ser un número no negativo.'
        );

        const stored = await productRepository.findById(saved.id);
        expect(stored.name).toBe('Teclado');
        expect(stored.price).toBe(50);
    });

    test('debería lanzar error si el producto no existe', async () => {
        await expect(
            updateProductUseCase.execute(999, { name: 'Inexistente' })
        ).rejects.toThrow('Producto no encontrado.');
    });
});
