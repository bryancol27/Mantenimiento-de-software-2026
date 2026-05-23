export class GetProductDetails {
    constructor(productRepository, reviewRepository) {
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
    }

    async execute({ id }) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new Error(`El producto con ID ${id} no existe.`);
        }

        const reviews = await this.reviewRepository.findByProductId(id);

        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            createdAt: product.createdAt,
            reviews: reviews.map((r) => ({
                id: r.id,
                productId: r.productId,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt,
            })),
        };
    }
}
