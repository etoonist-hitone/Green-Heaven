-- Seed Data for Green Heaven
-- Run this in your Supabase SQL Editor to populate the database with initial categories and plants.

-- 1. Insert Categories
INSERT INTO public.categories (id, name, slug) VALUES
('d0a52f41-3b7c-4740-8b63-127e997f884a', 'ইনডোর প্ল্যান্ট', 'indoor'),
('e1d67a92-f38b-4a5f-b5dc-d6f7a791a84f', 'আউটডোর প্ল্যান্ট', 'outdoor'),
('f4b78c93-d29a-4c2f-a9cb-b2f7d8c2b53e', 'গার্ডেনিং টুলস', 'tools')
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name;

-- 2. Insert Products (Plants & Tools)
INSERT INTO public.products (id, name_bn, name_en, category_id, price, description, care_instructions, images, stock_status) VALUES
-- Indoor Plants
(
  'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e501',
  'মনস্টেরা ডেলিসিওসা (Monstera)',
  'Monstera Deliciosa',
  'd0a52f41-3b7c-4740-8b63-127e997f884a',
  850.00,
  'মনস্টেরা গাছটি তার চমৎকার ট্রপিক্যাল পাতা এবং ঘরের সৌন্দর্য বাড়ানোর জন্য পরিচিত। এটি ঘরের বাতাস বিশুদ্ধ করতে সাহায্য করে এবং খুব বেশি যত্নের প্রয়োজন হয় না।',
  'পরোক্ষ সূর্যালোকে রাখুন। মাটি শুকিয়ে গেলে কেবল তখনই পানি দিন। সপ্তাহে ১-২ বার পাতাগুলো ভেজা কাপড় দিয়ে মুছে দিন।',
  ARRAY['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80'],
  'available'
),
(
  'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e502',
  'পিস লিলি (Peace Lily)',
  'Peace Lily',
  'd0a52f41-3b7c-4740-8b63-127e997f884a',
  350.00,
  'সুন্দর সাদা ফুল এবং গাঢ় সবুজ পাতার পিস লিলি ইনডোর প্ল্যান্ট হিসেবে খুবই জনপ্রিয়। এটি অল্প আলোতেও বেঁচে থাকে এবং ঘরের ক্ষতিকর টক্সিন দূর করে।',
  'কম আলো বা মাঝারি পরোক্ষ আলোতে ভালো বাড়ে। মাটি আর্দ্র রাখুন তবে অতিরিক্ত পানি জমে থাকতে দেবেন না। পাতা নেতিয়ে পড়লে বুঝবেন পানি দেওয়ার সময় হয়েছে।',
  ARRAY['https://images.unsplash.com/photo-1597055181300-e3633a207518?w=600&auto=format&fit=crop&q=80'],
  'available'
),

-- Outdoor Plants
(
  'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e503',
  'লাল গোলাপ (Red Rose)',
  'Red Rose',
  'e1d67a92-f38b-4a5f-b5dc-d6f7a791a84f',
  120.00,
  'লাল গোলাপ ভালোবাসার প্রতীক এবং যে কোনো বাগানের সৌন্দর্য বহুগুণ বাড়িয়ে দেয়। আমাদের এই গাছগুলো কলমের তৈরি, তাই দ্রুত ফুল দেয়।',
  'প্রতিদিন অন্তত ৫-৬ ঘণ্টা সরাসরি সূর্যালোক প্রয়োজন। নিয়মিত সেচ দিন এবং গাছের গোড়া পরিষ্কার রাখুন। ভালো ফুল পেতে প্রতি মাসে জৈব সার দিন।',
  ARRAY['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'],
  'available'
),
(
  'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e504',
  'বাগানবিলাস (Bougainvillea)',
  'Bougainvillea',
  'e1d67a92-f38b-4a5f-b5dc-d6f7a791a84f',
  250.00,
  'বাগানবিলাস একটি দ্রুত বর্ধনশীল লতানো গাছ যা প্রচুর পরিমাণে উজ্জ্বল রঙের ফুল ফুটিয়ে থাকে। এটি বাড়ির ছাদ, গেট বা ব্যালকনির জন্য উপযুক্ত।',
  'পূর্ণ সূর্যালোক এবং নিষ্কাশনযোগ্য মাটির প্রয়োজন। এটি খরা সহনশীল, তাই মাটিতে অতিরিক্ত পানি দেবেন না। ফুল ঝরে যাওয়ার পর ডালপালা ছাঁটাই করুন।',
  ARRAY['https://images.unsplash.com/photo-1589244159943-460088ed5c92?w=600&auto=format&fit=crop&q=80'],
  'available'
),

