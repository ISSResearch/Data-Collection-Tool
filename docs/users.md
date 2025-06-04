# 👥 Users & Roles

To operate the system, at least one user must be created via CLI using the make command.

```bash
make init-admin
```

## 🔑 Roles
Admin – full access across the system
Non Admin User / Collector – limited role. Permissions are configurable individually

## 🧾 User Creation
Admins: must be created manually or upgraded from common user

Self-registered users (via UI): start with no permissions

<img src="/docs/assets/" alt="register">

## Permissions
You must assign permissions manually on a per-project basis
Role assignment is granular and per project (can vary per user per project)

To assign permission follow the Project → Edit tab → USER VISIBILITY path.
There you will find a list of common users with cross table of persmissions per project.
When you are done with ediiting click `SUBMIT VISIBILITY` to save the state.

<img src="/docs/assets/" alt="permissions">

Permission meaning:
- Can view project: project is accesable in list of project and could be entered.
- Can upload: has access to `uload` and `goal` tabs. Can upload media files to the project.
- Can view files: has access to `validation` tab. Can see only self uloaded media.
- Can validate: has acccess to `validation tab`. Can see all uploaded media and validate them. can change labels.
- Can view stats: has access to `statistics` tab. Can see stats per project.
- Can download: has access to `download` tab. Can download uploaded files.
- Can edit: has access to `edit` tab. Can change project's data.

## ✅ Next Step

[Uploads](/docs/uploads.md)
