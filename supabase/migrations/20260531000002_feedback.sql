-- feedback
--
-- Stores in-app feedback submitted from the dashboard Feedback panel
-- (/app?tab=feedback). One row per submission, owned by the authenticated user.
--
-- Story: F-FEEDBACK-001 (tadaify-app#56 follow-up). Persists the previously
-- alert-stubbed feedback form.

CREATE TABLE IF NOT EXISTS feedback (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic       text        NOT NULL CHECK (topic IN ('bug', 'idea', 'other')),
  title       text        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  body        text        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  contact_ok  boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON feedback (user_id);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Defense in depth — the API inserts via the service-role key, but these
-- policies keep direct PostgREST access scoped to the row's owner.
DROP POLICY IF EXISTS feedback_own_insert ON feedback;
CREATE POLICY feedback_own_insert ON feedback
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS feedback_own_select ON feedback;
CREATE POLICY feedback_own_select ON feedback
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- NOTE (GDPR): rows cascade-delete when the auth.users row is removed. When the
-- account-deletion flow is hardened it should also delete feedback inside the
-- delete_user_data() RPC for the data-export/erasure path; deferred for now.
