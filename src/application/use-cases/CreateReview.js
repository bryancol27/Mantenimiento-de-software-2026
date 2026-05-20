import { Review } from '../../domain/models/Review.js';

export class CreateReview {
    constructor(reviewRepository, productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    async execute({ productId, rating, comment }) {
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error(`El producto con ID ${productId} no existe.`);
        }

        const review = new Review({
            productId,
            rating,
            comment,
        });
        review.validate();
        return await this.reviewRepository.save(review);
    }
}
