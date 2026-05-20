import { Product } from '../../domain/models/Product.js';

export class CreateProduct {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute({ name, description, price }) {
        const product = new Product({
            name,
            description,
            price,
        });
        product.validate();
        return await this.productRepository.save(product);
    }
}
