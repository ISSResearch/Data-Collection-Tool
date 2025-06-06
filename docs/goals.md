# 🎯 Goals

This tab lets you define and track annotation targets for specific labels.

<!-- <img src="/docs/assets/" alt="goals"> -->

---

## ➕ Create a Goal
To define a goal

1. Select a single label from any depth of the hierarchy.
2. Set the desired amount (how many annotated samples you want).
3. Define media weights for:
 - 🖼️ Images (e.g., 1)
 - 🎞️ Videos (e.g., 2)

<!-- <img src="/docs/assets/" alt="goals_create"> -->

A goal is considered fulfilled when the weighted sum of validated data reaches the target:

Example - Goal = 5, image weight = 1, video weight = 2
You can complete the goal with 5 images, or 2 videos + 1 image, etc.

---

## 📊 Goal Table

Active goals are listed with:

- Label name
- Media weights
- Completed count
- Remaining amount
- Items on validation
- Validation progress

The table is sorted by progress (least done on top) for better prioritization.

<!-- <img src="/docs/assets/" alt="goals_table"> -->

Goals are hidden once fulfilled, to keep focus on active targets.
Toggle `show all` to view past goals or completed ones.

---

## ✅ Next Step

- [Statistics](/docs/statistics.md)
