-- Migration: duplicate_block_rpc
-- Story: F-BLOCK-INFRA-CRUD-001 (tadaify-app#199)
-- BR-BLOCK-CRUD-004: duplicate creates new row at source.position+1, shifting subsequent
--
-- duplicate_block(p_block_id uuid) RETURNS uuid
--
-- SECURITY DEFINER: validates auth.uid() owns the source block before any mutation.
-- Returns the new block's id.
--
-- ECN-CRUD-03: duplicate of last block (position = MAX) → new block at MAX+1, no shifts needed
-- ECN-CRUD-02: caller does not own source block → permission_denied (42501), not 404
--   (the 404 hiding lives at the Worker layer, not in the DB function)

CREATE OR REPLACE FUNCTION duplicate_block(p_block_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_source  blocks;
  v_new_id  uuid;
BEGIN
  -- Guard: caller must be authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  -- Load source block; validate ownership
  SELECT * INTO v_source
  FROM blocks
  WHERE id = p_block_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  -- Shift all blocks after source.position up by 1 (within same page + user)
  UPDATE blocks
  SET    position   = position + 1,
         updated_at = now()
  WHERE  page_id = v_source.page_id
    AND  user_id = v_user_id
    AND  position > v_source.position;

  -- Insert duplicate at source.position + 1
  INSERT INTO blocks (page_id, user_id, block_type, title, url, is_visible, position, meta)
  VALUES (
    v_source.page_id,
    v_source.user_id,
    v_source.block_type,
    v_source.title,
    v_source.url,
    v_source.is_visible,
    v_source.position + 1,
    v_source.meta
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION duplicate_block(uuid) TO authenticated;
