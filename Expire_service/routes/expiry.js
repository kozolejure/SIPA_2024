const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @swagger
 * /users/{id}/items/expiring:
 *   get:
 *     summary: Get items expiring in less than one week
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
 *         description: List of items expiring in less than one week
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   manufacturer:
 *                     type: string
 *                   warrantyExpiryDate:
 *                     type: string
 *                     format: date
 *                   productImage:
 *                     type: string
 *                   receiptImage:
 *                     type: string
 *                   notes:
 *                     type: string
 *                   daysUntilExpiry:
 *                     type: integer
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/users/:id/items/expiring', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const currentDate = new Date();
    const itemsExpiringSoon = user.items
      .map(item => {
        const expiryDate = new Date(item.warrantyExpiryDate);
        const timeDiff = expiryDate - currentDate;
        const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return {
          ...item.toObject(),
          daysUntilExpiry
        };
      })
      .filter(item => item.daysUntilExpiry > 0 && item.daysUntilExpiry <= 7);

    res.status(200).send(itemsExpiringSoon);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
