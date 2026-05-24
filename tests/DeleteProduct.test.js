    import { jest } from '@jest/globals'; 
    import { DeleteProduct } from '../src/application/use-cases/DeleteProduct.js';

    describe('HU-04: DeleteProduct', () => {
    it('elimina el producto si existe', async () => {
        const mockRepo = {
        findById: jest.fn().mockResolvedValue({ id: 2, name: 'Producto X' }),
        delete: jest.fn().mockResolvedValue(),
        };
        const useCase = new DeleteProduct(mockRepo);
        await expect(useCase.execute(2)).resolves.not.toThrow();
        expect(mockRepo.delete).toHaveBeenCalledWith(2);
    });

    it('lanza 404 si el producto no existe', async () => {
        const mockRepo = {
        findById: jest.fn().mockResolvedValue(null),
        delete: jest.fn(),
        };
        const useCase = new DeleteProduct(mockRepo);
        await expect(useCase.execute(999)).rejects.toMatchObject({
        message: 'El producto con ID 999 no existe.',
        statusCode: 404,
        });
        expect(mockRepo.delete).not.toHaveBeenCalled();
    });
    });