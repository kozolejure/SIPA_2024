const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');

// Nastavitev multerja za shranjevanje slik
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

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
    res.status(500).send({ message: 'Internal server error', error: err.message });
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
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err.message });
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
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send(user.items);
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err.message });
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
 *       multipart/form-data:
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             manufacturer:
 *               type: string
 *             warrantyExpiryDate:
 *               type: string
 *               format: date
 *             productImage:
 *               type: string
 *               format: binary
 *             receiptImage:
 *               type: string
 *               format: binary
 *             notes:
 *               type: string
 *     responses:
 *       201:
 *         description: Item added successfully
 *       500:
 *         description: Internal server error
 */
router.post('/users/:id/items', upload.fields([{ name: 'productImage', maxCount: 1 }, { name: 'receiptImage', maxCount: 1 }]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const item = {
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      warrantyExpiryDate: req.body.warrantyExpiryDate,
      productImage: req.files['productImage'] ? req.files['productImage'][0].path : null,
      receiptImage: req.files['receiptImage'] ? req.files['receiptImage'][0].path : null,
      notes: req.body.notes
    };

    user.items.push(item);
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err.message });
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
      return res.status(404).send({ message: 'User not found' });
    }

    const item = user.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).send({ message: 'Item not found' });
    }

    user.items.pull(req.params.itemId);
    await user.save();
    res.status(200).send({ message: 'Item deleted successfully', user });
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err.message });
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
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err.message });
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               warrantyExpiryDate:
 *                 type: string
 *                 format: date
 *               productImage:
 *                 type: string
 *                 format: binary
 *               receiptImage:
 *                 type: string
 *                 format: binary
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal server error
 */
router.put('/users/:id/items/:itemId', upload.fields([{ name: 'productImage', maxCount: 1 }, { name: 'receiptImage', maxCount: 1 }]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const item = user.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).send({ message: 'Item not found' });
    }

    // Posodobi polja elementa
    item.name = req.body.name || item.name;
    item.manufacturer = req.body.manufacturer || item.manufacturer;
    item.warrantyExpiryDate = req.body.warrantyExpiryDate || item.warrantyExpiryDate;
    item.productImage = req.files['productImage'] ? req.files['productImage'][0].path : item.productImage;
    item.receiptImage = req.files['receiptImage'] ? req.files['receiptImage'][0].path : item.receiptImage;
    item.notes = req.body.notes || item.notes;

    await user.save();
    res.status(200).send(item);
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err.message });
  }
});

module.exports = router;
