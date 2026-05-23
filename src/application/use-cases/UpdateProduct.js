import { Product } from '../../domain/models/Product.js';

export class UpdateProduct {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute(id, { name, description, price }) {
        const existing = await this.productRepository.findById(id);
        if (!existing) {
            throw new Error('Producto no encontrado.');
        }

        const product = new Product({
            id: existing.id,
            name: name !== undefined ? name : existing.name,
            description: description !== undefined ? description : existing.description,
            price: price !== undefined ? price : existing.price,
            createdAt: existing.createdAt,
        });
        product.validate();
        return await this.productRepository.update(product);
    }
}
