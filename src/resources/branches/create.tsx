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
      branch_name_en: "",
      branch_name_kn: "",
      category_id: "",
      batch_id: "",
      valaya_id: "",
      country_id: "",
      state_id: "",
      district_id: "",
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
    },
  });

  const selectedStateId = watch("state_id");
  const selectedDistrictId = watch("district_id");

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
