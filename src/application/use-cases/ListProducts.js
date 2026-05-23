export class ListProducts {
    constructor(productRepository, reviewRepository) {
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
    }

    async execute({ minPrice, maxPrice, page = 1, limit } = {}) {
        const { products, total } = await this.productRepository.findAll({
            minPrice,
            maxPrice,
            limit,
            offset: limit !== undefined ? (page - 1) * limit : undefined,
        });
        const data = await Promise.all(
            products.map(async (product) => {
                const reviews = await this.reviewRepository.findByProductId(product.id);
                const averageRating = reviews.length
                    ? Number(
                          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
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
        return {
            data,
            total,
            page,
            totalPages: limit ? Math.ceil(total / limit) : 1,
        };
    }
}
