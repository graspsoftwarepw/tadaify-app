-- account_settings: pinned message
--
-- Adds a creator-controlled pinned announcement that renders as a banner on the
-- public page (above the blocks). `pinned_enabled` is the explicit on/off switch
-- so a creator can keep the message text while toggling its visibility.
--
-- Story: F-PINNED-001 (tadaify-app#56 follow-up). Persists the dashboard's
-- previously-stubbed pinned-message row (HomepagePanel).

ALTER TABLE account_settings
  ADD COLUMN IF NOT EXISTS pinned_message text,
  ADD COLUMN IF NOT EXISTS pinned_enabled boolean NOT NULL DEFAULT false;

-- Keep the message length sane (mirrors the dashboard input maxLength=80).
ALTER TABLE account_settings
  DROP CONSTRAINT IF EXISTS account_settings_pinned_message_len;
ALTER TABLE account_settings
  ADD CONSTRAINT account_settings_pinned_message_len
  CHECK (pinned_message IS NULL OR char_length(pinned_message) <= 80);
