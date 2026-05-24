import { ReviewRepository } from '../../domain/ports/ReviewRepository.js';
import { Review } from '../../domain/models/Review.js';

export class SqliteReviewRepository extends ReviewRepository {
    constructor(db) {
        super();
        this.db = db;
    }

    async save(review) {
        const stmt = this.db.prepare(
            'INSERT INTO reviews (productId, rating, comment, createdAt) VALUES (?, ?, ?, ?) RETURNING id, productId, rating, comment,userEmail, createdAt'
        );
        const result = stmt.get(review.productId, review.rating, review.comment,review.userEmail, review.createdAt);
        return new Review({
            id: result.id,
            productId: result.productId,
            rating: result.rating,
            comment: result.comment,
            userEmail: result.userEmail,
            createdAt: result.createdAt,
        });
    }

    async findByProductId(productId) {
        const stmt = this.db.prepare(
            'SELECT id, productId, rating, comment,userEmail, createdAt FROM reviews WHERE productId = ? ORDER BY id DESC'
        );
        const rows = stmt.all(productId);
        return rows.map(
            (row) =>
                new Review({
                    id: row.id,
                    productId: row.productId,
                    rating: row.rating,
                    comment: row.comment,
                    userEmail: row.userEmail,
                    createdAt: row.createdAt,
                })
        );
    }

    async findByProductAndEmail(productId, userEmail) {   // 
        const stmt = this.db.prepare(
            'SELECT id FROM reviews WHERE productId = ? AND userEmail = ?'
        );
        return stmt.get(productId, userEmail) || null;
    }
}
