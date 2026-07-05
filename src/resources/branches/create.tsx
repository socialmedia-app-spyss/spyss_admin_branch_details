import { Create } from "@refinedev/mui";
import type { BaseRecord, HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { BranchForm, classDayOptions, normalizeClassDays } from "./BranchForm";
import type { BranchCreateInput } from "../../types/branch";

const defaultClassDays = classDayOptions;

const normalizeOptionalString = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizeOptionalNumber = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export const BranchCreate = () => {
  const {
    saveButtonProps,
    register,
    formState: { errors },
    control,
    setValue,
    watch,
    handleSubmit,
    refineCore: { onFinish },
  } = useForm<BaseRecord, HttpError, BranchCreateInput>({
    defaultValues: {
      branch_name: "",
      category_id: "",
      batch_id: "",
      valaya_id: "",
      state_id: "",
      district_id: "",
      status_id: "",
      medium_id: "",
      full_address: "",
      class_days: defaultClassDays,
      class_timings: "",
      pincode: "",
      country: "India",
      mukhyashikshak: "",
      contact_number: "",
    },
  });

  const selectedStateId = watch("state_id");
  const selectedDistrictId = watch("district_id");

  const handleFinish = (values: BranchCreateInput) => {
    const payload = {
      ...values,
      area: normalizeOptionalString(values.area),
      class_days: normalizeClassDays(values.class_days),
      latitude: normalizeOptionalNumber(values.latitude),
      longitude: normalizeOptionalNumber(values.longitude),
      google_location_link: values.google_location_link?.trim(),
      email_id: values.email_id?.trim(),
      whatsapp_number: values.whatsapp_number?.trim(),
      branch_start_date: normalizeOptionalString(values.branch_start_date),
    };

    console.log("BranchCreate final payload", payload);
    return onFinish(payload);
  };

  return (
    <Create
      saveButtonProps={{
        ...saveButtonProps,
        onClick: handleSubmit(handleFinish),
      }}
    >
      <BranchForm
        register={register}
        control={control}
        errors={errors}
        setValue={setValue}
        watch={watch}
        selectedStateId={selectedStateId}
        selectedDistrictId={selectedDistrictId}
      />
    </Create>
  );
};
