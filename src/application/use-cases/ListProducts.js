export class ListProducts {
    constructor(productRepository, reviewRepository) {
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
    }

    async execute() {
        const products = await this.productRepository.findAll();
        const productsWithReviews = await Promise.all(
            products.map(async (product) => {
                const reviews = await this.reviewRepository.findByProductId(product.id);
                const averageRating =
                    reviews.length > 0
                        ? Number(
                              (
                                  reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                              ).toFixed(1)
                          )
                        : 0;
                return {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    createdAt: product.createdAt,
                    reviewsCount: reviews.length,
                    averageRating,
                };
            })
        );
        return productsWithReviews;
    }
}
