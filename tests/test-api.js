async function runTests() {
  const baseUrl = 'http://localhost:5000';
  console.log('Testing Kashif Sanitary Supplies API at:', baseUrl);

  // 1. Health
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const health = await healthRes.json();
  console.log('1. Health Check:', health);

  // 2. Products
  const prodRes = await fetch(`${baseUrl}/api/public/products`);
  const prodData = await prodRes.json();
  console.log(`2. Public Products loaded: ${prodData.products.length} products`);

  const pprcElbow = prodData.products.find(p => p.sku === 'PPR-ELB-90') || prodData.products[0];
  const pprcSocket = prodData.products.find(p => p.sku === 'PPR-SOC-01') || prodData.products[1];

  // 3. Order 1 (Shop 1: Al-Madina Hardware - 100 L-bows, 50 sockets)
  console.log('\n3. Placing Order 1 from Shop 1 (Al-Madina Hardware)...');
  const order1Res = await fetch(`${baseUrl}/api/public/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'Muhammad Tariq',
      shop_name: 'Al-Madina Hardware',
      phone: '03001234567',
      city: 'Lahore',
      address: 'Shop # 12, Sanitary Wholesale Market, Lahore',
      notes: 'Please dispatch via Faisal Movers Cargo early morning',
      items: [
        {
          product_id: pprcElbow.id,
          product_name_en: pprcElbow.name_en,
          product_name_ur: pprcElbow.name_ur,
          variant: '1/2 inch (20mm)',
          unit: 'Piece',
          quantity: 100,
          unit_price: pprcElbow.price,
          is_price_on_request: 0,
        },
        {
          product_id: pprcSocket.id,
          product_name_en: pprcSocket.name_en,
          product_name_ur: pprcSocket.name_ur,
          variant: '1/2 inch (20mm)',
          unit: 'Piece',
          quantity: 50,
          unit_price: pprcSocket.price,
          is_price_on_request: 0,
        },
      ],
    }),
  });
  const order1 = await order1Res.json();
  console.log(`   Order 1 Placed! Order #: ${order1.order.order_number}, Items: ${order1.order.total_items}`);

  // 4. Order 2 (Shop 2: Bismillah Sanitary Store - 200 L-bows, 200 sockets)
  console.log('\n4. Placing Order 2 from Shop 2 (Bismillah Sanitary Store)...');
  const order2Res = await fetch(`${baseUrl}/api/public/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'Haji Aslam',
      shop_name: 'Bismillah Sanitary Store',
      phone: '03219876543',
      city: 'Faisalabad',
      address: 'Shop # 45, Main Sanitary Bazar, Faisalabad',
      notes: 'Urgent cargo requirement',
      items: [
        {
          product_id: pprcElbow.id,
          product_name_en: pprcElbow.name_en,
          product_name_ur: pprcElbow.name_ur,
          variant: '1/2 inch (20mm)',
          unit: 'Piece',
          quantity: 200,
          unit_price: pprcElbow.price,
          is_price_on_request: 0,
        },
        {
          product_id: pprcSocket.id,
          product_name_en: pprcSocket.name_en,
          product_name_ur: pprcSocket.name_ur,
          variant: '1/2 inch (20mm)',
          unit: 'Piece',
          quantity: 200,
          unit_price: pprcSocket.price,
          is_price_on_request: 0,
        },
      ],
    }),
  });
  const order2 = await order2Res.json();
  console.log(`   Order 2 Placed! Order #: ${order2.order.order_number}, Items: ${order2.order.total_items}`);

  // 5. Admin Login
  console.log('\n5. Admin Login with kashif_owner...');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'kashif_owner',
      password: 'KashifSanitary2026!',
    }),
  });
  const loginData = await loginRes.json();
  console.log(`   Admin Login: success=${loginData.success}, user=${loginData.user?.username}`);

  const token = loginData.token;

  // 6. Test Purchasing Summary Aggregation!
  console.log('\n6. Fetching Product-Wise Purchasing Summary...');
  const summaryRes = await fetch(`${baseUrl}/api/admin/purchasing-summary`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const summaryData = await summaryRes.json();

  console.log('========================================================');
  console.log('   PRODUCT-WISE PURCHASING SUMMARY RESULTS');
  console.log('========================================================');
  for (const item of summaryData.summary) {
    console.log(`* ${item.product_name_en} (${item.variant}) [${item.unit}]`);
    console.log(`  -> TOTAL QUANTITY: ${item.total_quantity}`);
    console.log(`  -> Breakdown:`, item.breakdown.map(b => `${b.client}: ${b.quantity} pcs`).join(', '));
  }
  console.log('--------------------------------------------------------');
  console.log(`GRAND TOTAL REQUIRED QUANTITY: ${summaryData.totalQuantityAll}`);
  console.log(`TOTAL ORDERS INCLUDED: ${summaryData.includedOrderIds.length}`);
  console.log('========================================================\n');
}

runTests().catch(console.error);
