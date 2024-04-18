import * as v from "valibot";

export const SubmitEventValue = v.object({
  type: v.string(),
  payload: v.unknown(),
});

// https://github.com/edmundhung/conform/blob/f955e1c5ba1fd1014c83bc3a1ba4fb215941a108/packages/conform-dom/submission.ts#L310-L321
export const ResetIntentValue = v.object({
  name: v.optional(v.string()),
});

// https://github.com/edmundhung/conform/blob/f955e1c5ba1fd1014c83bc3a1ba4fb215941a108/packages/conform-dom/submission.ts#L323-L340
export const UpdateIntentValue = v.object({
  name: v.string(),
  value: v.unknown(),
});

// https://github.com/edmundhung/conform/blob/1964a3981f0a18703744e3a80ad1487073d97e11/packages/conform-dom/submission.ts#L350-L359
export const InsertIntentValue = v.object({
  name: v.string(),
  index: v.optional(v.number()),
  defaultValue: v.optional(v.unknown()),
});

// https://github.com/edmundhung/conform/blob/1964a3981f0a18703744e3a80ad1487073d97e11/packages/conform-dom/submission.ts#L342-L348
export const RemoveIntentValue = v.object({
  name: v.string(),
  index: v.number(),
});

// https://github.com/edmundhung/conform/blob/1964a3981f0a18703744e3a80ad1487073d97e11/packages/conform-dom/submission.ts#L361-L368
export const ReorderIntentValue = v.object({
  name: v.string(),
  from: v.number(),
  to: v.number(),
});
