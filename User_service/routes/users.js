const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - _id
 *         - firstName
 *         - lastName
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Item'
 *     Item:
 *       type: object
 *       required:
 *         - name
 *         - manufacturer
 *         - warrantyExpiryDate
 *       properties:
 *         name:
 *           type: string
 *         manufacturer:
 *           type: string
 *         warrantyExpiryDate:
 *           type: string
 *           format: date
 *         productImage:
 *           type: string
 *         receiptImage:
 *           type: string
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       500:
 *         description: Internal server error
 */
router.post('/users', async (req, res) => {
  try {
    const { _id, firstName, lastName, email } = req.body;
    const user = new User({ _id, firstName, lastName, email, items: [] });
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * @swagger
 * /users/{id}/items:
 *   get:
 *     summary: Get items by user ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/users/:id/items', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).send(user.items);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * @swagger
 * /users/{id}/items:
 *   post:
 *     summary: Add an item to a user
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       201:
 *         description: Item added successfully
 *       500:
 *         description: Internal server error
 */
router.post('/users/:id/items', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const item = {
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      warrantyExpiryDate: req.body.warrantyExpiryDate,
      productImage: req.body.productImage,
      receiptImage: req.body.receiptImage,
      notes: req.body.notes
    };

    user.items.push(item);
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * @swagger
 * /users/{id}/items/{itemId}:
 *   delete:
 *     summary: Delete an item from a user
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *       - in: path
 *         name: itemId
 *         schema:
 *           type: string
 *         required: true
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       404:
 *         description: User or item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/users/:id/items/:itemId', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const item = user.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).send('Item not found');
    }

    item.remove();
    await user.save();
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});


/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});


/**
 * @swagger
 * /users/{id}/items/{itemId}:
 *   put:
 *     summary: Update an item of a user
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *       - in: path
 *         name: itemId
 *         schema:
 *           type: string
 *         required: true
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal server error
 */
router.put('/users/:id/items/:itemId', upload.array('images', 2), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const item = user.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).send('Item not found');
    }

    // Update item fields
    item.name = req.body.name || item.name;
    item.manufacturer = req.body.manufacturer || item.manufacturer;
    item.warrantyExpiryDate = req.body.warrantyExpiryDate || item.warrantyExpiryDate;
    item.productImage = req.body.productImage
    item.receiptImage = req.body.receiptImage
    item.notes = req.body.notes || item.notes;

    await user.save();
    res.status(200).send(item);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
