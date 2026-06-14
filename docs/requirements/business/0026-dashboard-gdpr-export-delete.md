---
id: BR-DASH-010
title: GDPR - user-export-data Edge Function (Art. 20) + delete_user_data() RPC cascade
area: DASH
status: implemented
routes: [/app]
modules: [DASH]
related_files: [supabase/functions/user-export-data/index.ts]
tests: []
migrations: [supabase/migrations/20260503000002_secure_delete_user_data.sql, supabase/migrations/20260506000003_delete_user_data_r2_enqueue.sql]
authorized_by: vvaser@gmail.com
aliases: []
---

# BR-DASH-010 — GDPR export + delete

GDPR compliance: the `user-export-data` Edge Function provides Art. 20 data
portability, and the `delete_user_data()` RPC performs a cascading account
deletion (including R2 asset enqueue).

Traceability: functional-spec.md §31 (dashboard architecture); §12c data ethics baseline.
Originating issue: tadaify-app#171.
