const express = require("express");
const router = express.Router();
const User = require("../models/User");
const multer = require("multer");
const authenticateToken = require("./authMiddleware");

// Konfiguracija multer za shranjevanje datotek v mapo "uploads"
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
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
router.post("/users", authenticateToken, async (req, res) => {
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
router.get("/users/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
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
router.get("/users/:id/items", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
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
 *     summary: Dodaj nov predmet uporabniku
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID uporabnika
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
 *       201:
 *         description: Predmet uspešno dodan
 *       404:
 *         description: Uporabnik ni najden
 *       500:
 *         description: Notranja napaka strežnika
 */
router.post(
  "/users/:id/items",
  authenticateToken,
  upload.fields([
    { name: "productImage", maxCount: 1 },
    { name: "receiptImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).send("User not found");
      }

      const item = {
        name: req.body.name,
        manufacturer: req.body.manufacturer,
        warrantyExpiryDate: req.body.warrantyExpiryDate,
        productImage: req.files["productImage"]
          ? req.files["productImage"][0].path
          : null,
        receiptImage: req.files["receiptImage"]
          ? req.files["receiptImage"][0].path
          : null,
        notes: req.body.notes,
      };

      user.items.push(item);
      await user.save();
      res.status(201).send(user);
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

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
router.delete(
  "/users/:id/items/:itemId",
  authenticateToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        console.error("User not found:", req.params.id);
        return res.status(404).send("User not found");
      }

      const item = user.items.id(req.params.itemId);
      if (!item) {
        console.error("Item not found:", req.params.itemId);
        return res.status(404).send("Item not found");
      }

      user.items.pull(req.params.itemId);
      await user.save();
      res.status(200).send({ message: "Item deleted successfully", user });
    } catch (err) {
      console.error("Error deleting item:", err);
      res
        .status(500)
        .send({ message: "Internal server error", error: err.message });
    }
  }
);

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
router.put("/users/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).send("User not found");
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/users/:id/items/:itemId",
  authenticateToken,
  upload.fields([
    { name: "productImage", maxCount: 1 },
    { name: "receiptImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).send("User not found");
      }

      const item = user.items.id(req.params.itemId);
      if (!item) {
        return res.status(404).send("Item not found");
      }

      // Posodobitev polj predmeta
      item.name = req.body.name || item.name;
      item.manufacturer = req.body.manufacturer || item.manufacturer;
      item.warrantyExpiryDate =
        req.body.warrantyExpiryDate || item.warrantyExpiryDate;
      item.notes = req.body.notes || item.notes;

      if (req.files["productImage"]) {
        item.productImage = req.files["productImage"][0].path;
      }

      if (req.files["receiptImage"]) {
        item.receiptImage = req.files["receiptImage"][0].path;
      }

      await user.save();
      res.status(200).send(item);
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

/**
 * @swagger
 * /users/{id}/sync:
 *   post:
 *     summary: Sync user data
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
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Item'
 *     responses:
 *       200:
 *         description: Sync successful
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/users/:id/sync", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const products = req.body;

    // Pridobi uporabnika iz baze
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Posodobi izdelke glede na prejete podatke
    user.items = products;

    // Shranjevanje posodobljenega uporabnika v bazo
    await user.save();
    res.status(200).send("Sync successful");
  } catch (err) {
    console.error("Error syncing data:", err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
