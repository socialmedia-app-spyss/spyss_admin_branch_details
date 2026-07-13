import { Create } from "@refinedev/mui";
import type { BaseRecord, HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { NotificationForm } from "./NotificationForm";
import type { NotificationInput } from "../../types/notification";

const optionalText = (value?: string | null) => value?.trim() || null;
const optionalDate = (value?: string | null) => value ? new Date(value).toISOString() : null;

export const NotificationCreate = () => {
  const { saveButtonProps, register, control, handleSubmit, formState: { errors }, refineCore: { onFinish } } =
    useForm<BaseRecord, HttpError, NotificationInput>({
      defaultValues: { priority: "NORMAL", type: "GENERAL", title_en: "", body_en: "", title_kn: "", body_kn: "", date_time: null, expiry_date: null, is_active: true },
    });

  const submit = (values: NotificationInput) => onFinish({
    ...values,
    title_en: values.title_en.trim(), body_en: values.body_en.trim(),
    title_kn: optionalText(values.title_kn), body_kn: optionalText(values.body_kn),
    date_time: optionalDate(values.date_time), expiry_date: optionalDate(values.expiry_date),
  });

  return <Create title="Create Notification" saveButtonProps={{ ...saveButtonProps, onClick: handleSubmit(submit) }}>
    <NotificationForm register={register} control={control} errors={errors} />
  </Create>;
};
