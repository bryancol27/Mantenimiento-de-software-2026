import { ProductRepository } from '../../domain/ports/ProductRepository.js';
import { Product } from '../../domain/models/Product.js';

const toProduct = (row) =>
    new Product({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        createdAt: row.createdAt,
    });

export class SqliteProductRepository extends ProductRepository {
    constructor(db) {
        super();
        this.db = db;
    }

    async save(product) {
        const stmt = this.db.prepare(
            'INSERT INTO products (name, description, price, createdAt) VALUES (?, ?, ?, ?) RETURNING id, name, description, price, createdAt'
        );
        return toProduct(
            stmt.get(product.name, product.description, product.price, product.createdAt)
        );
    }

    async findById(id) {
        const row = this.db
            .prepare('SELECT id, name, description, price, createdAt FROM products WHERE id = ?')
            .get(id);
        return row ? toProduct(row) : null;
    }

    async findAll({ minPrice, maxPrice, limit, offset } = {}) {
        const conditions = [];
        const params = [];
        if (minPrice !== undefined) {
            conditions.push('price >= ?');
            params.push(minPrice);
        }
        if (maxPrice !== undefined) {
            conditions.push('price <= ?');
            params.push(maxPrice);
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const total = this.db.prepare(`SELECT COUNT(*) as count FROM products ${where}`).get(...params)
            .count;
        let sql = `SELECT id, name, description, price, createdAt FROM products ${where} ORDER BY id DESC`;
        const queryParams = [...params];
        if (limit !== undefined) {
            sql += ' LIMIT ? OFFSET ?';
            queryParams.push(Math.trunc(limit), Math.trunc(offset ?? 0));
        }
        return {
            products: this.db.prepare(sql).all(...queryParams).map(toProduct),
            total,
        };
    }
}
