import { Edit } from "@refinedev/mui";
import type { HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { useEffect } from "react";
import { NotificationForm } from "./NotificationForm";
import type { Notification, NotificationInput } from "../../types/notification";

const optionalText = (value?: string | null) => value?.trim() || null;
const optionalDate = (value?: string | null) => value ? new Date(value).toISOString() : null;

export const NotificationEdit = () => {
  const {
    saveButtonProps,
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    refineCore: { onFinish, query },
  } = useForm<Notification, HttpError, NotificationInput>();

  const record = query?.data?.data;

  useEffect(() => {
    if (!record) return;

    setValue("priority", record.priority);
    setValue("type", record.type);
    setValue("date_time", record.date_time ?? null);
    setValue("expiry_date", record.expiry_date ?? null);
    setValue("is_active", record.is_active);
  }, [
    record?.id,
    record?.priority,
    record?.type,
    record?.date_time,
    record?.expiry_date,
    record?.is_active,
    setValue,
  ]);

  const submit = (values: NotificationInput) => onFinish({
    ...values,
    title_en: values.title_en.trim(), body_en: values.body_en.trim(),
    title_kn: optionalText(values.title_kn), body_kn: optionalText(values.body_kn),
    date_time: optionalDate(values.date_time), expiry_date: optionalDate(values.expiry_date),
  });

  return <Edit title="Edit Notification" saveButtonProps={{ ...saveButtonProps, onClick: handleSubmit(submit) }}>
    <NotificationForm register={register} control={control} errors={errors} />
  </Edit>;
};
