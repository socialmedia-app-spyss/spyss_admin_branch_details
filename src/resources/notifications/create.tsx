import type { HttpError } from "@refinedev/core";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { NotificationForm } from "./NotificationForm";
import { generateNotificationCode, normalizeNotification } from "./normalizeNotification";
import type { AppNotification, AppNotificationInput } from "../../types/notification";

export const NotificationCreate = () => {
  const now = new Date();

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
  } = useForm<AppNotification, HttpError, any>({
    mode: "onChange",
    defaultValues: {
      notification_code: generateNotificationCode(),
      version: 1,
      priority: "NORMAL",
      type: "GENERAL",
      target_type: "ALL",
      target_valaya_id: "",
      target_branch_id: "",
      target_role: "",
      target_topic: "",
      target_language: "kn",
      title_en: "",
      title_kn: "",
      body_en: "",
      body_kn: "",
      image_url: "",
      action_type: "NONE",
      action_url: "",
      action_event_id: "",
      action_branch_id: "",
      date_time: now.toISOString(),
      expiry_date: null,
      send_status: "PENDING",
      is_active: true,
    },
  });

  const onSubmit = (values: AppNotificationInput) => {
    const payload = normalizeNotification(values);
    return onFinish(payload);
  };

  return (
    <Create
      title="Create New App Notification"
      saveButtonProps={{
        ...saveButtonProps,
        onClick: handleSubmit(onSubmit),
      }}
    >
      <NotificationForm
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
