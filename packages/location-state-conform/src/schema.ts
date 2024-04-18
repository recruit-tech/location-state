import * as v from "valibot";

export const SubmitEventValue = v.object({
  type: v.string(),
  payload: v.unknown(),
});

export const ResetIntentValue = v.object({
  name: v.optional(v.string()),
});

export const UpdateIntentValue = v.object({
  name: v.string(),
  value: v.unknown(),
});

export const InsertIntentValue = v.object({
  name: v.string(),
  index: v.optional(v.number()),
  defaultValue: v.optional(v.unknown()),
});

export const RemoveIntentValue = v.object({
  name: v.string(),
  index: v.number(),
});

export const ReorderIntentValue = v.object({
  name: v.string(),
  from: v.number(),
  to: v.number(),
});
