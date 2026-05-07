-- Migration: reorder_blocks_rpc
-- Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
-- BR-BLOCK-CRUD-003: block reorder is atomic (all positions update in single transaction)
--
-- reorder_blocks(p_page_id uuid, p_ordered_ids uuid[]) RETURNS void
--
-- SECURITY DEFINER so the function can validate ownership without relying on RLS
-- during the internal SELECT (which runs as the function owner, not the caller).
-- Caller identity is captured via auth.uid() at call time.
--
-- ECN-CRUD-04: raises invalid_input (SQLSTATE 22023) when ordered_ids contains a
--   block from a different page or not owned by the caller.
-- ECN-CRUD-05: raises invalid_input when ordered_ids length mismatches the actual
--   number of blocks for the page (caller must always send the full ordered list).
-- ECN-CRUD-06: concurrent reorders are serialised by Postgres row-level locking
--   inside the UPDATE; second write wins; client refetches on next load.

CREATE OR REPLACE FUNCTION reorder_blocks(p_page_id uuid, p_ordered_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_matching_count int;
  v_total_count    int;
BEGIN
  -- Guard: caller must be authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  -- Guard: all supplied ids must belong to the specified page AND be owned by caller
  SELECT count(*) INTO v_matching_count
  FROM blocks
  WHERE id      = ANY(p_ordered_ids)
    AND page_id = p_page_id
    AND user_id = v_user_id;

  IF v_matching_count != cardinality(p_ordered_ids) THEN
    RAISE EXCEPTION 'invalid_input: ordered_ids cross-page or wrong owner'
      USING ERRCODE = '22023';
  END IF;

  -- Guard: ordered_ids must include ALL blocks for the page (no missing blocks)
  SELECT count(*) INTO v_total_count
  FROM blocks
  WHERE page_id = p_page_id
    AND user_id = v_user_id;

  IF v_total_count != cardinality(p_ordered_ids) THEN
    RAISE EXCEPTION 'invalid_input: ordered_ids missing some page blocks'
      USING ERRCODE = '22023';
  END IF;

  -- Atomic renumber: derive new 0-based position from array ordinality
  WITH numbered AS (
    SELECT u.id, (u.ord - 1)::integer AS new_position
    FROM unnest(p_ordered_ids) WITH ORDINALITY AS u(id, ord)
  )
  UPDATE blocks
  SET    position   = numbered.new_position,
         updated_at = now()
  FROM   numbered
  WHERE  blocks.id = numbered.id;
END;
$$;

GRANT EXECUTE ON FUNCTION reorder_blocks(uuid, uuid[]) TO authenticated;
