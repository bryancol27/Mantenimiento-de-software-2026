import Database from 'better-sqlite3';

export function initDb(dbPath = 'database.db') {
    const db = new Database(dbPath);

    // Habilitar claves foráneas
    db.pragma('foreign_keys = ON');

    // Crear tablas de productos y reseñas
    db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            createdAt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            productId INTEGER NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (productId) REFERENCES products (id) ON DELETE CASCADE
        );
    `);

    return db;
}
