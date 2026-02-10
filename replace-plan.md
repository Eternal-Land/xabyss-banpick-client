# Plan: Replace LocaleKeys with i18n namespaces in routes

## Goal

Replace all `LocaleKeys` usage in `src/routes/**` with `getTranslationToken(namespace, key)` from `src/i18n/namespaces.ts`.

## Scope

Only route files under `src/routes/**`.

## Steps

1. Inventory all `LocaleKeys` references in routes and list affected files.
2. Map each `LocaleKeys` entry to its namespace using `src/i18n/keys/*`.
3. Update imports in each route file:
   - Remove `LocaleKeys` from `@/lib/constants` imports.
   - Add `getTranslationToken` from `@/i18n/namespaces`.
4. Replace usages:
   - `t(LocaleKeys.some_key)` -> `t(getTranslationToken("namespace", "some_key"))`.
   - Also update non-`t` usages like `textKey: LocaleKeys.some_key` to `textKey: getTranslationToken("namespace", "some_key")`.
5. Run a final search for `LocaleKeys` in `src/routes/**` and confirm zero matches.
6. Spot-check key routes (auth, profile, admin list) to ensure translations render as expected.

## Namespace mapping guide

Use the filename in `src/i18n/keys/` as the namespace name. Examples:

- `src/i18n/keys/auth.ts` -> namespace `auth`
- `src/i18n/keys/characters.ts` -> namespace `characters`
- `src/i18n/keys/staffs.ts` -> namespace `staffs`
- `src/i18n/keys/staff-roles.ts` -> namespace `staff-roles`
- `src/i18n/keys/users.ts` -> namespace `users`
- `src/i18n/keys/weapons.ts` -> namespace `weapons`

## Affected route areas (from initial scan)

- User auth and profile:
  - `src/routes/_userLayout/auth/login.tsx`
  - `src/routes/_userLayout/auth/register.tsx`
  - `src/routes/_userLayout/_userProtectedLayout/profile.tsx`
- Admin shell:
  - `src/routes/admin.tsx`
- Admin modules:
  - `src/routes/admin/characters/index.tsx`
  - `src/routes/admin/characters/create.tsx`
  - `src/routes/admin/characters/$characterId.tsx`
  - `src/routes/admin/staffs/index.tsx`
  - `src/routes/admin/staffs/create.tsx`
  - `src/routes/admin/staffs/$staffId.tsx`
  - `src/routes/admin/staff-roles/index.tsx`
  - `src/routes/admin/staff-roles/create.tsx`
  - `src/routes/admin/staff-roles/$staffRoleId.tsx`
  - `src/routes/admin/weapons/index.tsx`
  - `src/routes/admin/weapons/create.tsx`
  - `src/routes/admin/weapons/$weaponId.tsx`
  - `src/routes/admin/users/index.tsx`
  - `src/routes/admin/permissions/index.tsx`
  - `src/routes/admin/costs/index.tsx`

## Acceptance checklist

- No `LocaleKeys` import or usage in `src/routes/**`.
- All translation keys use `getTranslationToken(namespace, key)`.
- Keys resolve from correct namespaces in `src/i18n/keys/*`.
