Kids Math Test — Production v1.2.2

SUPABASE AUTH IS NOW ACTIVE.

Login flow:
1. User enters the email/password created in Supabase Authentication.
2. Supabase authenticates the account.
3. auth_users maps the Auth UUID to poorvi/mahiram/guest/admin.
4. kids_users supplies the display name and role.
5. Admin goes to admin.html; child/Guest goes to index.html.
6. Index is locked to the authenticated user.

Required deployed files:
- index.html
- login.html
- admin.html
- supabase-config.js

Database:
- supabase-schema.sql must already have been executed.
- auth_users must contain the four UUID mappings.

Security:
- Browser uses only the Supabase publishable/anon key.
- Never put service_role/secret keys in client files.
