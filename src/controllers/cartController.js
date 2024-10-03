import {
    getCartById,
    addProductToCart as addProductToCartService,
    updateProductQuantity as updateProductQuantityService,
    removeProductFromCart as removeProductFromCartService,
    clearCartProducts as clearCartProductsService,
    purchaseCart,
} from '../services/cartService.js'
import logger from '../utils/logger.js'
import Product from '../models/productModel.js'

export const getCart = async (req, res) => {
    try {
        const { cid } = req.params
        const cart = await getCartById(cid)
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'no se encontro el carrito' })
        }
        res.json({ status: 'success', message: 'Carrito', data: cart })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}

export const updateCart = async (req, res) => {
    const { cid } = req.params
    const { products } = req.body

    try {
        const cart = await getCartById(cid)
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'no se encontro el carrito' })
        }

        products.forEach(({ productId, quantity }) => {
            const productIndex = cart.products.findIndex(p => p.productId === productId)
            if (productIndex > -1) {
                cart.products[productIndex].quantity = quantity
            }
        })

        await cartRepository.updateCart(cart)
        res.json({ status: 'success', cart })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
}

export const addProductToCart = async (req, res) => {
    const { cid, pid } = req.params
    const { cantidad } = req.body
    const userEmail = req.user.email 

    try {
        const product = await Product.findById(pid)
        if (!product) {
            logger.error(`imposible encontrar el producto con ID ${pid} `)
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' })
        }

         if (userEmail === product.owner) {
            logger.error(`no se puede agregar producto propio  ${userEmail}`)
            return res.status(400).json({ status: 'error', message: 'no se puede agregar producto propio ' })
        } 

        if (isNaN(cantidad) || cantidad <= 0) {
            logger.error(`cantidad inválida: ${cantidad}`)
            return res.status(400).json({ status: 'error', message: 'debe seleccionar 1 o mas' })
        }

        await addProductToCartService(cid, pid, cantidad)
        logger.info(` ${pid} agregado al carrito ${cid} con cantidad ${cantidad}`)
        res.json({ status: 'success', message: 'Producto agregado' })
    } catch (err) {
        logger.error(`Error al agregar producto ${pid} al carrito ${cid}: ${err.message}`)
        res.status(500).json({ status: 'error', message: err.message })
    }
}

export const updateProductQuantity = async (req, res) => {
    const { cid, pid } = req.params
    const { cantidad } = req.body

    try {
        await updateProductQuantityService(cid, pid, cantidad)
        res.json({ status: 'success', message: 'Cantidad actualizada' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}

export const deleteProductFromCart = async (req, res) => {
    const { cid, pid } = req.params

    try {
        await removeProductFromCartService(cid, pid)
        res.json({ status: 'success', message: 'Producto eliminado del carrito' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}

export const deleteAllProductsFromCart = async (req, res) => {
    const { cid } = req.params

    try {
        await clearCartProductsService(cid)
        res.json({ status: 'success', message: 'Se vacio el carrito' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}

export const getPurchase = async (req, res) => {
    const { cid } = req.params
    const user = req.user
    const { method } = req.query

    try {
        const { ticket, unavailableProducts } = await purchaseCart(cid, user)
        
        if (!ticket) {
            return res.status(400).json({ status: 'error', message: 'Imposible realizar la compra', unavailableProducts })
        }

        res.json({ status: 'success', message: 'Compra realizada', ticket })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}