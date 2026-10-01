-- Session / multi-question support (run in Supabase SQL Editor if not already applied)

alter table public.polls
  add column if not exists question_number integer default 1 not null;

-- Allow clearing votes when starting the next question in the same room
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'votes'
      and policyname = 'Allow public delete votes'
  ) then
    create policy "Allow public delete votes" on public.votes for delete using (true);
  end if;
end $$;
