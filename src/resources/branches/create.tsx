import { Create } from "@refinedev/mui";
import type { BaseRecord, HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { BranchForm, classDayOptions, normalizeClassDays } from "./BranchForm";
import type { BranchCreateInput, BranchFormValues } from "../../types/branch";

const defaultClassDays = classDayOptions;

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
  } = useForm<BaseRecord, HttpError, BranchFormValues>({
    refineCoreProps: {
      resource: "app_branches",
    },
    defaultValues: {
      branch_name_en: "",
      branch_name_kn: "",
      category_id: "",
      batch_id: "",
      valaya_id: "",
      country_id: "",
      state_id: "",
      district_id: "",
      region_id: "",
      status_id: "",
      medium_id: "",
      full_address_en: "",
      full_address_kn: "",
      class_days: defaultClassDays,
      class_timings: "",
      pincode: "",
      area_en: "",
      area_kn: "",
      nagara_en: "",
      nagara_kn: "",
      upa_nagara_en: "",
      upa_nagara_kn: "",
      mukhyashikshak_en: "",
      mukhyashikshak_kn: "",
      contact_number: "",
      whatsapp_number: "",
      spyss_main_contact_number: "9481580160",
      email_id: "",
      is_active: true,
    },
  });

  const selectedStateId = watch("state_id");
  const selectedDistrictId = watch("district_id");

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

    const payload: BranchCreateInput = {
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
      valaya_id: values.valaya_id,
      region_id: values.region_id?.trim() || null,
      class_days: normalizeClassDays(values.class_days),
      class_timings: values.class_timings.trim(),
      pincode: values.pincode.trim(),
      latitude: normalizeOptionalNumber(values.latitude),
      longitude: normalizeOptionalNumber(values.longitude),
      google_location_link: values.google_location_link?.trim() || null,
      contact_number: values.contact_number.trim(),
      whatsapp_number: values.whatsapp_number?.trim() || null,
      spyss_main_contact_number: values.spyss_main_contact_number?.trim() || "9481580160",
      email_id: values.email_id?.trim() || null,
      branch_start_date: values.branch_start_date?.trim() || null,
      is_active: values.is_active ?? true,
    };

    console.log("BranchCreate payload for app_branches:", payload);
    return onFinish(payload as never);
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
