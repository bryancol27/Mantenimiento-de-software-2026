import { ProductRepository } from '../src/domain/ports/ProductRepository.js';
import { ReviewRepository } from '../src/domain/ports/ReviewRepository.js';

export class InMemoryProductRepository extends ProductRepository {
    constructor() {
        super();
        this.products = [];
        this.currentId = 1;
    }

    async save(product) {
        const savedProduct = {
            ...product,
            id: product.id || this.currentId++,
        };
        this.products.push(savedProduct);
        return savedProduct;
    }

    async findById(id) {
        return this.products.find((p) => p.id === id) || null;
    }

    async findAll() {
        return [...this.products].sort((a, b) => b.id - a.id);
    }
}

export class InMemoryReviewRepository extends ReviewRepository {
    constructor() {
        super();
        this.reviews = [];
        this.currentId = 1;
    }

    async save(review) {
        const savedReview = {
            ...review,
            id: review.id || this.currentId++,
        };
        this.reviews.push(savedReview);
        return savedReview;
    }

    async findByProductId(productId) {
        return this.reviews.filter((r) => r.productId === productId).sort((a, b) => b.id - a.id);
    }
}
