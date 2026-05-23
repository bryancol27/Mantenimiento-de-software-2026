import { initDb } from './src/infrastructure/database/sqlite.js';
import { SqliteProductRepository } from './src/adapters/repositories/SqliteProductRepository.js';
import { SqliteReviewRepository } from './src/adapters/repositories/SqliteReviewRepository.js';
import { ListProducts } from './src/application/use-cases/ListProducts.js';
import { CreateProduct } from './src/application/use-cases/CreateProduct.js';
import { UpdateProduct } from './src/application/use-cases/UpdateProduct.js';
import { CreateReview } from './src/application/use-cases/CreateReview.js';
import { ProductController } from './src/adapters/controllers/ProductController.js';
import { createRouter } from './src/infrastructure/web/routes.js';
import { createExpressApp } from './src/infrastructure/web/express.js';

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || 'database.db';

try {
    // 1. Inicializar Base de Datos SQLite
    const db = initDb(DB_PATH);

    // 2. Inicializar Adaptadores Secundarios (Repositorios)
    const productRepository = new SqliteProductRepository(db);
    const reviewRepository = new SqliteReviewRepository(db);

    // 3. Inicializar Casos de Uso
    const listProductsUseCase = new ListProducts(productRepository, reviewRepository);
    const createProductUseCase = new CreateProduct(productRepository);
    const updateProductUseCase = new UpdateProduct(productRepository);
    const createReviewUseCase = new CreateReview(reviewRepository, productRepository);

    // 4. Inicializar Adaptador Primario (Controlador) con Inyección de Dependencias
    const productController = new ProductController({
        listProductsUseCase,
        createProductUseCase,
        updateProductUseCase,
        createReviewUseCase,
    });

    // 5. Inicializar Capa de Infraestructura Web (Express y Rutas)
    const router = createRouter(productController);
    const app = createExpressApp(router);

    // 6. Iniciar Servidor
    app.listen(PORT, () => {
        console.log(`[Servidor] Escuchando en http://localhost:${PORT}`);
        console.log(`[SQLite] Base de datos activa en: ${DB_PATH}`);
    });
} catch (error) {
    console.error('Error catastrófico al iniciar la aplicación:', error);
    process.exit(1);
}
