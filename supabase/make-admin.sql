-- À exécuter UNE FOIS, après avoir créé votre compte dans Supabase :
-- Authentication > Users > Add user > Create new user (cochez « Auto Confirm User »).
--
-- Remplacez l'adresse ci-dessous par celle de ce compte.
insert into public.admins (user_id)
select id from auth.users where email = 'martinmanampisoa5@gmail.com'
on conflict do nothing;

-- Vérification : doit renvoyer une ligne.
select a.user_id, u.email
from public.admins a
join auth.users u on u.id = a.user_id;
