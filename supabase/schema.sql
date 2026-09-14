-- Rifa: esquema de base de datos para Supabase
-- Ejecuta este archivo completo en el SQL Editor de tu proyecto de Supabase
-- (Project -> SQL Editor -> New query -> pega todo -> Run).

create extension if not exists "pgcrypto";

-- 1) Configuración general de la rifa (una sola fila)
create table if not exists raffle_config (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  purpose text not null,
  prize text not null,
  number_price numeric not null default 0,
  draw_date date not null,
  draw_mechanism text,
  number_count int not null,
  number_digits int not null,
  winner_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Números de la rifa
create table if not exists raffle_numbers (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  buyer_name text,
  buyer_phone text,
  total_amount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Historial de abonos por número
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  number_id uuid not null references raffle_numbers(id) on delete cascade,
  amount numeric not null,
  paid_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists payments_number_id_idx on payments(number_id);

-- Trigger para mantener updated_at al día
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists raffle_config_set_updated_at on raffle_config;
create trigger raffle_config_set_updated_at
  before update on raffle_config
  for each row execute function set_updated_at();

drop trigger if exists raffle_numbers_set_updated_at on raffle_numbers;
create trigger raffle_numbers_set_updated_at
  before update on raffle_numbers
  for each row execute function set_updated_at();

-- Seguridad: la app es de un solo administrador sin login, pero queda accesible
-- por internet con la clave "anon". Se habilita RLS con políticas abiertas para
-- que la app funcione sin autenticación. Si más adelante agregas login,
-- reemplaza estas políticas por unas que exijan auth.uid().
alter table raffle_config enable row level security;
alter table raffle_numbers enable row level security;
alter table payments enable row level security;

drop policy if exists "raffle_config_all" on raffle_config;
create policy "raffle_config_all" on raffle_config for all using (true) with check (true);

drop policy if exists "raffle_numbers_all" on raffle_numbers;
create policy "raffle_numbers_all" on raffle_numbers for all using (true) with check (true);

drop policy if exists "payments_all" on payments;
create policy "payments_all" on payments for all using (true) with check (true);

-- Habilitar realtime (para que todos los dispositivos vean cambios en vivo)
alter publication supabase_realtime add table raffle_config;
alter publication supabase_realtime add table raffle_numbers;
alter publication supabase_realtime add table payments;

-- ---------------------------------------------------------------------------
-- Seed inicial con los datos de tu rifa. Si ya existe una configuración no
-- vuelve a insertar (para poder re-ejecutar este archivo sin duplicar datos).
-- ---------------------------------------------------------------------------
insert into raffle_config (title, purpose, prize, number_price, draw_date, draw_mechanism, number_count, number_digits)
select
  'Rifa Pro-Diplomado en Inteligencia Artificial',
  'Recoger fondos para cursar el diplomado en Inteligencia Artificial como opción de grado universitario.',
  '$2.000.000 en efectivo',
  40000,
  '2026-11-05',
  'El ganador se define por los últimos dos dígitos del número ganador de la Lotería del Quindío.',
  100,
  2
where not exists (select 1 from raffle_config);

insert into raffle_numbers (number, total_amount)
select lpad(n::text, 2, '0'), 0
from generate_series(0, 99) as n
where not exists (select 1 from raffle_numbers)
  and (select number_count from raffle_config limit 1) = 100;
