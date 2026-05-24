export class ReviewRepository {
    async save(_review) {
        throw new Error('Método "save" no implementado');
    }

    async findByProductId(_productId) {
        throw new Error('Método "findByProductId" no implementado');
    }
    async findByProductAndEmail(_productId,_userEmail) {  
        throw new Error('Método "findByProductAndEmail" no implementado');
    }
}
