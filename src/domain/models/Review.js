export class Review {
    constructor({ id, productId, rating, comment,userEmail, createdAt }) {
        this.id = id;
        this.productId = productId;
        this.rating = rating;
        this.comment = comment;
        this.userEmail = userEmail;
        this.createdAt = createdAt || new Date().toISOString();
    }

    validate() {
        if (!this.productId) {
            throw new Error('El ID del producto es obligatorio.');
        }
        if (
            this.rating === undefined ||
            typeof this.rating !== 'number' ||
            this.rating < 1 ||
            this.rating > 5
        ) {
            throw new Error('La calificación es obligatoria y debe ser un número entre 1 y 5.');
        }
        if (!this.comment || typeof this.comment !== 'string' || this.comment.trim() === '') {
            throw new Error('El comentario de la reseña es obligatorio y debe ser texto.');
        }

        if (!this.userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.userEmail)) {
            throw new Error('El email del usuario es obligatorio y debe ser válido.');
        }
    }
}
