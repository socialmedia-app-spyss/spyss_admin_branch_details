import { Edit } from "@refinedev/mui";
import type { BaseRecord, HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { BranchForm, normalizeClassDays } from "./BranchForm";
import type { BranchCreateInput } from "../../types/branch";

const normalizeOptionalString = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const BranchEdit = () => {
  const {
    saveButtonProps,
    register,
    formState: { errors },
    control,
    setValue,
    watch,
    handleSubmit,
    refineCore: { onFinish, query },
  } = useForm<BaseRecord, HttpError, BranchCreateInput>();

  const selectedStateId = watch("state_id");
  const selectedDistrictId = watch("district_id");

  const handleFinish = (values: BranchCreateInput) =>
    onFinish({
      ...values,
      area: normalizeOptionalString(values.area),
      class_days: normalizeClassDays(values.class_days),
      google_location_link: values.google_location_link?.trim(),
      email_id: normalizeOptionalString(values.email_id),
      whatsapp_number: normalizeOptionalString(values.whatsapp_number),
      branch_start_date: normalizeOptionalString(values.branch_start_date),
    });

  return (
    <Edit
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
        applyDefaults={false}
        initialClassTimings={query?.data?.data?.class_timings as string | undefined}
      />
    </Edit>
  );
};
