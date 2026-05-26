ALTER TABLE perks
  ADD COLUMN telegram_username TEXT NOT NULL DEFAULT '',
  ADD COLUMN project_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN project_description TEXT NOT NULL DEFAULT '',
  ADD COLUMN project_website TEXT NOT NULL DEFAULT '',
  ADD COLUMN logo_data_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN offer_title TEXT NOT NULL DEFAULT '',
  ADD COLUMN offer_terms TEXT NOT NULL DEFAULT '',
  ADD COLUMN offer_code TEXT;

UPDATE perks
SET
  telegram_username = CASE
    WHEN telegram_username = '' THEN partner_contact_name
    ELSE telegram_username
  END,
  project_name = CASE
    WHEN project_name = '' THEN partner_name
    ELSE project_name
  END,
  project_description = CASE
    WHEN project_description = '' THEN description
    ELSE project_description
  END,
  project_website = CASE
    WHEN project_website = '' THEN COALESCE(partner_website_url, '')
    ELSE project_website
  END,
  logo_data_url = CASE
    WHEN logo_data_url = '' THEN COALESCE(logo_url, '')
    ELSE logo_data_url
  END,
  offer_title = CASE
    WHEN offer_title = '' THEN title
    ELSE offer_title
  END,
  offer_terms = CASE
    WHEN offer_terms = '' THEN public_terms
    ELSE offer_terms
  END,
  offer_code = COALESCE(offer_code, private_redemption_code);

DROP INDEX IF EXISTS perks_expires_at_idx;
DROP INDEX IF EXISTS perks_partner_contact_email_idx;

ALTER TABLE perks
  DROP COLUMN partner_name,
  DROP COLUMN partner_contact_name,
  DROP COLUMN partner_contact_email,
  DROP COLUMN partner_website_url,
  DROP COLUMN logo_url,
  DROP COLUMN title,
  DROP COLUMN description,
  DROP COLUMN benefit,
  DROP COLUMN category,
  DROP COLUMN public_terms,
  DROP COLUMN redemption_kind,
  DROP COLUMN redemption_instructions,
  DROP COLUMN private_redemption_url,
  DROP COLUMN private_redemption_code,
  DROP COLUMN max_redemptions,
  DROP COLUMN expires_at;

DROP TYPE IF EXISTS perk_redemption_kind;

ALTER TABLE perks
  ALTER COLUMN telegram_username DROP DEFAULT,
  ALTER COLUMN project_name DROP DEFAULT,
  ALTER COLUMN project_description DROP DEFAULT,
  ALTER COLUMN project_website DROP DEFAULT,
  ALTER COLUMN logo_data_url DROP DEFAULT,
  ALTER COLUMN offer_title DROP DEFAULT,
  ALTER COLUMN offer_terms DROP DEFAULT;
