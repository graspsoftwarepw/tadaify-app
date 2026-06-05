# Migrations index

Generated from migration headers (do not hand-edit — run `scripts/gen-migrations-index.sh`). Latest migration: 2026-05-31.

## Legacy (grandfathered, pre-cutoff)

The 19 migrations at or before cutoff `20260531000002` predate the header standard (issue #309) and are exempt — never rewritten or back-filled. Listed by filename.

- 20260429000001_handle_reservations.sql
- 20260501000001_profiles.sql
- 20260501000002_handle_reservation_cleanup_trigger.sql
- 20260502000001_drop_handle_reservations_default.sql
- 20260503000001_app_dashboard_tables.sql
- 20260503000002_secure_delete_user_data.sql
- 20260503000003_otp_rate_limit_attempts.sql
- 20260504000001_otp_rate_limit_pair_keyed_index.sql
- 20260504000002_otp_rate_limit_acquire_slot_rpc.sql
- 20260504000003_otp_slot_reservation_finalization.sql
- 20260505182021_profile_extras_base.sql
- 20260506000001_profile_extras_add_avatar_r2_key.sql
- 20260506000002_profile_extras_rls_tier_lockdown.sql
- 20260506000003_delete_user_data_r2_enqueue.sql
- 20260507122951_blocks_insert_delete_rls.sql
- 20260507122952_reorder_blocks_rpc.sql
- 20260507122953_duplicate_block_rpc.sql
- 20260531000001_account_settings_pinned_message.sql
- 20260531000002_feedback.sql
