import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth';
import { getJwtSecret, jwtExpiresIn } from '../config';

// Roles a user may pick when self-registering. ADMIN must be granted manually.
const SELF_REGISTER_ROLES = ['CUSTOMER', 'SELLER'];

function withoutPassword<T extends { password?: string }>(user: T) {
  const { password: _password, ...safe } = user;
  return safe;
}

const router = Router();
const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, phone, password, firstName, lastName, role = 'CUSTOMER' } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'email, password, firstName and lastName are required' });
    }
    if (!SELF_REGISTER_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: phone ? [{ email }, { phone }] : [{ email }] },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      getJwtSecret(),
      { expiresIn: jwtExpiresIn }
    );

    res.status(201).json({ user: withoutPassword(user), token });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      getJwtSecret(),
      { expiresIn: jwtExpiresIn }
    );

    res.json({ user: withoutPassword(user), token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get Current User
router.get('/me', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
