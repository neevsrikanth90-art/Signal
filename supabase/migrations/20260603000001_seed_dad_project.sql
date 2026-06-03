-- Seed Dad's project (upsert so it's safe to re-run)
INSERT INTO public.projects (api_key, name, notification_email)
VALUES ('sk_live_dad_site_001', 'Dad''s Site', 'dad@email.com')
ON CONFLICT (api_key) DO UPDATE
  SET notification_email = EXCLUDED.notification_email;
