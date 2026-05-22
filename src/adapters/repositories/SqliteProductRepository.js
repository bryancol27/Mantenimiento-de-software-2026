import { ProductRepository } from '../../domain/ports/ProductRepository.js';
import { Product } from '../../domain/models/Product.js';

export class SqliteProductRepository extends ProductRepository {
    constructor(db) {
        super();
        this.db = db;
    }

    async save(product) {
        const stmt = this.db.prepare(
            'INSERT INTO products (name, description, price, createdAt) VALUES (?, ?, ?, ?) RETURNING id, name, description, price, createdAt'
        );
        const result = stmt.get(
            product.name,
            product.description,
            product.price,
            product.createdAt
        );
        return new Product({
            id: result.id,
            name: result.name,
            description: result.description,
            price: result.price,
            createdAt: result.createdAt,
        });
    }

    async findById(id) {
        const stmt = this.db.prepare(
            'SELECT id, name, description, price, createdAt FROM products WHERE id = ?'
        );
        const row = stmt.get(id);
        if (!row) return null;
        return new Product({
            id: row.id,
            name: row.name,
            description: row.description,
            price: row.price,
            createdAt: row.createdAt,
        });
    }

    async findAll() {
        const stmt = this.db.prepare(
            'SELECT id, name, description, price, createdAt FROM products ORDER BY id DESC'
        );
        const rows = stmt.all();
        return rows.map(
            (row) =>
                new Product({
                    id: row.id,
                    name: row.name,
                    description: row.description,
                    price: row.price,
                    createdAt: row.createdAt,
                })
        );
    }

    async update(product) {
        const stmt = this.db.prepare(
            'UPDATE products SET name = ?, description = ?, price = ? WHERE id = ? RETURNING id, name, description, price, createdAt'
        );
        const row = stmt.get(product.name, product.description, product.price, product.id);
        if (!row) return null;
        return new Product({
            id: row.id,
            name: row.name,
            description: row.description,
            price: row.price,
            createdAt: row.createdAt,
        });
    }
}
