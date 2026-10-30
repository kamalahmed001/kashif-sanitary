import { query } from './db.js';
import { initSchema } from './schema.js';

export async function seedDefaults() {
  await initSchema();

  console.log('[Seed] Checking default site settings...');
  const settingsCheck = await query('SELECT COUNT(*) as count FROM site_settings');
  const hasSettings = settingsCheck.rows[0].count > 0;

  if (!hasSettings) {
    console.log('[Seed] Populating default website settings...');
    const defaultSettings = [
      ['business_name_en', 'Kashif Sanitary Supplies'],
      ['business_name_ur', 'کاشف سینیٹری سپلائیز'],
      ['tagline_en', 'Quality Products. Reliable Supply.'],
      ['tagline_ur', 'اعلیٰ معیار کی مصنوعات، قابل اعتماد سپلائی'],
      ['phone', '+92 300 1234567 [Placeholder - Update in Admin]'],
      ['whatsapp', '+92 300 1234567 [Placeholder - Update in Admin]'],
      ['email', 'sales@kashifsanitary.com [Placeholder - Update in Admin]'],
      ['address_en', 'Shop # 18-A, Sanitary Market, Main Boulevard, Lahore, Pakistan [Placeholder - Update in Admin]'],
      ['address_ur', 'دکان نمبر 18-اے، سینیٹری ہول سیل مارکیٹ، مین بلیوارڈ، لاہور، پاکستان [عارضی پتہ]'],
      ['hero_title_en', 'Wholesale Sanitary Ware, Pipes & Bathroom Fittings'],
      ['hero_title_ur', 'ہول سیل سینیٹری ویئر، پائپ اور باتھ روم فٹنگز'],
      ['hero_desc_en', 'Direct supplier of premium PPRC, PVC, CPVC pipes, brass fittings, luxury faucets, and modern bathroom sanitary ware for retailers, plumbers, and contractors.'],
      ['hero_desc_ur', 'ریٹیلرز، پلمبروں اور کنٹریکٹرز کے لیے پائیدار پی پی آر سی، پی وی سی پائپس، براس فٹنگز، جدید مکسر نلکے اور پرتعیش باتھ روم سینیٹری کا قابل اعتماد سپلائر۔'],
      ['delivery_info_en', 'Fast cargo booking and dispatch available for all cities across Pakistan.'],
      ['delivery_info_ur', 'پاکستان کے تمام شہروں میں فوری کارگو اور ترسیل کی سہولت دستیاب ہے۔'],
    ];

    for (const [key, value] of defaultSettings) {
      await query(
        `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO NOTHING`,
        [key, value]
      );
    }
  }

  console.log('[Seed] Checking default categories...');
  const catCheck = await query('SELECT COUNT(*) as count FROM categories');
  if (catCheck.rows[0].count === 0) {
    console.log('[Seed] Populating default categories...');
    const defaultCategories = [
      {
        slug: 'pipes-fittings',
        name_en: 'Pipes & Fittings',
        name_ur: 'پائپ اور فٹنگز',
        description_en: 'PPRC, PVC, and CPVC high pressure pipes, elbows, tees, sockets, and brass threaded fittings.',
        description_ur: 'پی پی آر سی، پی وی سی پائپ، ایلبو، ٹی، ساکٹ اور پیتل والی چوڑی دار فٹنگز۔',
        icon: 'Pipette',
        display_order: 1,
      },
      {
        slug: 'faucets-taps',
        name_en: 'Faucets & Taps',
        name_ur: 'نلکے اور مکسر',
        description_en: 'High quality brass basin mixers, wall shower mixers, bib cocks, and Muslim showers.',
        description_ur: 'اعلیٰ پالش براس واش بیسن مکسر، وال شاور مکسر، بب کاک اور مسلم شاور سیٹ۔',
        icon: 'Droplet',
        display_order: 2,
      },
      {
        slug: 'bathroom-accessories',
        name_en: 'Bathroom Accessories',
        name_ur: 'باتھ روم لوازمات',
        description_en: 'Stainless steel towel rails, soap dispensers, mirrors, corner racks, and anti-odor floor drains.',
        description_ur: 'سٹین لیس سٹیل تولیہ راڈ، شیمپو ریک، صابن دانی، اور بدبو سے محفوظ فرش جالیاں۔',
        icon: 'Sparkles',
        display_order: 3,
      },
      {
        slug: 'sanitary-ware',
        name_en: 'Sanitary Ware',
        name_ur: 'سینیٹری ویئر',
        description_en: 'Ceramic one-piece commodes, wall hung closets, designer vanity basins, and pedestals.',
        description_ur: 'پرتعیش سیرامک ون پیس کموڈ، وال ہینگ کموڈ، کاؤنٹر ٹاپ بیسن اور پیڈسٹل واش بیسن۔',
        icon: 'Bath',
        display_order: 4,
      },
      {
        slug: 'valves-connections',
        name_en: 'Valves & Connections',
        name_ur: 'والوز اور کنکشنز',
        description_en: 'Heavy brass ball valves, angle valves, stainless steel braided connection pipes, and waste couplings.',
        description_ur: 'ہیوی ڈیوٹی براس بال والو، اینگل والو، پاپ اپ ویسٹ کپلنگ اور لچکدار کنکشن پائپ۔',
        icon: 'Gauge',
        display_order: 5,
      },
    ];

    for (const cat of defaultCategories) {
      await query(
        `INSERT INTO categories (slug, name_en, name_ur, description_en, description_ur, icon, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [cat.slug, cat.name_en, cat.name_ur, cat.description_en, cat.description_ur, cat.icon, cat.display_order]
      );
    }
  }

  console.log('[Seed] Checking default products...');
  const prodCheck = await query('SELECT COUNT(*) as count FROM products');
  if (prodCheck.rows[0].count === 0) {
    console.log('[Seed] Populating initial sample products...');

    // Fetch category IDs
    const cats = await query('SELECT id, slug FROM categories');
    const catMap = {};
    for (const row of cats.rows) {
      catMap[row.slug] = row.id;
    }

    const defaultProducts = [
      // Pipes & Fittings
      {
        category_id: catMap['pipes-fittings'],
        sku: 'PPR-ELB-90',
        name_en: 'PPRC 90° Elbow (L-Bow)',
        name_ur: 'پی پی آر سی 90 ڈگری ایلبو (ایل بو)',
        description_en: 'Heavy duty hot & cold water PPRC elbow with smooth inner surface to prevent pressure drop.',
        description_ur: 'گرم اور ٹھنڈے پانی کے لیے ہیوی ڈیوٹی پی پی آر سی 90 ڈگری ایل بو فٹنگ۔',
        image_url: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80',
        price: 45,
        is_price_on_request: 0,
        unit: 'Piece',
        variants_json: JSON.stringify(['1/2 inch (20mm)', '3/4 inch (25mm)', '1 inch (32mm)', '1-1/4 inch (40mm)', '1-1/2 inch (50mm)', '2 inch (63mm)']),
        is_available: 1,
        is_featured: 1,
      },
      {
        category_id: catMap['pipes-fittings'],
        sku: 'PPR-SOC-01',
        name_en: 'PPRC Socket (Coupler)',
        name_ur: 'پی پی آر سی ساکٹ (جوڑ)',
        description_en: 'Precision molded PPRC straight joining socket, PN25 pressure rated for leak-free welding.',
        description_ur: 'پی پی آر سی اسٹریٹ کپلر ساکٹ، اعلیٰ پریشر ریٹنگ، مضبوط اور دیرپا ویلڈنگ کے لیے۔',
        image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        price: 35,
        is_price_on_request: 0,
        unit: 'Piece',
        variants_json: JSON.stringify(['1/2 inch (20mm)', '3/4 inch (25mm)', '1 inch (32mm)', '1-1/4 inch (40mm)', '1-1/2 inch (50mm)', '2 inch (63mm)']),
        is_available: 1,
        is_featured: 1,
      },
      {
        category_id: catMap['pipes-fittings'],
        sku: 'PPR-TEE-01',
        name_en: 'PPRC Equal Tee',
        name_ur: 'پی پی آر سی ایکول ٹی',
        description_en: 'Standard 3-way equal distribution tee fitting for potable water supply systems.',
        description_ur: 'تین طرفہ پانی کی تقسیم کے لیے معیاری پی پی آر سی ٹی۔',
        image_url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=600&q=80',
        price: 65,
        is_price_on_request: 0,
        unit: 'Piece',
        variants_json: JSON.stringify(['1/2 inch (20mm)', '3/4 inch (25mm)', '1 inch (32mm)', '1-1/4 inch (40mm)', '2 inch (63mm)']),
        is_available: 1,
        is_featured: 0,
      },
      {
        category_id: catMap['pipes-fittings'],
        sku: 'PVC-PIP-SND',
        name_en: 'uPVC Waste & Drainage Pipe',
        name_ur: 'یو پی وی سی نکاسی آب پائپ (سیوریج)',
        description_en: 'High impact uPVC pipe for soil, waste, and rainwater drainage. Chemical resistant and UV protected.',
        description_ur: 'گھریلو اور کمرشل نکاسی آب کے لیے پائیدار یو پی وی سی پائپ۔ 10 اور 13 فٹ لمبائی میں دستیاب۔',
        image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
        price: 0,
        is_price_on_request: 1,
        unit: 'Length (13 ft)',
        variants_json: JSON.stringify(['2 inch (50mm)', '3 inch (75mm)', '4 inch (110mm)', '6 inch (160mm)']),
        is_available: 1,
        is_featured: 1,
      },
      {
        category_id: catMap['pipes-fittings'],
        sku: 'PPR-FTS-01',
        name_en: 'PPRC Female Threaded Brass Socket',
        name_ur: 'پی پی آر سی فیمیل تھریڈڈ براس ساکٹ (چوڑی ساکٹ)',
        description_en: 'Heavy forged brass insert bonded with virgin PPRC for connecting taps, mixers, and valves.',
        description_ur: 'نلکوں اور مکسرز کے کنکشن کے لیے ہیوی براس چوڑی والا پی پی آر سی ساکٹ۔',
        image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
        price: 185,
        is_price_on_request: 0,
        unit: 'Piece',
        variants_json: JSON.stringify(['1/2" x 1/2"', '3/4" x 1/2"', '3/4" x 3/4"', '1" x 1"']),
        is_available: 1,
        is_featured: 0,
      },

      // Faucets & Taps
      {
        category_id: catMap['faucets-taps'],
        sku: 'MIX-BAS-CHR',
        name_en: 'Single Lever Basin Mixer (Chrome Finish)',
        name_ur: 'سنگل لیور بیسن مکسر (کروم فنش)',
        description_en: 'Solid brass body with ceramic disc cartridge, multi-layer mirror chrome finish, includes hot & cold braided pipes.',
        description_ur: 'خالص پیتل سے تیار کردہ واش بیسن مکسر، ہموار ہینڈل، کروم چمکدار فنش۔',
        image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        price: 4850,
        is_price_on_request: 0,
        unit: 'Piece',
        variants_json: JSON.stringify(['Chrome Plated', 'Matte Black', 'Brushed Gold']),
        is_available: 1,
        is_featured: 1,
      },
      {
        category_id: catMap['faucets-taps'],
        sku: 'MIX-WAL-SHW',
        name_en: 'Wall Mounted Bath Shower Mixer',
        name_ur: 'وال ماؤنٹڈ باتھ شاور مکسر',
        description_en: 'Dual outlet wall mixer with telephone shower hook and brass diverter mechanism for hot and cold control.',
        description_ur: 'دیوار پر لگنے والا ڈبل باتھ شاور مکسر، ہینڈ شاور اور ٹونٹی کنٹرول کے ساتھ۔',
        image_url: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=600&q=80',
        price: 7200,
        is_price_on_request: 0,
        unit: 'Set',
        variants_json: JSON.stringify(['Standard Chrome', 'Luxury Gold']),
        is_available: 1,
        is_featured: 1,
      },
      {
        category_id: catMap['faucets-taps'],
        sku: 'BIB-LON-01',
        name_en: 'Heavy Brass Long Body Bib Cock',
        name_ur: 'ہیوی براس لانگ باڈی ٹونٹی (بب کاک)',
        description_en: 'Quarter turn brass valve core, water-saving aerator spout, rust-resistant chrome finish for courtyards and washrooms.',
        description_ur: 'کوارٹر ٹرن کوئیک والو، واٹر سیونگ فلٹر کے ساتھ ہیوی براس لانگ باڈی نلکا۔',
        image_url: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80',
        price: 1350,
        is_price_on_request: 0,
        unit: 'Piece',
        variants_json: JSON.stringify(['1/2 inch Standard']),
        is_available: 1,
        is_featured: 0,
      },
      {
        category_id: catMap['faucets-taps'],
        sku: 'MSL-SHW-ST',
        name_en: 'Muslim Shower Head Set with Flexible Hose',
        name_ur: 'مسلم شاور سیٹ مع لچکدار تار و اسٹینڈ',
        description_en: 'Brass pin core spray trigger, 1.2m anti-burst stainless steel flexible hose, and wall mount holder.',
        description_ur: 'پیتل کی گراری والا مضبوط مسلم شاور، 1.2 میٹر دھاتی تار اور وال ہولڈر۔',
        image_url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80',
        price: 1250,
        is_price_on_request: 0,
        unit: 'Set',
        variants_json: JSON.stringify(['Chrome Brass', 'Black Heavy', 'ABS Polymer']),
        is_available: 1,
        is_featured: 1,
      },

      // Bathroom Accessories
      {
        category_id: catMap['bathroom-accessories'],
        sku: 'ACC-SET-6PC',
        name_en: '6-Piece Stainless Steel Bathroom Accessories Set',
        name_ur: '6 پیس سٹین لیس سٹیل باتھ روم سیٹ',
        description_en: 'Includes double towel rail, soap dish holder, tumbler brush holder, robe hook, tissue roll holder, and glass shelf.',
        description_ur: 'مکمل 6 اشیاء پر مشتمل باتھ روم سیٹ: تولیہ راڈ، صابن دانی، شیمپو شیلف، پیپر ہولڈر اور کپڑا ہک۔',
        image_url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=600&q=80',
        price: 5800,
        is_price_on_request: 0,
        unit: 'Set',
        variants_json: JSON.stringify(['SS 304 Chrome', 'Matte Black Coat']),
        is_available: 1,
        is_featured: 1,
      },
      {
        category_id: catMap['bathroom-accessories'],
        sku: 'DRN-FLR-ODR',
        name_en: 'Anti-Odor & Anti-Insect Floor Drain Grate',
        name_ur: 'بدبو اور کیڑے روکنے والی اینٹی اوڈر فرش جالی',
        description_en: 'SUS 304 stainless steel gravity bounce core prevents foul sewer odors, backflow, and insects from entering.',
        description_ur: 'سٹین لیس سٹیل کشش ثقل خودکار جالی جو گٹر کی بدبو اور کیڑوں کو باتھ روم میں آنے سے روکتی ہے۔',
        image_url: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=600&q=80',
        price: 850,
        is_price_on_request: 0,
        unit: 'Piece',
        variants_json: JSON.stringify(['4 x 4 inch (Square)', '6 x 6 inch (Square)']),
        is_available: 1,
        is_featured: 0,
      },

      // Sanitary Ware
      {
        category_id: catMap['sanitary-ware'],
        sku: 'SAN-COM-ONE',
        name_en: 'Modern One-Piece Tornado Flush Commode',
        name_ur: 'جدید ون پیس ٹورنیڈو فلش کموڈ',
        description_en: 'Nano-glazed antibacterial ceramic, dual flush 3L/6L water saving system, soft-close UF seat cover.',
        description_ur: 'اعلیٰ پالش اینٹی بیکٹیریل سیرامک ون پیس کموڈ، ڈبل فلش سسٹم اور سوفٹ کلوز سیٹ کور۔',
        image_url: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=600&q=80',
        price: 24500,
        is_price_on_request: 0,
        unit: 'Set',
        variants_json: JSON.stringify(['Pure White', 'Ivory Cream', 'Matte Black']),
        is_available: 1,
        is_featured: 1,
      },
      {
        category_id: catMap['sanitary-ware'],
        sku: 'SAN-BAS-PED',
        name_en: 'Designer Wash Basin with Full Pedestal',
        name_ur: 'ڈیزائنر واش بیسن مع مکمل پیڈسٹل (کھمبا)',
        description_en: 'Smooth glazed vitreous china basin with matching floor pedestal, concealed piping cavity.',
        description_ur: 'خوبصورت سیرامک واش بیسن مع میچنگ پیڈسٹل، صفائی میں آسان اور خوبصورت ڈیزائن۔',
        image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
        price: 8900,
        is_price_on_request: 0,
        unit: 'Set',
        variants_json: JSON.stringify(['22 inch Standard', '24 inch Large']),
        is_available: 1,
        is_featured: 0,
      },
      {
        category_id: catMap['sanitary-ware'],
        sku: 'SAN-PAN-ASI',
        name_en: 'Ceramic Orisa / Asian Toilet Squat Pan',
        name_ur: 'سیرامک دیسی سیٹ / اوریسا پین (پاخانہ سیٹ)',
        description_en: 'Heavy glazed non-slip foot tread Asian squatting pan, available with front or back flush inlet.',
        description_ur: 'مضبوط پائیدار دیسی کموڈ سیٹ، پھسلن سے محفوظ ڈیزائن، مکمل گلیزڈ۔',
        image_url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80',
        price: 3200,
        is_price_on_request: 0,
        unit: 'Piece',
        variants_json: JSON.stringify(['20 inch Standard', '21 inch Footrest']),
        is_available: 1,
        is_featured: 0,
      },

      // Valves & Connections
      {
        category_id: catMap['valves-connections'],
        sku: 'VLV-BAL-BRS',
        name_en: 'Heavy Forged Brass Ball Valve (PN25)',
        name_ur: 'ہیوی ڈیوٹی براس بال والو (پیتل وال)',
        description_en: 'Solid brass ball valve with stainless steel lever handle and PTFE seals, ideal for main water line shut-off.',
        description_ur: 'مین واٹر سپلائی کو بند یا کھولنے کے لیے خالص پیتل کا بال والو، زنگ سے محفوظ۔',
        image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
        price: 950,
        is_price_on_request: 0,
        unit: 'Piece',
        variants_json: JSON.stringify(['1/2 inch', '3/4 inch', '1 inch', '1-1/4 inch', '1-1/2 inch', '2 inch']),
        is_available: 1,
        is_featured: 1,
      },
      {
        category_id: catMap['valves-connections'],
        sku: 'VLV-ANG-CHR',
        name_en: 'Triangle Chrome Plated Brass Angle Valve',
        name_ur: 'کروم پلیٹڈ براس اینگل والو (ٹی وال)',
        description_en: 'Quarter turn angle stop valve for connecting geysers, basins, and toilet flushes to water supply.',
        description_ur: 'گیزر، واش بیسن اور کموڈ فلش ٹینکی کنکشن کے لیے کوارٹر ٹرن اینگل کاک۔',
        image_url: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80',
        price: 650,
        is_price_on_request: 0,
        unit: 'Piece',
        variants_json: JSON.stringify(['1/2" x 1/2" Heavy']),
        is_available: 1,
        is_featured: 0,
      },
      {
        category_id: catMap['valves-connections'],
        sku: 'CON-PIP-SSB',
        name_en: 'Flexible Stainless Steel Braided Connection Hose',
        name_ur: 'سٹین لیس سٹیل لچکدار کنکشن پائپ (گیز اور مکسر کے لیے)',
        description_en: 'High pressure burst-proof EPDM inner pipe wrapped in SUS304 braided wire with solid brass hex nuts.',
        description_ur: 'گیزر اور مکسر نلکوں کے لیے ہائی پریشر برسٹ پروف لچکدار کنکشن پائپ۔',
        image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
        price: 320,
        is_price_on_request: 0,
        unit: 'Piece',
        variants_json: JSON.stringify(['18 inch (1.5 ft)', '24 inch (2 ft)', '36 inch (3 ft)', '48 inch (4 ft)']),
        is_available: 1,
        is_featured: 1,
      },
    ];

    for (const p of defaultProducts) {
      await query(
        `INSERT INTO products (
          category_id, sku, name_en, name_ur, description_en, description_ur,
          image_url, price, is_price_on_request, unit, variants_json, is_available, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.category_id,
          p.sku,
          p.name_en,
          p.name_ur,
          p.description_en,
          p.description_ur,
          p.image_url,
          p.price,
          p.is_price_on_request,
          p.unit,
          p.variants_json,
          p.is_available,
          p.is_featured,
        ]
      );
    }
  }

  console.log('[Seed] Database initialization and default seeding complete!');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDefaults()
    .then(() => {
      console.log('Seed finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
