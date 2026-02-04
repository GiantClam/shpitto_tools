export const textField = (label: string) => ({ type: "text", label });
export const textareaField = (label: string) => ({ type: "textarea", label });
export const numberField = (label: string) => ({ type: "number", label });
export const booleanField = (label: string) => ({ type: "checkbox", label });
export const selectField = (label: string, options: string[]) => ({
  type: "select",
  label,
  options: options.map((value) => ({ value, label: value })),
});
export const listField = (label: string, fields: Record<string, any>) => ({
  type: "array",
  label,
  itemFields: fields,
});
