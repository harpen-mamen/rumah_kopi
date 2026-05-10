create database if not exists rumah_kopi
  character set utf8mb4
  collate utf8mb4_unicode_ci;

use rumah_kopi;

create table if not exists reservations (
  id bigint unsigned primary key auto_increment,
  name varchar(120) not null,
  email varchar(190) not null,
  phone varchar(50) not null,
  guests int unsigned not null default 2,
  date date not null,
  time varchar(20) not null,
  status varchar(30) not null default 'în așteptare',
  created_at timestamp not null default current_timestamp,
  updated_at timestamp null default null on update current_timestamp,
  index reservations_date_status_idx (date, status),
  index reservations_created_at_idx (created_at)
);

create table if not exists menu_items (
  id bigint unsigned primary key auto_increment,
  category varchar(120) not null,
  name varchar(160) not null,
  description text null,
  price decimal(10, 2) not null default 0.00,
  available boolean not null default true,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp null default null on update current_timestamp,
  index menu_items_category_idx (category),
  index menu_items_available_idx (available)
);

create table if not exists cafe_tables (
  id bigint unsigned primary key auto_increment,
  name varchar(120) not null,
  code varchar(80) not null unique,
  number int unsigned null,
  location varchar(160) null,
  capacity int unsigned null,
  is_active boolean not null default true,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp null default null on update current_timestamp,
  index cafe_tables_code_idx (code),
  index cafe_tables_active_idx (is_active)
);

create table if not exists orders (
  id bigint unsigned primary key auto_increment,
  order_number varchar(40) not null unique,
  cafe_table_id bigint unsigned null,
  table_code varchar(80) null,
  customer_name varchar(160) not null,
  customer_phone varchar(60) not null,
  customer_note text null,
  subtotal decimal(10, 2) not null default 0.00,
  total decimal(10, 2) not null default 0.00,
  status varchar(30) not null default 'pending',
  ordered_at timestamp not null default current_timestamp,
  completed_at timestamp null,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp null default null on update current_timestamp,
  constraint orders_cafe_table_id_fk foreign key (cafe_table_id) references cafe_tables(id) on delete set null,
  index orders_status_idx (status),
  index orders_table_code_idx (table_code),
  index orders_ordered_at_idx (ordered_at)
);

create table if not exists order_items (
  id bigint unsigned primary key auto_increment,
  order_id bigint unsigned not null,
  menu_item_id bigint unsigned null,
  menu_name_snapshot varchar(160) not null,
  price_snapshot decimal(10, 2) not null,
  quantity int unsigned not null,
  note text null,
  subtotal decimal(10, 2) not null,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp null default null on update current_timestamp,
  constraint order_items_order_id_fk foreign key (order_id) references orders(id) on delete cascade,
  constraint order_items_menu_item_id_fk foreign key (menu_item_id) references menu_items(id) on delete set null,
  index order_items_order_id_idx (order_id)
);

insert into menu_items (category, name, description, price, available)
select * from (
  select 'Espresso Classics', 'Espresso', 'Rich and balanced single espresso shot.', 2.50, true union all
  select 'Espresso Classics', 'Americano', 'Espresso softened with hot water.', 3.00, true union all
  select 'Espresso Classics', 'Cappuccino', 'Espresso, steamed milk, and silky foam.', 3.80, true union all
  select 'Espresso Classics', 'Latte', 'Smooth espresso with steamed milk.', 4.20, true union all
  select 'Specialty Coffee', 'Honey Lavender Latte', 'Floral lavender with honey and espresso.', 4.90, true union all
  select 'Specialty Coffee', 'Rose Cortado', 'Short espresso drink with rose notes.', 4.50, true union all
  select 'Cold Brew & Iced', 'Classic Cold Brew', 'Slow-steeped cold coffee served over ice.', 4.30, true union all
  select 'Cold Brew & Iced', 'Salted Caramel Cold Brew', 'Cold brew with salted caramel finish.', 4.90, true union all
  select 'Pastry', 'Butter Croissant', 'Flaky butter croissant baked fresh.', 3.20, true union all
  select 'Pastry', 'Chocolate Brownie', 'Dense chocolate brownie with a soft center.', 3.70, true
) seed
where not exists (select 1 from menu_items);

insert into cafe_tables (name, code, number, location, capacity, is_active)
select * from (
  select 'Table 1', 'TBL-001', 1, 'Main floor', 2, true union all
  select 'Table 2', 'TBL-002', 2, 'Main floor', 4, true union all
  select 'Window Table', 'WINDOW-01', 3, 'Window side', 2, true
) seed_tables
where not exists (select 1 from cafe_tables);
