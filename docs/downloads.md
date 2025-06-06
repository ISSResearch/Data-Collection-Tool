# 📥 Downloads

This section lets you download annotation results for a project.

<!-- <img src="/docs/assets/" alt="downloads"> -->

## 🎛️ Filter First

Use the filter block above to define which files should be included in the export.

<!-- <img src="/docs/assets/" alt="downloads"> -->

Once filters are set, you have two options:

- `get archive`:

This sends a request to build a downloadable archive with both the media and annotations.
Since it may include many files, this can take some time.

- `get annotation`:

This gives you only annotation data—no media included.
It includes all annotations matching the current filters.

<!-- <img src="/docs/assets/" alt="downloads_filters"> -->

## 📋 Archive Table

Once requested, all archives for the project are listed in a table below.

Column **requested** shows the exact filters used to generate each archive.

Click the download button to get the archive.

<!-- <img src="/docs/assets/" alt="downloads_table"> -->

Once the process completes, the row turns green. This means you can get your archive.

<!-- <img src="/docs/assets/" alt="downloads_table_ok"> -->

The archive process may fail.
In that case, the row turns red and the **result message** column shows what went wrong.

<!-- <img src="/docs/assets/" alt="downloads_table_fail"> -->

## ➕ Only New Files
When re-downloading later (e.g., the next day), you might want to include only new files.
Enable the `not downloaded before` flag to skip any files already included in past archives (based on the filters).
