export class Product {
    constructor({ id, name, description, price, createdAt }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.createdAt = createdAt || new Date().toISOString();
    }

    validate() {
        if (!this.name || typeof this.name !== 'string' || this.name.trim() === '') {
            throw new Error('El nombre del producto es obligatorio y debe ser texto.');
        }
        if (this.price === undefined || typeof this.price !== 'number' || this.price < 0) {
            throw new Error('El precio es obligatorio y debe ser un número no negativo.');
        }
    }
}
