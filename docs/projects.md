# 📁 Projects

Projects are the core unit of organization in the ISS Data Collection Tool.
Each project defines its own label system, goals, and data scope.

## 🔹 What is a Project?

A project groups:

- [A labeling taxonomy (flat or hierarchical)](/docs/labels.md)
- [Uploaded images/videos](/docs/uploads.md)
- [Collection goals (per label)](/docs/goals.md)
- [Assigned users with roles](/docs/users.md)

## 📤 Creating a Project

Only [admin/superusers](#-roles--access) can create new projects via the UI or API.

To create a project:
1. Log in as an admin
2. Go to **Projects** section (/projects)
3. Click **create project**
4. Fill out:
   - **Name of the project**
   - **Project Description**
   - **Label Schema**

<img src="/docs/assets/project_create.gif" alt="project_create">

Next you will be redirected back to list of projects.
Select your newly created one.

Each project has the following sections:
(admin users will see all sections; regular users will only see a subset)

- **Main info** → `/project/:id`
- [**upload data**](#-uploading) → `/project/:id/upload`
- [**validate data**](#-validation) → `/project/:id/validate`
- [**goals**](#-goals) → `/project/:id/goals`
- [**statistics**](#-stats-progress) → `/project/:id/stats`
- [**download data**](#-downloading-results) → `/project/:id/download`
- [**edit**](#-edit-project) → `/project/:id/edit`

More of that below

## 👥 Roles & Access

Users are split by admin/ non admin ones.
Admins have full access to the whole application and items;
Non admin users by default don't have any access to project or its data
so you need to manually edit the permissions for it if needed.

<img src="/docs/assets/project_roles.gif" alt="permissions">

See [Users & Roles](/docs/users.md) for how to manage users and set permissions

## 🖼️ Uploading

After creating you can upload images or videos.
After labeling and sending media to the server they will appear in validation section.
Note: media processing on the server side may cause a slight delay before visibility.

<img src="/docs/assets/project_upload.gif" alt="upload">

See [Uploads](/docs/uploads.md) for how to upload media

## 📝 Validation

When you are done with uploading you can validate this data whether it's applicable to your project or not.
Labels could be corrected there too.

<img src="/docs/assets/project_validate.gif" alt="validate">

See [Validation](/docs/validation.md) for how to validate/ see uploaded images

## 🧩 Label Schema

Each project might have a label schema, defining what’s being collected. Labels can be:

- Flat list (e.g. `Red`, `Green`, `Blue`)
- Hierarchical (e.g. `Animal > Dog > Labrador`)
- Required
- Multiple items

See [Labels](/docs/labels.md) for how to create and assign them.

## 🎯 Goals

Optionally, you can define target counts for labels (e.g. "Need 100 images of `Dog`").

<img src="/docs/assets/project_goals.gif" alt="goals">

See [Goals](/docs/goals.md) for how to create and track them.

## 📊 Stats & Progress

Each project has a brief dashboard shows the collected count grouped by:
- Labels
- Media type
- Validation type

<img src="/docs/assets/project_stats.gif" alt="stats">

See [Statistics](/docs/statistics.md)

## 🗃 Downloading Results

You can export annotated datasets as `.zip` archives with optional filters

<img src="/docs/assets/project_download.gif" alt="download">

See [Downloads](/docs/downloads.md) for how to request archives

## ⚙️ Edit project

You can at any time change project info, labels, permissions or delete the Project.
Deleting project won't cause to loose any data. It's just mark as hidden so it can be easily restored.

After you are done with editing click `SUBMIT EDIT`

User roles could set with dedicated button.

---

### ✅ Next Step

[Labels](/docs/labels.md)
