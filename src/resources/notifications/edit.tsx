import { useEffect } from "react";
import type { HttpError } from "@refinedev/core";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { NotificationForm } from "./NotificationForm";
import { normalizeNotification } from "./normalizeNotification";
import type { AppNotification, AppNotificationInput } from "../../types/notification";

export const NotificationEdit = () => {
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
  } = useForm<AppNotification, HttpError, any>({
    mode: "onChange",
  });

  const record = query?.data?.data;

  useEffect(() => {
    if (!record) return;

    setValue("notification_code", record.notification_code || "");
    setValue("version", record.version || 1);
    setValue("priority", record.priority || "NORMAL");
    setValue("type", record.type || "GENERAL");
    setValue("target_type", record.target_type || "ALL");

    const targetPayload = record.target_payload || {};
    setValue("target_valaya_id", targetPayload.valaya_id || "");
    setValue("target_branch_id", targetPayload.branch_id || "");
    setValue("target_role", targetPayload.role || "");
    setValue("target_topic", targetPayload.topic || "");
    setValue("target_language", targetPayload.language || "kn");

    const title = record.title || {};
    const body = record.body || {};
    setValue("title_en", title.en || "");
    setValue("title_kn", title.kn || "");
    setValue("body_en", body.en || "");
    setValue("body_kn", body.kn || "");

    setValue("image_url", record.image_url || "");
    setValue("action_type", record.action_type || "NONE");

    const actionPayload = record.action_payload || {};
    setValue("action_url", actionPayload.url || "");
    setValue("action_event_id", actionPayload.event_id || "");
    setValue("action_branch_id", actionPayload.branch_id || "");

    setValue("date_time", record.date_time);
    setValue("expiry_date", record.expiry_date || null);
    setValue("send_status", record.send_status || "PENDING");
    setValue("is_active", record.is_active ?? true);
  }, [record, setValue]);

  const onSubmit = (values: AppNotificationInput) => {
    const payload = normalizeNotification(values);
    return onFinish(payload);
  };

  const titleText =
    record?.title?.en || record?.title?.kn || record?.notification_code || "Notification";

  return (
    <Edit
      title={`Edit Notification: ${titleText}`}
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
        isEdit={true}
      />
    </Edit>
  );
};
