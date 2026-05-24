const toNumber = (value) => (value !== undefined ? Number(value) : undefined);

export class ProductController {
    constructor({
        listProductsUseCase,
        createProductUseCase,
        updateProductUseCase,
        createReviewUseCase,
        getProductDetailsUseCase,
        deleteProductUseCase  
    }) {
        this.listProductsUseCase = listProductsUseCase;
        this.createProductUseCase = createProductUseCase;
        this.updateProductUseCase = updateProductUseCase;
        this.createReviewUseCase = createReviewUseCase;
        this.getProductDetailsUseCase = getProductDetailsUseCase;
        this.deleteProductUseCase = deleteProductUseCase;
    }

    listProducts = async (req, res, _next) => {
        try {
            const { minPrice, maxPrice, limit, page } = req.query;
            const result = await this.listProductsUseCase.execute({
                minPrice: toNumber(minPrice),
                maxPrice: toNumber(maxPrice),
                limit: toNumber(limit),
                page: toNumber(page),
            });
            res.json(result);
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

    updateProduct = async (req, res, _next) => {
        try {
            const { id } = req.params;
            const { name, description, price } = req.body;
            const updatedProduct = await this.updateProductUseCase.execute(Number(id), {
                name,
                description,
                price: price !== undefined ? Number(price) : undefined,
            });
            res.status(200).json(updatedProduct);
        } catch (error) {
            if (error.message === 'Producto no encontrado.') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(400).json({ error: error.message });
        }
    };

    createReview = async (req, res, _next) => {
        try {
            const { productId } = req.params;
            const { rating, comment,userEmail } = req.body;
            const newReview = await this.createReviewUseCase.execute({
                productId: Number(productId),
                rating: rating !== undefined ? Number(rating) : undefined,
                comment,
                userEmail,
            });
            res.status(201).json(newReview);
        } catch (error) {

            if (error.statusCode === 409){
            res.status(409).json({ error: error.message });
            return;
        }
        res.status(400).json({ error: error.message });  
    }
    };

    getProductDetails = async (req, res, _next) => {
        try {
            const { id } = req.params;
            const product = await this.getProductDetailsUseCase.execute({
                id: Number(id),
            });
            res.json(product);
        } catch (error) {
            if (error.message.includes('no existe')) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    };


    deleteProduct = async (req, res, next) => {   
            try {
                const productId = parseInt(req.params.productId);
                await this.deleteProductUseCase.execute(productId);
                res.status(204).send();
            } catch (error) {
                next(error);
            }
        };
}
