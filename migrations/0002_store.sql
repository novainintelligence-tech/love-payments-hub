create table if not exists store_settings (
  id integer primary key check (id = 1),
  store_name text not null default 'Enroll Log',
  welcome_message text not null default 'Buy verified digital products instantly.',
  support_username text,
  channel_username text,
  mini_app_url text,
  banner_image_url text,
  btc_address text,
  usdt_trc20_address text,
  usdc_erc20_address text,
  min_topup_usd numeric(14,2) not null default 5,
  payment_expiry_minutes integer not null default 60,
  updated_at timestamptz not null default now()
);

create table if not exists store_users (
  id serial primary key,
  public_id bigint not null unique,
  username text not null unique,
  password_hash text not null,
  first_name text,
  wallet_balance numeric(14,2) not null default 0,
  is_banned boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists store_users_username_idx on store_users (username);

create table if not exists store_sessions (
  token text primary key,
  user_id integer not null references store_users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists store_sessions_user_idx on store_sessions (user_id);

create table if not exists categories (
  id serial primary key,
  name text not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id serial primary key,
  name text not null,
  description text,
  price numeric(14,2) not null check (price >= 0),
  product_type text not null default 'key' check (product_type in ('key', 'file')),
  category_id integer references categories(id) on delete set null,
  image_url text,
  download_link text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists products_category_idx on products (category_id);

create table if not exists product_keys (
  id serial primary key,
  product_id integer not null references products(id) on delete cascade,
  key_value text not null,
  is_sold boolean not null default false,
  order_id integer,
  created_at timestamptz not null default now(),
  sold_at timestamptz
);
create index if not exists product_keys_stock_idx on product_keys (product_id, is_sold);

create table if not exists cart_items (
  id serial primary key,
  user_id integer not null references store_users(id) on delete cascade,
  product_id integer not null references products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists orders (
  id serial primary key,
  user_id integer not null references store_users(id) on delete cascade,
  total_amount numeric(14,2) not null,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on orders (user_id);

create table if not exists order_items (
  id serial primary key,
  order_id integer not null references orders(id) on delete cascade,
  product_id integer references products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  price numeric(14,2) not null,
  delivered_asset text
);

create table if not exists transactions (
  id serial primary key,
  invoice_code text not null unique,
  user_id integer not null references store_users(id) on delete cascade,
  amount_usd numeric(14,2) not null check (amount_usd > 0),
  asset text not null,
  pay_address text not null,
  expected_amount numeric(30,8) not null default 0,
  tx_hash text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  completed_at timestamptz
);
create index if not exists transactions_user_idx on transactions (user_id);

create table if not exists wallet_ledger (
  id serial primary key,
  user_id integer not null references store_users(id) on delete cascade,
  amount numeric(14,2) not null,
  balance_after numeric(14,2) not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists user_notes (
  id serial primary key,
  user_id integer not null references store_users(id) on delete cascade,
  author_id integer references store_users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists user_notes_user_idx on user_notes (user_id, created_at desc);

create table if not exists store_reviews (
  id serial primary key,
  author text not null,
  initials text not null,
  product_label text,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

insert into store_settings (
  id, store_name, welcome_message, support_username, channel_username,
  banner_image_url, btc_address, usdt_trc20_address, usdc_erc20_address, min_topup_usd
) values (
  1,
  'Enroll Log',
  'Buy verified digital products instantly — keys and files land in your account the moment payment clears.',
  'ebankenroll',
  'ebankenroll',
  '/catalog/banner.jpg',
  '1EqgNKJMmnnWpGjYZJAapDEyyXruXxLCYj',
  'TZADiUxhu9Y5bvJUMbMtBgFW43KqQ1hzaD',
  '0xfe601096668c46d4bb0bd4e3c93751a3a8f4b3e5',
  5
) on conflict (id) do nothing;

insert into categories (id, name, description, image_url, sort_order) values
  (1, 'Streaming', 'Premium video and music access, delivered as ready-to-use codes.', '/catalog/streaming.jpg', 1),
  (2, 'Gaming', 'Wallet credit, chat boosts and season passes for live games.', '/catalog/gaming.jpg', 2),
  (3, 'Productivity', 'Office suites and OS keys checked before they are listed.', '/catalog/productivity.jpg', 3),
  (4, 'Creative', 'Design kits and file packs with instant download delivery.', '/catalog/creative.jpg', 4),
  (5, 'Security', 'VPN seats and vault tools with live remaining stock.', '/catalog/security.jpg', 5)
on conflict (id) do nothing;

insert into products (id, name, description, price, product_type, category_id, image_url, download_link, is_featured) values
  (1, 'Stream Plus 12-month', 'Full-catalog 4K streaming seat. Code delivered the moment checkout clears.', 12.99, 'key', 1, '/catalog/streaming.jpg', null, true),
  (2, 'Music Family', 'Six-seat audio plan. Family invite code, instant delivery.', 8.49, 'key', 1, '/catalog/streaming.jpg', null, false),
  (3, 'Anime Pass', 'Seasonal anime library access for twelve months.', 6.99, 'key', 1, '/catalog/streaming.jpg', null, false),
  (4, 'Game Wallet 50', 'Fifty dollars of store credit for a major game platform.', 47.00, 'key', 2, '/catalog/gaming.jpg', null, true),
  (5, 'Chat Boost', 'One-year boosted chat features for communities.', 9.99, 'key', 2, '/catalog/gaming.jpg', null, false),
  (6, 'Season Pass', 'Current competitive season pass. Restocking this week.', 11.50, 'key', 2, '/catalog/gaming.jpg', null, false),
  (7, 'Office Suite', 'Desktop productivity suite key, verified before listing.', 29.00, 'key', 3, '/catalog/productivity.jpg', null, false),
  (8, 'OS Pro Key', 'Professional desktop OS license, one device activation.', 19.00, 'key', 3, '/catalog/productivity.jpg', null, true),
  (9, 'Design Toolkit', 'Layered templates and brush pack. File delivery, unlimited copies.', 15.00, 'file', 4, '/catalog/creative.jpg', 'https://example.com/files/design-toolkit.zip', true),
  (10, 'Canvas Pack', 'Poster and social templates. Instant file download.', 9.00, 'file', 4, '/catalog/creative.jpg', 'https://example.com/files/canvas-pack.zip', false),
  (11, 'Shield VPN 1-Year', 'Twelve months of encrypted VPN on ten devices.', 22.00, 'key', 5, '/catalog/security.jpg', null, true),
  (12, 'Vault Guard', 'Password vault seat with shared family spaces.', 7.50, 'key', 5, '/catalog/security.jpg', null, false)
on conflict (id) do nothing;

insert into product_keys (product_id, key_value)
select 1, 'STRM-PLUS-' || lpad(gs::text, 4, '0') from generate_series(1, 7) gs
where not exists (select 1 from product_keys where product_id = 1);

insert into product_keys (product_id, key_value)
select 2, 'MUSIC-FAM-' || lpad(gs::text, 4, '0') from generate_series(1, 12) gs
where not exists (select 1 from product_keys where product_id = 2);

insert into product_keys (product_id, key_value)
select 3, 'ANIME-PASS-' || lpad(gs::text, 4, '0') from generate_series(1, 6) gs
where not exists (select 1 from product_keys where product_id = 3);

insert into product_keys (product_id, key_value)
select 4, 'GAME-WALLET-' || lpad(gs::text, 4, '0') from generate_series(1, 5) gs
where not exists (select 1 from product_keys where product_id = 4);

insert into product_keys (product_id, key_value)
select 5, 'CHAT-BOOST-' || lpad(gs::text, 4, '0') from generate_series(1, 3) gs
where not exists (select 1 from product_keys where product_id = 5);

insert into product_keys (product_id, key_value)
select 7, 'OFFICE-SUITE-' || lpad(gs::text, 4, '0') from generate_series(1, 8) gs
where not exists (select 1 from product_keys where product_id = 7);

insert into product_keys (product_id, key_value)
select 8, 'OS-PRO-' || lpad(gs::text, 4, '0') from generate_series(1, 9) gs
where not exists (select 1 from product_keys where product_id = 8);

insert into product_keys (product_id, key_value)
select 11, 'SHIELD-VPN-' || lpad(gs::text, 4, '0') from generate_series(1, 15) gs
where not exists (select 1 from product_keys where product_id = 11);

insert into product_keys (product_id, key_value)
select 12, 'VAULT-GUARD-' || lpad(gs::text, 4, '0') from generate_series(1, 4) gs
where not exists (select 1 from product_keys where product_id = 12);

insert into store_reviews (author, initials, product_label, rating, body) values
  ('Mara K.', 'MK', 'Stream Plus 12-month', 5, 'Code arrived in under a minute and activated on the first try. Restocked exactly as listed.'),
  ('Jonah P.', 'JP', 'Shield VPN 1-Year', 5, 'Live stock number matched what I received. Support replied the same hour I asked about devices.'),
  ('Rina S.', 'RS', 'Game Wallet 50', 4, 'Paid from my balance after a BTC top-up. Wallet credit showed up immediately.'),
  ('Eli N.', 'EN', 'OS Pro Key', 5, 'Needed a replacement after a hardware swap — they issued one without a fuss.'),
  ('Pia V.', 'PV', 'Design Toolkit', 5, 'File download was waiting in My orders the second checkout finished.'),
  ('Chris L.', 'CL', 'Music Family', 4, 'Family invite worked for all six seats. The in-stock count was accurate, which I appreciated.');

select setval('categories_id_seq', (select max(id) from categories));
select setval('products_id_seq', (select max(id) from products));
