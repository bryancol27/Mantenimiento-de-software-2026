export class DeleteProduct {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute(productId) {
        const product = await this.productRepository.findById(productId);
        if (!product) {
            const error = new Error(`El producto con ID ${productId} no existe.`);
            error.statusCode = 404;
            throw error;
        }
        await this.productRepository.delete(productId);
    }
}