-- Migration: blocks_insert_delete_rls
-- Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
-- DEC-374=B: hard-delete only (no soft-delete column)
-- DEC-374=B: blocks_own_insert validates both block ownership AND parent page ownership
--
-- Adds the two RLS policies missing from 20260503000001_app_dashboard_tables.sql:
--   1. blocks_own_insert — WITH CHECK guards:
--        a. auth.uid() = user_id (block ownership)
--        b. EXISTS (SELECT 1 FROM pages WHERE pages.id = blocks.page_id AND pages.user_id = auth.uid())
--           (parent page ownership — prevents inserting blocks into another creator's page,
--            even when blocks.user_id matches the caller, per ECN-CRUD-11)
--   2. blocks_own_delete — USING (auth.uid() = user_id)
--        hard-delete; no soft-delete column per DEC-374=B
--
-- GDPR cascade note: blocks.page_id REFERENCES pages(id) ON DELETE CASCADE already exists.
-- delete_user_data() deletes pages → blocks cascade automatically.
-- Explicit TR documentation: no additional RLS or function changes needed for GDPR.

CREATE POLICY blocks_own_insert ON blocks
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = blocks.page_id
        AND pages.user_id = auth.uid()
    )
  );

CREATE POLICY blocks_own_delete ON blocks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
