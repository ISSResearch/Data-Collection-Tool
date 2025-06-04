# 👥 Users & Roles

To operate the system, at least one user must be created via CLI:

```bash
make init-admin
```

## 🔑 Roles
- Admin – full access across the system
- Collector / Common User – limited role; permissions are set per project

## 🧾 User Creation
- Admins: created manually or promoted from a common user
- Self-registered users: have no access until granted project-specific permissions

<img src="/docs/assets/" alt="register">

## Permissions
Permissions are managed per project under:
Project → Edit tab → USER VISIBILITY

There you’ll see a list of users and a cross-table of permissions.
Click SUBMIT VISIBILITY to save changes.

<img src="/docs/assets/" alt="permissions">

Permission types:
- Can view project – appears in list and is accessible
- Can upload – access to upload and goal tabs
- Can view files – access to validation; sees own uploads only
- Can validate – full access to validation; can edit labels
- Can view stats – access to statistics
- Can download – access to download
- Can edit – access to edit; can modify project

## ✅ Next Step

[Uploads](/docs/uploads.md)
