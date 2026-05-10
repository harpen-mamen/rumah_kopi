use rumah_kopi;

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

alter table orders add column if not exists cafe_table_id bigint unsigned null after order_number;
alter table orders add column if not exists table_code varchar(80) null after cafe_table_id;

insert into cafe_tables (name, code, number, location, capacity, is_active)
select * from (
  select 'Table 1', 'TBL-001', 1, 'Main floor', 2, true union all
  select 'Table 2', 'TBL-002', 2, 'Main floor', 4, true union all
  select 'Window Table', 'WINDOW-01', 3, 'Window side', 2, true
) seed_tables
where not exists (select 1 from cafe_tables);
