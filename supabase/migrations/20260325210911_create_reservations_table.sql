-- Tabel rezervări Vibe Caffè
create table reservations (
  id          bigint primary key generated always as identity,
  name        text not null,
  email       text not null,
  phone       text not null,
  guests      integer not null default 2,
  date        date not null,
  time        text not null,
  status      text not null default 'în așteptare',
  created_at  timestamptz not null default now()
);

-- Securitate: oricine poate adăuga, citi, modifica și șterge rezervări
alter table reservations enable row level security;

create policy "public can select"  on reservations for select  using (true);
create policy "public can insert"  on reservations for insert  with check (true);
create policy "public can update"  on reservations for update  using (true);
create policy "public can delete"  on reservations for delete  using (true);