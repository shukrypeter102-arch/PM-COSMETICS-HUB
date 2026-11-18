import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Create Order
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { items, shippingAddressId, billingAddressId, notes, orderType = 'RETAIL' } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // Calculate totals
    let subtotal = 0;
    let storeId: string | null = null;
    const orderItems: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: `Invalid quantity for product ${item.productId}` });
      }
      storeId = storeId ?? product.storeId;

      const price = orderType === 'WHOLESALE' ? product.wholesalePrice || product.price : product.price;
      const itemTotal = price * quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity,
        price,
        total: itemTotal,
      });
    }

    const tax = subtotal * 0.15; // 15% VAT
    const shippingCost = subtotal > 500 ? 0 : 30; // Free shipping over 500
    const total = subtotal + tax + shippingCost;

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        userId: req.userId,
        storeId,
        subtotal,
        tax,
        shippingCost,
        total,
        orderType,
        items: {
          create: orderItems,
        },
        notes,
        shippingAddressId,
        billingAddressId,
      },
      include: { items: true },
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get User Orders
router.get('/', authenticate, async (req: any, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get Order Details
router.get('/:orderId', authenticate, async (req: any, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: {
        items: { include: { product: true } },
        payment: true,
        shipment: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update Order Status (Admin/Seller Only)
router.patch('/:orderId/status', authenticate, authorize(['ADMIN', 'SELLER']), async (req: any, res) => {
  try {
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.orderId },
      data: { status },
      include: { items: true },
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;
