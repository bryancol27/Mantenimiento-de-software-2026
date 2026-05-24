import { Review } from '../../domain/models/Review.js';

export class CreateReview {
    constructor(reviewRepository, productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    async execute({ productId, rating, comment,userEmail }) {
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error(`El producto con ID ${productId} no existe.`);
        }

        const existing = await this.reviewRepository.findByProductAndEmail(productId, userEmail);
        if (existing) {
            const error = new Error(`El usuario ${userEmail} ya ha reseñado este producto.`);
            error.statusCode = 409;
            throw error;
        }

        const review = new Review({
            productId,
            rating,
            comment,
            userEmail,
        });
        review.validate();
        return await this.reviewRepository.save(review);
    }
}
