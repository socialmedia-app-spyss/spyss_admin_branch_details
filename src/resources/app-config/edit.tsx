import { useEffect } from "react";
import type { HttpError } from "@refinedev/core";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { AppConfigForm } from "./AppConfigForm";
import { normalizeAppConfig } from "./normalizeAppConfig";
import type { AppConfig, AppConfigInput } from "../../types/appConfig";

export const AppConfigEdit = () => {
  const {
    saveButtonProps,
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
    refineCore: { onFinish, query },
  } = useForm<AppConfig, HttpError, any>();

  const record = query?.data?.data;

  useEffect(() => {
    if (!record) return;

    setValue("platform", record.platform);
    setValue("is_app_running", record.is_app_running);
    setValue("force_update_active", record.force_update_active);
    setValue("min_build_number", record.min_build_number);
    setValue("maintenance_title", record.maintenance_title);
    setValue("maintenance_message", record.maintenance_message);
    setValue("update_title", record.update_title);
    setValue("update_message", record.update_message);
    setValue("store_url", record.store_url);
  }, [record, setValue]);

  const onSubmit = (values: AppConfigInput) => {
    const payload = normalizeAppConfig(values);
    return onFinish(payload);
  };

  const platformTitle = record?.platform === "android" ? "Android (Google Play)" : record?.platform === "ios" ? "iOS (App Store)" : "App Platform";

  return (
    <Edit
      title={`Edit ${platformTitle} Configuration`}
      saveButtonProps={{
        ...saveButtonProps,
        onClick: handleSubmit(onSubmit),
      }}
    >
      <AppConfigForm
        register={register}
        control={control}
        errors={errors}
        getValues={getValues}
        setValue={setValue}
        watch={watch}
        isEdit={true}
      />
    </Edit>
  );
};
