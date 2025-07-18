# 📤 Uploads

<img src="/docs/assets/project_upload.gif" alt="upload">

## 🔍 Select Files

Upload images or videos. The UI shows thumbnails for each selected file.

You can do that by:
 - Drag and dropping your files
 - Clicking `Add Media` button at the top left corner

## 🧱 Annotate with Label Trees

Each image/video could be annotated using a label schema you've defined earlier.

You can:

- `Add Object`: Adds another instance of the label tree per image (useful for multiple cars/objects in one image).
- `Delete Group`: Removes that label instance.
- `Copy Group`: Clones an existing label set within the item.

<img src="/docs/assets/label_del_copy" alt="uploads_groups">

## 🌀 Batch Apply
The block on the left is for applying one label tree to all selected media.

You define the values.
Hit `apply to all` → auto-fills that tree across items.

# 🔍 Interactive Media

Click any image to zoom in. Useful for small objects or cluttered scenes.
This helps especially when annotating dense scenes or small objects.

<img src="/docs/assets/upload_zoom.gif" alt="uploads_zoom">

## ⏳ Uploading

Once done labeling:
Click `Upload` at the top right corner
Files get submitted to the server for processing.

You will be redirected to dedicated page showing the uploading state

Once all media marked either green or red according to success status
you are free to leave the page.

Server will:

- **Check** for duplicates
- **Store** label metadata
- **Delay** validation access until checks complete

---

### ✅ Next Step

- [Validation](/docs/validation.md)
