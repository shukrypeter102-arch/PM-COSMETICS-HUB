import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get Cart
router.get('/', authenticate, async (req: any, res) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.userId, sessionId: '' },
        include: { items: { include: { product: true } } },
      });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add to Cart
router.post('/items', authenticate, async (req: any, res) => {
  try {
    const { productId, variantId } = req.body;
    const quantity = Number(req.body.quantity) || 1;
    if (!productId || quantity < 1) {
      return res.status(400).json({ error: 'productId and a positive quantity are required' });
    }

    // Never trust a price sent by the client; read it from the database.
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const price = product.price;

    let cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.userId, sessionId: '' },
      });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId,
          variantId: variantId || '',
        },
      },
      update: { quantity: { increment: quantity } },
      create: {
        cartId: cart.id,
        productId,
        quantity,
        price,
        variantId: variantId || '',
      },
    });

    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Remove from Cart
router.delete('/items/:itemId', authenticate, async (req: any, res) => {
  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: { cart: true },
    });
    if (!item || item.cart.userId !== req.userId) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await prisma.cartItem.delete({
      where: { id: item.id },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

export default router;
