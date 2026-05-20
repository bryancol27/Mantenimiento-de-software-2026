export class ProductController {
    constructor({ listProductsUseCase, createProductUseCase, createReviewUseCase }) {
        this.listProductsUseCase = listProductsUseCase;
        this.createProductUseCase = createProductUseCase;
        this.createReviewUseCase = createReviewUseCase;
    }

    listProducts = async (req, res, _next) => {
        try {
            const products = await this.listProductsUseCase.execute();
            res.json(products);
        } catch (error) {
            _next(error);
        }
    };

    createProduct = async (req, res, _next) => {
        try {
            const { name, description, price } = req.body;
            const newProduct = await this.createProductUseCase.execute({
                name,
                description,
                price: price !== undefined ? Number(price) : undefined,
            });
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    createReview = async (req, res, _next) => {
        try {
            const { productId } = req.params;
            const { rating, comment } = req.body;
            const newReview = await this.createReviewUseCase.execute({
                productId: Number(productId),
                rating: rating !== undefined ? Number(rating) : undefined,
                comment,
            });
            res.status(201).json(newReview);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
