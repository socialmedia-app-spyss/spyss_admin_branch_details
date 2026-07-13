import { Edit } from "@refinedev/mui";
import { useGetIdentity, type BaseRecord, type HttpError } from "@refinedev/core";
import { Typography } from "@mui/material";
import { useForm } from "@refinedev/react-hook-form";
import { BranchForm, normalizeClassDays } from "./BranchForm";
import type { BranchCreateInput } from "../../types/branch";
import type { UserProfile } from "../../types/user";

const normalizeOptionalString = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizeOptionalNumber = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export const BranchEdit = () => {
  const { data: identity } = useGetIdentity<UserProfile>();
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
  const record = query?.data?.data;
  const isValayaAdmin = identity?.role === "VALAYA_ADMIN";
  const accessibleValayaIds = identity?.accessible_valaya_ids ?? [];
  const canAccessRecord =
    !isValayaAdmin ||
    !record?.valaya_id ||
    accessibleValayaIds.includes(record.valaya_id as string);

  const handleFinish = (values: BranchCreateInput) => {
    const payload = {
      ...values,
      branch_name_en: values.branch_name_en.trim(),
      branch_name_kn: values.branch_name_kn.trim(),
      full_address_en: values.full_address_en.trim(),
      full_address_kn: values.full_address_kn.trim(),
      area_en: values.area_en.trim(),
      area_kn: values.area_kn.trim(),
      nagara_en: normalizeOptionalString(values.nagara_en),
      nagara_kn: normalizeOptionalString(values.nagara_kn),
      upa_nagara_en: normalizeOptionalString(values.upa_nagara_en),
      upa_nagara_kn: normalizeOptionalString(values.upa_nagara_kn),
      mukhyashikshak_en: values.mukhyashikshak_en.trim(),
      mukhyashikshak_kn: values.mukhyashikshak_kn.trim(),
      class_days: normalizeClassDays(values.class_days),
      latitude: normalizeOptionalNumber(values.latitude),
      longitude: normalizeOptionalNumber(values.longitude),
      google_location_link: values.google_location_link?.trim(),
      email_id: values.email_id?.trim(),
      whatsapp_number: values.whatsapp_number?.trim(),
      branch_start_date: normalizeOptionalString(values.branch_start_date),
    };

    console.log("BranchEdit final payload", payload);
    return onFinish(payload);
  };

  return (
    <Edit
      saveButtonProps={{
        ...saveButtonProps,
        disabled: saveButtonProps.disabled || !canAccessRecord,
        onClick: handleSubmit(handleFinish),
      }}
    >
      {!canAccessRecord ? (
        <Typography color="error">You do not have access to edit this branch.</Typography>
      ) : (
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
      )}
    </Edit>
  );
};
