import express from 'express';
import { query, db } from '../db.js';
import { requireAdmin } from '../auth.js';

const router = express.Router();

// Enforce admin authentication for every route in this router
router.use(requireAdmin);

/**
 * GET /api/admin/stats
 * Dashboard overview metrics
 */
router.get('/stats', async (req, res) => {
  try {
    const totalOrdersRes = await query('SELECT COUNT(*) as count FROM orders');
    const newOrdersRes = await query("SELECT COUNT(*) as count FROM orders WHERE status = 'New'");
    const confirmedOrdersRes = await query("SELECT COUNT(*) as count FROM orders WHERE status IN ('Confirmed', 'Preparing')");
    const totalProductsRes = await query('SELECT COUNT(*) as count FROM products');
    const totalCategoriesRes = await query('SELECT COUNT(*) as count FROM categories');

    const recentOrdersRes = await query(
      `SELECT id, order_number, customer_name, shop_name, phone, status, total_items, estimated_total, created_at
       FROM orders
       ORDER BY created_at DESC
       LIMIT 5`
    );

    return res.json({
      success: true,
      stats: {
        totalOrders: totalOrdersRes.rows[0].count,
        newOrders: newOrdersRes.rows[0].count,
        activeOrders: confirmedOrdersRes.rows[0].count,
        totalProducts: totalProductsRes.rows[0].count,
        totalCategories: totalCategoriesRes.rows[0].count,
      },
      recentOrders: recentOrdersRes.rows,
    });
  } catch (error) {
    console.error('[Admin Stats Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
});

/**
 * GET /api/admin/orders
 * Supports: search, status, date_from, date_to, limit, page
 */
router.get('/orders', async (req, res) => {
  try {
    const { search, status, date_from, date_to } = req.query;

    let sql = `
      SELECT o.*,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as distinct_items_count
      FROM orders o
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      sql += ' AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR o.shop_name LIKE ? OR o.phone LIKE ? OR o.city LIKE ?)';
      params.push(term, term, term, term, term);
    }

    if (date_from) {
      sql += ' AND o.created_at >= ?';
      params.push(date_from);
    }

    if (date_to) {
      sql += ' AND o.created_at <= ?';
      params.push(`${date_to} 23:59:59`);
    }

    sql += ' ORDER BY o.created_at DESC';

    const result = await query(sql, params);

    return res.json({
      success: true,
      orders: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('[Admin Orders Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/admin/orders/:id
 * Full single order details with items
 */
router.get('/orders/:id', async (req, res) => {
  try {
    const orderRes = await query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order = orderRes.rows[0];
    const itemsRes = await query(
      `SELECT oi.*, p.image_url, p.sku
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?
       ORDER BY oi.id ASC`,
      [order.id]
    );

    return res.json({
      success: true,
      order: {
        ...order,
        items: itemsRes.rows,
      },
    });
  } catch (error) {
    console.error('[Admin Order Details Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch order details' });
  }
});

/**
 * PATCH /api/admin/orders/:id/status
 * Updates order status: New, Confirmed, Contacted, Preparing, Completed, Cancelled
 */
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['New', 'Confirmed', 'Contacted', 'Preparing', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    await query(
      `UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`,
      [status, req.params.id]
    );

    return res.json({
      success: true,
      message: `Order status updated to "${status}"`,
      status,
    });
  } catch (error) {
    console.error('[Update Order Status Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

/**
 * DELETE /api/admin/orders/:id
 */
router.delete('/orders/:id', async (req, res) => {
  try {
    await query('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
    const result = await query('DELETE FROM orders WHERE id = ?', [req.params.id]);

    return res.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    console.error('[Delete Order Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete order' });
  }
});

/**
 * GET /api/admin/purchasing-summary
 * Product-Wise Purchasing Summary across selected orders
 * Query params:
 *   - order_ids: comma separated ids e.g. "1,2,5"
 *   - statuses: comma separated statuses e.g. "New,Confirmed,Preparing"
 *   - date_from, date_to
 */
router.get('/purchasing-summary', async (req, res) => {
  try {
    const { order_ids, statuses, date_from, date_to } = req.query;

    // 1. First fetch eligible active orders list so the admin can toggle them
    let ordersSql = `SELECT id, order_number, customer_name, shop_name, phone, status, total_items, created_at FROM orders WHERE 1=1`;
    const ordersParams = [];

    // Exclude cancelled by default unless explicitly asked
    if (statuses) {
      const statusList = statuses.split(',').map((s) => s.trim()).filter(Boolean);
      if (statusList.length > 0) {
        ordersSql += ` AND status IN (${statusList.map(() => '?').join(',')})`;
        ordersParams.push(...statusList);
      }
    } else {
      ordersSql += ` AND status != 'Cancelled'`;
    }

    if (date_from) {
      ordersSql += ' AND created_at >= ?';
      ordersParams.push(date_from);
    }
    if (date_to) {
      ordersSql += ' AND created_at <= ?';
      ordersParams.push(`${date_to} 23:59:59`);
    }

    ordersSql += ' ORDER BY created_at DESC';
    const availableOrdersRes = await query(ordersSql, ordersParams);
    const availableOrders = availableOrdersRes.rows;

    // Determine target order IDs to include in calculation
    let targetOrderIds = [];
    if (order_ids) {
      targetOrderIds = order_ids
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));
    } else {
      // Default: include all eligible non-cancelled orders from the filtered list
      targetOrderIds = availableOrders.map((o) => o.id);
    }

    if (targetOrderIds.length === 0) {
      return res.json({
        success: true,
        summary: [],
        availableOrders,
        includedOrderIds: [],
        totalQuantityAll: 0,
        totalItemsCount: 0,
      });
    }

    // 2. Aggregate line items across targeted orders
    const placeholders = targetOrderIds.map(() => '?').join(',');
    const summarySql = `
      SELECT 
        oi.product_name_en,
        oi.product_name_ur,
        COALESCE(oi.variant, '') as variant,
        COALESCE(oi.unit, 'Piece') as unit,
        SUM(oi.quantity) as total_quantity,
        COUNT(DISTINCT o.id) as total_orders_count,
        MAX(p.image_url) as image_url,
        MAX(p.sku) as sku,
        MAX(c.name_en) as category_name_en,
        MAX(c.name_ur) as category_name_ur
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE o.id IN (${placeholders})
      GROUP BY oi.product_name_en, oi.product_name_ur, COALESCE(oi.variant, ''), COALESCE(oi.unit, 'Piece')
      ORDER BY category_name_en ASC, oi.product_name_en ASC, oi.variant ASC
    `;

    const summaryRes = await query(summarySql, targetOrderIds);

    // 3. Get shop/customer breakdown for each item group
    const breakdownSql = `
      SELECT 
        oi.product_name_en,
        COALESCE(oi.variant, '') as variant,
        COALESCE(oi.unit, 'Piece') as unit,
        o.order_number,
        COALESCE(NULLIF(o.shop_name, ''), o.customer_name) as client_name,
        o.city,
        oi.quantity
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.id IN (${placeholders})
      ORDER BY oi.product_name_en ASC, oi.variant ASC, o.created_at ASC
    `;
    const breakdownRes = await query(breakdownSql, targetOrderIds);

    // Group breakdowns by product_name_en + '||' + variant + '||' + unit
    const breakdownMap = {};
    for (const b of breakdownRes.rows) {
      const key = `${b.product_name_en}||${b.variant}||${b.unit}`;
      if (!breakdownMap[key]) {
        breakdownMap[key] = [];
      }
      breakdownMap[key].push({
        order_number: b.order_number,
        client: b.client_name,
        city: b.city,
        quantity: b.quantity,
      });
    }

    let grandTotalQty = 0;
    const summary = summaryRes.rows.map((row) => {
      const key = `${row.product_name_en}||${row.variant}||${row.unit}`;
      grandTotalQty += Number(row.total_quantity);
      return {
        ...row,
        total_quantity: Number(row.total_quantity),
        breakdown: breakdownMap[key] || [],
      };
    });

    return res.json({
      success: true,
      summary,
      availableOrders,
      includedOrderIds: targetOrderIds,
      totalQuantityAll: grandTotalQty,
      totalItemsCount: summary.length,
    });
  } catch (error) {
    console.error('[Purchasing Summary Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate purchasing summary' });
  }
});

/**
 * PRODUCTS CRUD
 */
router.get('/products', async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, c.name_en as category_name_en, c.name_ur as category_name_ur
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.id DESC`
    );

    const products = result.rows.map((row) => {
      let variants = [];
      try {
        variants = row.variants_json ? JSON.parse(row.variants_json) : [];
      } catch (e) {
        variants = [];
      }
      return { ...row, variants };
    });

    return res.json({ success: true, products });
  } catch (error) {
    console.error('[Admin Products Get Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const {
      category_id,
      sku = '',
      name_en,
      name_ur,
      description_en = '',
      description_ur = '',
      image_url = '',
      price = 0,
      is_price_on_request = 0,
      unit = 'Piece',
      variants = [],
      is_available = 1,
      is_featured = 0,
    } = req.body;

    if (!name_en || !name_ur) {
      return res.status(400).json({ success: false, error: 'Product name in both English and Urdu is required' });
    }

    const variantsJson = Array.isArray(variants) ? JSON.stringify(variants) : (typeof variants === 'string' ? variants : '[]');

    const result = await query(
      `INSERT INTO products (
        category_id, sku, name_en, name_ur, description_en, description_ur,
        image_url, price, is_price_on_request, unit, variants_json, is_available, is_featured,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      RETURNING *`,
      [
        category_id || null,
        sku,
        name_en.trim(),
        name_ur.trim(),
        description_en,
        description_ur,
        image_url,
        parseFloat(price) || 0,
        is_price_on_request ? 1 : 0,
        unit,
        variantsJson,
        is_available ? 1 : 0,
        is_featured ? 1 : 0,
      ]
    );

    return res.status(201).json({ success: true, product: result.rows[0] });
  } catch (error) {
    console.error('[Create Product Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to create product' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const {
      category_id,
      sku = '',
      name_en,
      name_ur,
      description_en = '',
      description_ur = '',
      image_url = '',
      price = 0,
      is_price_on_request = 0,
      unit = 'Piece',
      variants = [],
      is_available = 1,
      is_featured = 0,
    } = req.body;

    if (!name_en || !name_ur) {
      return res.status(400).json({ success: false, error: 'Product name in both English and Urdu is required' });
    }

    const variantsJson = Array.isArray(variants) ? JSON.stringify(variants) : (typeof variants === 'string' ? variants : '[]');

    await query(
      `UPDATE products SET
        category_id = ?,
        sku = ?,
        name_en = ?,
        name_ur = ?,
        description_en = ?,
        description_ur = ?,
        image_url = ?,
        price = ?,
        is_price_on_request = ?,
        unit = ?,
        variants_json = ?,
        is_available = ?,
        is_featured = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [
        category_id || null,
        sku,
        name_en.trim(),
        name_ur.trim(),
        description_en,
        description_ur,
        image_url,
        parseFloat(price) || 0,
        is_price_on_request ? 1 : 0,
        unit,
        variantsJson,
        is_available ? 1 : 0,
        is_featured ? 1 : 0,
        req.params.id,
      ]
    );

    return res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('[Update Product Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await query('DELETE FROM products WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('[Delete Product Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
});

/**
 * CATEGORIES CRUD
 */
router.get('/categories', async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
       FROM categories c
       ORDER BY display_order ASC, name_en ASC`
    );
    return res.json({ success: true, categories: result.rows });
  } catch (error) {
    console.error('[Admin Categories Get Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { slug, name_en, name_ur, description_en = '', description_ur = '', icon = 'Layers', display_order = 0 } = req.body;

    if (!name_en || !name_ur) {
      return res.status(400).json({ success: false, error: 'Category name in English and Urdu is required' });
    }

    const safeSlug = (slug || name_en).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const result = await query(
      `INSERT INTO categories (slug, name_en, name_ur, description_en, description_ur, icon, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
      [safeSlug, name_en.trim(), name_ur.trim(), description_en, description_ur, icon, display_order || 0]
    );

    return res.status(201).json({ success: true, category: result.rows[0] });
  } catch (error) {
    console.error('[Create Category Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to create category' });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const { slug, name_en, name_ur, description_en = '', description_ur = '', icon = 'Layers', display_order = 0, is_active = 1 } = req.body;

    if (!name_en || !name_ur) {
      return res.status(400).json({ success: false, error: 'Category name in English and Urdu is required' });
    }

    const safeSlug = (slug || name_en).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    await query(
      `UPDATE categories SET
        slug = ?,
        name_en = ?,
        name_ur = ?,
        description_en = ?,
        description_ur = ?,
        icon = ?,
        display_order = ?,
        is_active = ?
       WHERE id = ?`,
      [safeSlug, name_en.trim(), name_ur.trim(), description_en, description_ur, icon, display_order || 0, is_active ? 1 : 0, req.params.id]
    );

    return res.json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    console.error('[Update Category Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to update category' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('[Delete Category Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete category' });
  }
});

/**
 * SITE SETTINGS
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
    console.error('[Admin Settings Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const settings = req.body; // Key-value object
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid settings payload' });
    }

    for (const [key, value] of Object.entries(settings)) {
      await query(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
        [key, String(value ?? '')]
      );
    }

    return res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('[Update Settings Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to save settings' });
  }
});

export default router;
