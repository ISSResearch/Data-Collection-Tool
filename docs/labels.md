# 🧩 Labels

Each project uses a label schema to annotate the data being collected These can be:

- Flat or hierarchical
- Required or optional
- Single or multiple choice

---

## 🛠️ Defining a Schema

1. When creating a project or later in the Project → Edit tab

<img src="/docs/assets/" alt="labels">

2. Add Tree-like Levels

<img src="/docs/assets/" alt="labels_level">

3. Add Values per level, with optional nesting. Each value is an actual label used during annotation.

<img src="/docs/assets/" alt="labels_value">

4. Set flags like:
  - required
  - multiple choice

<img src="/docs/assets/" alt="labels_flags">

5. Each label value could have a payload. This is a meta information in valid json/string format.
You can set restricted flag which sets if payload is required
Examples:
- label payload
- {"field1": "value1", "type": 1, "list": ["metalist1", "metalist2"]}
- ["meta1", "meta2"]

<img src="/docs/assets/" alt="labels_payload">

6. You can do a quick renaming with special form.

<img src="/docs/assets/" alt="labels_rename">

7. You can change alignment of values.

<img src="/docs/assets/" alt="labels_align">

8. Deleting may be performed only when no media is assigned to such label or level of labels.
When you hit remove (`minus`) button - the popup will tell you if this item cannot be removed.
If you really want to remove it even when it's restricted you could change labeling at validation tab to remove association

<img src="/docs/assets/" alt="labels_delete">

9. Grouping
Each block represents a separate attribute tree (e.g., color, shape, type).
In order to add another label with different meaning you press "Add attribute" at the top.
I.E. each feature has its own tree / block/

To remove a group completely you have to delete all the levels.

<img src="/docs/assets/" alt="labels_add">

## 📤 Applying Schema

When [uploading data](/docs/uploads.md), you assign the schema:
- With special form to apply tree o the whole set you uploaded
- Or manually, item by item

These methods can be used simultaneously

<img src="/docs/assets/" alt="labels_apply">

The label hierarchy defined in the project could be set several times by clicking `add object` button.
This will create a new block with its own hierarchy.
This might be useful if your image for example has several annotated objects like cars or animals.

<img src="/docs/assets/" alt="labels_apply_new">

Each group can be easily deleted or copied.

<img src="/docs/assets/" alt="labels_apply_del-cp">

## 📝 Validation Stage

During [validation](/docs/validation.md), labels can be you have same tree you assigned on Upload stage with the same management.

<img src="/docs/assets/" alt="labels_validate">

## 🔍 Filtering

At some pages there is an option to use Schema labels as filters.
The usage is almost the same as you apply labels to the media.
When you are done with tree click `select` button.

<img src="/docs/assets/" alt="labels_filter">

## ✅ Next Step

[Users and Roles](/docs/users.md)
