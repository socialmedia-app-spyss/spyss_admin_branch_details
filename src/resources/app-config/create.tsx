import { useEffect } from "react";
import type { HttpError } from "@refinedev/core";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { useLocation } from "react-router-dom";
import { AppConfigForm } from "./AppConfigForm";
import { getDefaultAppConfig, normalizeAppConfig } from "./normalizeAppConfig";
import type { AppConfig, AppConfigInput, Platform } from "../../types/appConfig";

export const AppConfigCreate = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const requestedPlatform = searchParams.get("platform") as Platform | null;

  const initialPlatform: Platform =
    requestedPlatform === "ios" ? "ios" : "android";

  const {
    saveButtonProps,
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
    refineCore: { onFinish },
  } = useForm<AppConfig, HttpError, any>({
    defaultValues: getDefaultAppConfig(initialPlatform),
  });

  const selectedPlatform = watch("platform") || initialPlatform;

  useEffect(() => {
    const defaults = getDefaultAppConfig(selectedPlatform);
    setValue("store_url", defaults.store_url);
    setValue("maintenance_title", defaults.maintenance_title);
    setValue("maintenance_message", defaults.maintenance_message);
    setValue("update_title", defaults.update_title);
    setValue("update_message", defaults.update_message);
    setValue("min_build_number", defaults.min_build_number);
    setValue("is_app_running", defaults.is_app_running);
    setValue("force_update_active", defaults.force_update_active);
  }, [selectedPlatform, setValue]);

  const onSubmit = (values: AppConfigInput) => {
    const payload = normalizeAppConfig(values);
    return onFinish(payload);
  };

  return (
    <Create
      title="Create App Platform Configuration"
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
        isEdit={false}
      />
    </Create>
  );
};
