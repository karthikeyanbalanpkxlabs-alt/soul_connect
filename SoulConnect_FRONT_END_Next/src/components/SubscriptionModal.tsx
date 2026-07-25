"use client";

import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { X, Plus, Trash } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
  initialData?: any;
}

const subscriptionValidationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  type: Yup.string().required("Type is required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .required("Price is required")
    .min(0, "Price must be positive"),
  currency_type: Yup.string().required("Currency is required"),
  plan: Yup.object().shape({
    period_value: Yup.number()
      .typeError("Value must be a number")
      .required("Plan period value is required")
      .min(1, "Must be at least 1"),
    period_type: Yup.string().required("Plan period type is required"),
  }),
  feature: Yup.array().of(
    Yup.object().shape({
      value: Yup.string().required("Feature value is required"),
    })
  ),
  most_popluar: Yup.boolean(),
  active: Yup.boolean(),
});

const defaultFormData = {
  name: "",
  type: "",
  price: "",
  currency_type: "₹",
  plan: {
    period_value: 1,
    period_type: "month",
  },
  feature: [] as { key: string; value: string }[],
  most_popluar: false,
  active: true,
};

export default function SubscriptionModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: SubscriptionModalProps) {
  const formik = useFormik({
    initialValues: initialData
      ? {
          ...defaultFormData,
          ...initialData,
        }
      : defaultFormData,
    enableReinitialize: true,
    validationSchema: subscriptionValidationSchema,
    onSubmit: (values) => {
      onSave(values);
    },
  });

  if (!isOpen) return null;

  const addFeatureField = () => {
    formik.setFieldValue("feature", [
      ...formik.values.feature,
      { key: "", value: "" },
    ]);
  };

  const removeFeatureField = (index: number) => {
    const list = [...formik.values.feature];
    list.splice(index, 1);
    formik.setFieldValue("feature", list);
  };

  const getInputClassName = (field: string) => {
    let isTouched = false;
    let isError: any = null;

    if (field === "plan.period_value") {
      isTouched = !!(formik.touched.plan as any)?.period_value;
      isError = (formik.errors.plan as any)?.period_value;
    } else if (field === "plan.period_type") {
      isTouched = !!(formik.touched.plan as any)?.period_type;
      isError = (formik.errors.plan as any)?.period_type;
    } else {
      isTouched = !!(formik.touched as any)[field];
      isError = (formik.errors as any)[field];
    }

    return `w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
      isTouched && isError
        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
        : "border-gray-300 focus:border-violet-500 focus:ring-violet-200"
    }`;
  };

  const renderFieldError = (field: string) => {
    let isTouched = false;
    let isError: any = null;

    if (field === "plan.period_value") {
      isTouched = !!(formik.touched.plan as any)?.period_value;
      isError = (formik.errors.plan as any)?.period_value;
    } else if (field === "plan.period_type") {
      isTouched = !!(formik.touched.plan as any)?.period_type;
      isError = (formik.errors.plan as any)?.period_type;
    } else {
      isTouched = !!(formik.touched as any)[field];
      isError = (formik.errors as any)[field];
    }

    if (isTouched && isError) {
      return (
        <span className="text-red-500 text-xs mt-1 block">
          {typeof isError === "string" ? isError : JSON.stringify(isError)}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? "Edit Subscription" : "Create Subscription"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form
            id="subscription-form"
            onSubmit={formik.handleSubmit}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. Premium Match"
                  className={getInputClassName("name")}
                />
                {renderFieldError("name")}
              </div>

              {/* Type */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Plan Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. premium"
                  className={getInputClassName("type")}
                />
                {renderFieldError("type")}
              </div>

              {/* Currency Type */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  name="currency_type"
                  value={formik.values.currency_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("currency_type")}
                >
                  <option value="₹">₹ (Rupee)</option>
                  <option value="$">$ (Dollar)</option>
                  <option value="€">€ (Euro)</option>
                  <option value="£">£ (Pound)</option>
                </select>
                {renderFieldError("currency_type")}
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="price"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. 2499"
                  className={getInputClassName("price")}
                />
                {renderFieldError("price")}
              </div>

              {/* Plan Period Value */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Period Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="plan.period_value"
                  value={formik.values.plan.period_value}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("plan.period_value")}
                />
                {renderFieldError("plan.period_value")}
              </div>

              {/* Plan Period Type */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Period Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="plan.period_type"
                  value={formik.values.plan.period_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={getInputClassName("plan.period_type")}
                >
                  <option value="day">Day(s)</option>
                  <option value="month">Month(s)</option>
                  <option value="year">Year(s)</option>
                </select>
                {renderFieldError("plan.period_type")}
              </div>
            </div>

            {/* Status Checks */}
            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="most_popluar"
                  name="most_popluar"
                  checked={formik.values.most_popluar}
                  onChange={formik.handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="most_popluar" className="text-sm font-medium text-gray-700 select-none">
                  Show as Most Popular plan
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formik.values.active}
                  onChange={formik.handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700 select-none">
                  Active
                </label>
              </div>
            </div>

            {/* Dynamic Features List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b pb-2">
                <label className="text-sm font-semibold text-gray-800">
                  Plan Features
                </label>
                <button
                  type="button"
                  onClick={addFeatureField}
                  className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
                >
                  <Plus size={16} /> Add Feature
                </button>
              </div>

              {formik.values.feature.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No features added yet. Click &quot;Add Feature&quot; to include them.</p>
              ) : (
                <div className="space-y-3">
                  {formik.values.feature.map((feat: { key: string; value: string }, index: number) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          name={`feature[${index}].value`}
                          value={feat.value}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder={`Feature description (e.g. View direct contact details)`}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:border-violet-500 focus:ring-violet-200"
                        />
                        {Array.isArray(formik.touched.feature) &&
                          formik.touched.feature[index] &&
                          Array.isArray(formik.errors.feature) &&
                          (formik.errors.feature[index] as any)?.value && (
                            <span className="text-red-500 text-xs block">
                              {(formik.errors.feature[index] as any).value}
                            </span>
                          )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeatureField(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                        title="Remove Feature"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="subscription-form"
            disabled={formik.isSubmitting}
            className="px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-sm font-medium text-white shadow-sm transition-colors disabled:opacity-50"
          >
            {formik.isSubmitting ? "Saving..." : "Save Package"}
          </button>
        </div>
      </div>
    </div>
  );
}
