# Kids Math Test — Production 2.0.6
## Setup / Deployment

This release is based on the confirmed Production 2.0.6 workflow. This regenerated package also fixes the existing `worksheets_status_check` migration issue by replacing the old status constraint BEFORE normalizing statuses.

### Existing Production Database

1. Keep the current Supabase project.
2. Do NOT recreate Auth users.
3. Do NOT change the existing UUID mappings.
4. Open Supabase → SQL Editor.
5. Run the complete `supabase-production-2.0.6.sql` once. This regenerated SQL is the ONLY SQL file to use for 2.0.6; do not run an older 2.0.6 SQL file.
6. Deploy the application files to GitHub Pages.
7. Hard-refresh the site / test Incognito.
8. Test login, worksheet submission, Admin review, progress and void.

### New Database

1. Create the Supabase project.
2. Create four Auth users.
3. Copy their Auth UUIDs.
4. Replace the UUID values in the canonical SQL before running it.
5. Run the complete SQL.
6. Configure `app-config.js` with the new project URL and publishable key.
7. Deploy the application files.
8. Run the full acceptance checklist.

### Current production UUIDs

Poorvi:
f432fcbf-dbd1-4ffb-b4f9-7174fd900f13

Mahiram:
5ae2780e-6d1e-46c6-83c5-b065db65742e

Guest:
90547e60-0e8e-4b25-85a0-4e4aafb55c94

Admin:
d43f40ee-08a6-460d-9e0c-4744dc81b694

### Workflow

Student submits → Under Parent Review → Admin reviews → Approved or Void.

Only Approved worksheets can expose the student review.

Student review:
- last 3 days only
- mistakes only
- student's answer
- correct answer

Admin:
- review new submissions
- edit previous reviews
- void submitted/reviewed worksheets
- view any student's progress

Student:
- view only own progress

### Important security rules

- Never put service_role/secret keys in browser code.
- Never create a `kids_users` RLS policy that calls `kmt_is_admin()`.
- Keep SECURITY DEFINER helper functions.
- Do not use localStorage as authoritative identity.
- Use Supabase Auth + auth_users mapping.

### 2.0.6 acceptance checklist

[ ] Login all four accounts
[ ] Incognito login
[ ] Cross-device login
[ ] Erase → Write
[ ] Fullscreen absent
[ ] Submit worksheet
[ ] Under Parent Review appears
[ ] Approved after Admin review
[ ] Student sees only last 3 days
[ ] View Review shows mistakes only
[ ] Admin edits old submission
[ ] Admin voids submitted worksheet
[ ] Voided worksheet excluded from progress
[ ] Student sees own progress
[ ] Admin sees selected student's progress
[ ] Timer auto-submit reaches Admin
[ ] No 42P17
[ ] No 42501
