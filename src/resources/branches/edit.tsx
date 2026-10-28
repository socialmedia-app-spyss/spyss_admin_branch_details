import { useEffect } from "react";
import { Edit } from "@refinedev/mui";
import { useGetIdentity, type HttpError } from "@refinedev/core";
import { Typography } from "@mui/material";
import { useForm } from "@refinedev/react-hook-form";
import { BranchForm, normalizeClassDays } from "./BranchForm";
import type {
  Branch,
  BranchFormValues,
  BranchUpdateInput,
} from "../../types/branch";
import type { UserProfile } from "../../types/user";

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
    reset,
    watch,
    clearErrors,
    handleSubmit,
    refineCore: { onFinish, query },
  } = useForm<Branch, HttpError, BranchFormValues>({
    refineCoreProps: {
      resource: "app_branches",
    },
  });

  const selectedStateId = watch("state_id");
  const selectedDistrictId = watch("district_id");
  const record = query?.data?.data;
  const isValayaAdmin = identity?.role === "VALAYA_ADMIN";
  const accessibleValayaIds =
    identity?.accessible_valaya_ids && identity.accessible_valaya_ids.length > 0
      ? identity.accessible_valaya_ids
      : identity?.valaya_id
        ? [identity.valaya_id]
        : [];
  const canAccessRecord =
    !isValayaAdmin ||
    !record?.valaya_id ||
    accessibleValayaIds.includes(record.valaya_id as string);

  // When branch record loads from app_branches, populate the flat form state
  useEffect(() => {
    if (!record) return;

    reset({
      branch_name_en: record.branch_name?.en ?? "",
      branch_name_kn: record.branch_name?.kn ?? "",
      full_address_en: record.full_address?.en ?? "",
      full_address_kn: record.full_address?.kn ?? "",
      area_en: record.area?.en ?? "",
      area_kn: record.area?.kn ?? "",
      nagara_en: record.nagara?.en ?? "",
      nagara_kn: record.nagara?.kn ?? "",
      upa_nagara_en: record.upa_nagara?.en ?? "",
      upa_nagara_kn: record.upa_nagara?.kn ?? "",
      mukhyashikshak_en: record.mukhyashikshak?.en ?? "",
      mukhyashikshak_kn: record.mukhyashikshak?.kn ?? "",
      category_id: record.category_id ?? "",
      batch_id: record.batch_id ?? "",
      valaya_id: record.valaya_id ?? "",
      country_id: record.country_id ?? "",
      state_id: record.state_id ?? "",
      district_id: record.district_id ?? "",
      region_id: record.region_id ?? "",
      status_id: record.status_id ?? "",
      medium_id: record.medium_id ?? "",
      class_days: normalizeClassDays(record.class_days),
      class_timings: record.class_timings ?? "",
      pincode: record.pincode ?? "",
      latitude: record.latitude ?? null,
      longitude: record.longitude ?? null,
      google_location_link: record.google_location_link ?? "",
      contact_number: record.contact_number ?? "",
      whatsapp_number: record.whatsapp_number ?? "",
      spyss_main_contact_number: record.spyss_main_contact_number ?? "9481580160",
      email_id: record.email_id ?? "",
      branch_start_date: record.branch_start_date ?? "",
      is_active: record.is_active ?? true,
    });
  }, [record, reset]);

  const handleFinish = (values: BranchFormValues) => {
    const nagaraObj =
      values.nagara_en?.trim() || values.nagara_kn?.trim()
        ? {
            en: values.nagara_en?.trim() || undefined,
            kn: values.nagara_kn?.trim() || undefined,
          }
        : {};

    const upaNagaraObj =
      values.upa_nagara_en?.trim() || values.upa_nagara_kn?.trim()
        ? {
            en: values.upa_nagara_en?.trim() || undefined,
            kn: values.upa_nagara_kn?.trim() || undefined,
          }
        : {};

    const payload: BranchUpdateInput = {
      branch_name: {
        en: values.branch_name_en.trim(),
        kn: values.branch_name_kn.trim(),
      },
      full_address: {
        en: values.full_address_en.trim(),
        kn: values.full_address_kn.trim(),
      },
      area: {
        en: values.area_en.trim(),
        kn: values.area_kn.trim(),
      },
      nagara: nagaraObj,
      upa_nagara: upaNagaraObj,
      mukhyashikshak: {
        en: values.mukhyashikshak_en.trim(),
        kn: values.mukhyashikshak_kn.trim(),
      },
      category_id: values.category_id,
      batch_id: values.batch_id,
      medium_id: values.medium_id,
      status_id: values.status_id,
      country_id: values.country_id,
      state_id: values.state_id,
      district_id: values.district_id,
      valaya_id: values.valaya_id?.trim() || null,
      region_id: values.region_id?.trim() || null,
      class_days: normalizeClassDays(values.class_days),
      class_timings: values.class_timings.trim(),
      pincode: values.pincode.trim(),
      latitude: normalizeOptionalNumber(values.latitude),
      longitude: normalizeOptionalNumber(values.longitude),
      google_location_link: values.google_location_link?.trim() || null,
      contact_number: values.contact_number.trim(),
      whatsapp_number: values.whatsapp_number?.trim() || null,
      spyss_main_contact_number:
        values.spyss_main_contact_number?.trim() ||
        record?.spyss_main_contact_number ||
        "9481580160",
      email_id: values.email_id?.trim() || null,
      branch_start_date: values.branch_start_date?.trim() || null,
      is_active: values.is_active ?? true,
    };

    console.log("BranchEdit update payload for app_branches:", payload);
    return onFinish(payload as never);
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
          clearErrors={clearErrors}
          selectedStateId={selectedStateId}
          selectedDistrictId={selectedDistrictId}
          applyDefaults={false}
          initialClassTimings={record?.class_timings}
        />
      )}
    </Edit>
  );
};
