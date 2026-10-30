import express from 'express';
import crypto from 'crypto';
import { query, db } from '../db.js';

const router = express.Router();

function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomInt(1000, 9999);
  return `KSS-${dateStr}-${randomSuffix}`;
}

/**
 * GET /api/public/settings
 * Returns public website settings dictionary
 */
router.get('/settings', async (req, res) => {
  try {
    const result = await query('SELECT key, value FROM site_settings');
    const settings = {};
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }
    return res.json({ success: true, settings });
  } catch (error) {
    console.error('[Public Settings Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

/**
 * GET /api/public/categories
 * Returns active categories
 */
router.get('/categories', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, slug, name_en, name_ur, description_en, description_ur, icon, display_order
       FROM categories
       WHERE is_active = 1
       ORDER BY display_order ASC, name_en ASC`
    );
    return res.json({ success: true, categories: result.rows });
  } catch (error) {
    console.error('[Public Categories Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

/**
 * GET /api/public/products
 * Query params: category (slug or id), search, featured
 */
router.get('/products', async (req, res) => {
  try {
    const { category, search, featured } = req.query;

    let sql = `
      SELECT p.*, c.name_en as category_name_en, c.name_ur as category_name_ur, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      if (!isNaN(category)) {
        sql += ' AND p.category_id = ?';
        params.push(Number(category));
      } else {
        sql += ' AND c.slug = ?';
        params.push(category);
      }
    }

    if (featured === '1' || featured === 'true') {
      sql += ' AND p.is_featured = 1';
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      sql += ' AND (p.name_en LIKE ? OR p.name_ur LIKE ? OR p.description_en LIKE ? OR p.description_ur LIKE ? OR p.sku LIKE ?)';
      params.push(term, term, term, term, term);
    }

    sql += ' ORDER BY p.is_featured DESC, p.created_at DESC';

    const result = await query(sql, params);

    // Parse variants_json safely
    const products = result.rows.map((row) => {
      let variants = [];
      try {
        variants = row.variants_json ? JSON.parse(row.variants_json) : [];
      } catch (e) {
        variants = [];
      }
      return {
        ...row,
        variants,
      };
    });

    return res.json({ success: true, products });
  } catch (error) {
    console.error('[Public Products Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

/**
 * GET /api/public/products/:id
 */
router.get('/products/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, c.name_en as category_name_en, c.name_ur as category_name_ur, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const row = result.rows[0];
    let variants = [];
    try {
      variants = row.variants_json ? JSON.parse(row.variants_json) : [];
    } catch (e) {
      variants = [];
    }

    return res.json({
      success: true,
      product: { ...row, variants },
    });
  } catch (error) {
    console.error('[Public Product Detail Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
});

/**
 * POST /api/public/orders
 * Body: {
 *   customer_name,
 *   shop_name,
 *   phone,
 *   city,
 *   address,
 *   notes,
 *   items: [ { product_id, product_name_en, product_name_ur, variant, unit, quantity, unit_price, is_price_on_request } ]
 * }
 */
router.post('/orders', async (req, res) => {
  try {
    const {
      customer_name,
      shop_name = '',
      phone,
      city,
      address,
      notes = '',
      items,
    } = req.body;

    // Validate customer fields
    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ success: false, error: 'Customer name is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, error: 'City or area is required' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, error: 'Full address is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must contain at least one product item',
      });
    }

    // Clean and calculate items
    let totalItems = 0;
    let estimatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid quantity for item "${item.product_name_en || 'Product'}"`,
        });
      }

      const unitPrice = parseFloat(item.unit_price) || 0;
      const isPriceOnRequest = item.is_price_on_request ? 1 : 0;
      const lineTotal = isPriceOnRequest ? 0 : unitPrice * qty;

      totalItems += qty;
      estimatedTotal += lineTotal;

      validatedItems.push({
        product_id: item.product_id || null,
        product_name_en: item.product_name_en || 'Item',
        product_name_ur: item.product_name_ur || 'آئٹم',
        variant: item.variant || '',
        unit: item.unit || 'Piece',
        quantity: qty,
        unit_price: unitPrice,
        is_price_on_request: isPriceOnRequest,
        line_total: lineTotal,
      });
    }

    const orderNumber = generateOrderNumber();

    // Insert order
    const orderResult = await query(
      `INSERT INTO orders (
        order_number, customer_name, shop_name, phone, city, address, notes,
        status, total_items, estimated_total, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'New', ?, ?, datetime('now'), datetime('now'))
      RETURNING id, order_number, customer_name, shop_name, phone, city, address, notes, status, total_items, estimated_total, created_at`,
      [
        orderNumber,
        customer_name.trim(),
        shop_name.trim(),
        phone.trim(),
        city.trim(),
        address.trim(),
        notes.trim(),
        totalItems,
        estimatedTotal,
      ]
    );

    const createdOrder = orderResult.rows[0];
    const orderId = createdOrder.id;

    // Insert order items
    for (const item of validatedItems) {
      await query(
        `INSERT INTO order_items (
          order_id, product_id, product_name_en, product_name_ur, variant, unit,
          quantity, unit_price, is_price_on_request, line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.product_name_en,
          item.product_name_ur,
          item.variant,
          item.unit,
          item.quantity,
          item.unit_price,
          item.is_price_on_request,
          item.line_total,
        ]
      );
    }

    console.log(`[Order Created] Order #${orderNumber} received for ${customer_name} (${shop_name || 'Individual'})`);

    return res.status(201).json({
      success: true,
      order: {
        ...createdOrder,
        items: validatedItems,
      },
    });
  } catch (error) {
    console.error('[Create Order Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to submit order. Please try again.' });
  }
});

export default router;
