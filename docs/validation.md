# ✅ Validation

<img src="/docs/assets/" alt="validation">

---

## 📂 Browse Uploads

See all uploaded media waiting for review.
Left sidebar lists files – click to load one into view.
Item card contains:
- Short file id
- Upload user
- Upload date

<img src="/docs/assets/" alt="validation_left">


- ✅ Green = approved
- ❌ Red = rejected
- 🔵 Gray = untouched

<img src="/docs/assets/" alt="validation_status">

Use filters at the top to narrow by status, label, date or author.

<img src="/docs/assets/" alt="validation_filter">

---

## 🎯 Review & Confirm Labels

Main canvas shows the media + label overlays.

<img src="/docs/assets/" alt="validation_middle">

Right sidebar holds the full label tree for that file along with file info such as:

- File id
- Validation user
- Validation date
- Label tree
- Manage buttons

<img src="/docs/assets/" alt="validation_right">

You can:

- View the media, move it, zoom
- Edit labels in-place
- Add/remove object groups
- Accept (✔) / Reject (✖)
- Download item

---

## 🖱️ Quick Navigation

Use these to streamline flow:

- `← / →` — switch file
- `X` — reset canvas state
- `A` — accept current
- `D` — reject current
- Hover on thumbnail to preview, click ⬇️ to download.

---

## 🧭 Done?

Once all files are green or red you can go to the next page if some exists.
This could be done only manualy by now.

---

## 🧬 Duplicate Detection System

This system improves data integrity, avoids duplication of annotation work, and improves the consistency of image usage throughout the dataset lifecycle.

The platform includes a **built-in duplicate detection mechanism** to streamline annotation workflows and prevents redundant effort.



Key Features
- `Automatic Detection`: Upon image upload or validation, the system checks whether the image already exists in the current project. Detected duplicates are flagged immediately.
- `Visual Indicator`: Duplicates are visually marked with a large `DUPLICATE` tag displayed directly on the image view.

<img src="/docs/assets/" alt="validation_right">

- `Best Quality Selection`: When duplicates are found, the system automatically selects the **best quality version** (e.g., higher resolution) as the *primary reference image*. This version will be used upon downloading
- `Duplication Browser`: A new **"show duplicates"** button has been added, allowing quick access to all known duplicates of a given image, side-by-side.

<img src="/docs/assets/" alt="validation_right">

- `User Decisions`: Annotators can manually resolve duplicates.

Duplicate checks currently operate **within a single project only**.
and will be **extended across all projects** in the future

---

## ✅ Next Step

- [Goals](/docs/goals.md)