-- Gardening Tools
(
  'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e505',
  'প্রিমিয়াম স্টিল হাত কোদাল (Trowel)',
  'Premium Hand Trowel',
  'f4b78c93-d29a-4c2f-a9cb-b2f7d8c2b53e',
  180.00,
  'গাছ লাগানো, মাটি আলগা করা বা সার মেশানোর জন্য অত্যন্ত টেকসই স্টেইনলেস স্টিলের তৈরি হাত কোদাল। এর হ্যান্ডেলটি গ্রিপ ধরে রাখতে আরামদায়ক।',
  'ব্যবহারের পর মাটি ধুয়ে শুকিয়ে রাখুন। মরিচা প্রতিরোধে মাঝে মাঝে সামান্য তেল মেখে সংরক্ষণ করুন।',
  ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80'],
  'available'
),
(
  'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e506',
  'ওয়াটারিং স্প্রে ক্যান (Watering Can)',
  'Watering Can 2L',
  'f4b78c93-d29a-4c2f-a9cb-b2f7d8c2b53e',
  220.00,
  '২ লিটার ধারণক্ষমতা সম্পন্ন ওয়াটারিং ক্যান। এটি দিয়ে গাছে হালকা বৃষ্টি বা স্প্রের মতো পানি দেওয়া যায়, যা ছোট চারাগাছের জন্য নিখুঁত।',
  'ব্যবহারের পর পানি শূন্য করে রাখুন যেন ভেতরে শ্যাওলা না জমে। সরাসরি রোদে দীর্ঘক্ষণ রাখা পরিহার করুন।',
  ARRAY['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80'],
  'sold_out'
),
(
  'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e507',
  'অ্যালোভেরা (Aloe Vera)',
  'Aloe Vera',
  'd0a52f41-3b7c-4740-8b63-127e997f884a',
  150.00,
  'অ্যালোভেরা গাছটি রূপচর্চা ও স্বাস্থ্যগত নানা উপকারের জন্য বিশ্বজুড়ে সমাদৃত। এটি খুব কম যত্নে বাড়ে এবং ঘরের অভ্যন্তরীণ রূপ বৃদ্ধি করে।',
  'সরাসরি তীব্র রোদ পরিহার করুন। মাটি পুরোপুরি শুকনো না হওয়া পর্যন্ত পানি দেবেন না।',
  ARRAY['https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800'],
  'available'
),
(
  'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e508',
  'মানি প্ল্যান্ট (Money Plant)',
  'Money Plant',
  'd0a52f41-3b7c-4740-8b63-127e997f884a',
  180.00,
  'ঘরের সৌন্দর্য বর্ধনে ও বাতাস ফিল্টার করার জন্য মানি প্ল্যান্টের জুড়ি নেই। এটি বোতলে পানিতে বা মাটিতে যেকোনো জায়গায় লতানো আকারে বেড়ে ওঠে।',
  'মাঝারি আলো ও সপ্তাহে ১-২ বার পানি দিলেই এটি সতেজ থাকে।',
  ARRAY['https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800'],
  'available'
),
(
  'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e509',
  'স্নেক প্ল্যান্ট (Snake Plant)',
  'Snake Plant',
  'd0a52f41-3b7c-4740-8b63-127e997f884a',
  280.00,
  'রাতে ঘরের কার্বন ডাই-অক্সাইড শুষে নিয়ে বিশুদ্ধ অক্সিজেন তৈরি করতে স্নেক প্ল্যান্ট অন্যতম। এটি ঘরের যেকোনো কোণে রাখা যায় এবং অত্যন্ত দীর্ঘজীবী।',
  'অল্প আলো এবং খুবই সামান্য পানির প্রয়োজন হয়। অতিরিক্ত পানি থেকে বাঁচিয়ে রাখুন।',
  ARRAY['https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800'],
  'available'
),
(
  'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e510',
  'আম গাছ (হাড়িভাঙ্গা)',
  'Mango Plant - Haribhanga',
  'e1d67a92-f38b-4a5f-b5dc-d6f7a791a84f',
  350.00,
  'হাড়িভাঙ্গা আমের জনপ্রিয় জাতের কলমের চারা। বাড়ির ছাদ বা বাগানের ড্রামে লাগানোর জন্য এটি একদম আদর্শ চারা। দ্রুত ফলন পাওয়া যাবে।',
  'সারাদিন রোদ পায় এমন স্থানে রাখুন। সপ্তাহে ২-৩ বার পর্যাপ্ত পানি দিন এবং গোড়ার মাটি আলগা রাখুন।',
  ARRAY['https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800'],
  'available'
),
(
  'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e511',
  'লেবু গাছ (কাগজি)',
  'Lemon Plant - Kagoji',
  'e1d67a92-f38b-4a5f-b5dc-d6f7a791a84f',
  150.00,
  '১২ মাস ফলনশীল কাগজি লেবু চারা। প্রচুর লেবু ধরে এবং টবে বা বাগানে রোপণের জন্য অত্যন্ত উপযোগী।',
  'সূর্যালোক খুব পছন্দ করে। নিয়মিত পানি দিন এবং মাঝেমধ্যে সামান্য ইউরিয়া ও খৈলের জল প্রয়োগ করুন।',
  ARRAY['https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800'],
  'available'
),
(
  'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e512',
  'বেলি ফুল (Jasmine)',
  'Jasmine - Beli',
  'e1d67a92-f38b-4a5f-b5dc-d6f7a791a84f',
  120.00,
  'অত্যন্ত মিষ্টি সুবাসের বেলি ফুলের চারা। গ্রীষ্মকালে এই গাছে প্রচুর পরিমাণে সাদা বেলি ফুল ফোটে যা চারপাশ সুবাসিত করে রাখে।',
  'পর্যাপ্ত রোদ ও নিয়মিত সেচ দিন। ফুল শুকিয়ে গেলে ডাল ছাঁটাই করুন নতুন কুঁড়ির জন্য।',
  ARRAY['https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800'],
  'available'
),
(
  'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e513',
  'ডাল ছাঁটাই কাঁচি (Pruning Shears)',
  'Pruning Shears',
  'f4b78c93-d29a-4c2f-a9cb-b2f7d8c2b53e',
  380.00,
  'গাছের মরা ও অতিরিক্ত ডালপালা সহজে ছাঁটাই করার জন্য শার্প স্টিল ব্লেডের প্রুনিং কাঁচি। বাগান পরিচর্যায় এটি অন্যতম প্রয়োজনীয় উপাদান।',
  'ব্যবহারের পর ব্লেড পরিষ্কার করে শুকিয়ে সামান্য তেল মেখে রাখলে জং ধরবে না।',
  ARRAY['https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800'],
  'available'
),
(
  'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e514',
  'প্লাস্টিক ফুলের টব (১০ ইঞ্চি)',
  'Plastic Flower Pot 10 inch',
  'f4b78c93-d29a-4c2f-a9cb-b2f7d8c2b53e',
  75.00,
  'উচ্চমানের প্লাস্টিকের তৈরি ১০ ইঞ্চি ড্রেনেজযুক্ত টব। ইনডোর ও আউটডোর যেকোনো ছোট-মাঝারি আকারের গাছ লাগানোর জন্য উপযুক্ত।',
  'সরাসরি কড়া রোদে দীর্ঘদিন ফেলে রাখা পরিহার করুন।',
  ARRAY['https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800'],
  'available'
),
(
  'a1a2a3a4-b1b2-c1c2-d1d2-e1e2e3e4e515',
  'জৈব সার (ভার্মিকম্পোস্ট ২ কেজি)',
  'Organic Vermicompost 2kg',
  'f4b78c93-d29a-4c2f-a9cb-b2f7d8c2b53e',
  60.00,
  'কেঁচো কম্পোস্ট বা ভার্মিকম্পোস্ট জৈব সার। এটি গাছের দ্রুত বৃদ্ধি, ফুল-ফল ও পুষ্টি বাড়াতে অত্যন্ত কার্যকরী।',
  'গাছের গোড়া থেকে সামান্য দূরে মাটির সাথে মিশিয়ে দিন। সার প্রয়োগের পর হালকা পানি সেচ দিন।',
  ARRAY['https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800'],
  'available'
)
ON CONFLICT (id) DO UPDATE 
SET 
  name_bn = EXCLUDED.name_bn,
  name_en = EXCLUDED.name_en,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  care_instructions = EXCLUDED.care_instructions,
  images = EXCLUDED.images,
  stock_status = EXCLUDED.stock_status;
