import { useEffect } from "react";
import type { HttpError } from "@refinedev/core";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { EventForm } from "./EventForm";
import { normalizeEvent } from "./normalizeEvent";
import type { AppEvent, AppEventInput } from "../../types/event";

export const EventEdit = () => {
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
  } = useForm<AppEvent, HttpError, any>();

  const record = query?.data?.data;

  useEffect(() => {
    if (!record) return;

    setValue("event_code", record.event_code || "");
    setValue("version", record.version || 1);
    setValue("category", record.category || "GENERAL");

    const title = record.title || {};
    const shortDesc = record.short_description || {};
    const fullDesc = record.full_description || {};
    const locationName = record.location_name || {};
    const address = record.address || {};
    const contactPerson = record.contact_person || {};
    const imageUrl = record.image_url || {};

    setValue("title_en", title.en || "");
    setValue("title_kn", title.kn || "");

    setValue("short_description_en", shortDesc.en || "");
    setValue("short_description_kn", shortDesc.kn || "");

    setValue("full_description_en", fullDesc.en || "");
    setValue("full_description_kn", fullDesc.kn || "");

    setValue("location_name_en", locationName.en || "");
    setValue("location_name_kn", locationName.kn || "");

    setValue("address_en", address.en || "");
    setValue("address_kn", address.kn || "");

    setValue("contact_person_en", contactPerson.en || "");
    setValue("contact_person_kn", contactPerson.kn || "");

    setValue("image_url_en", imageUrl.en || "");
    setValue("image_url_kn", imageUrl.kn || "");

    setValue("map_url", record.map_url || "");
    setValue("registration_link", record.registration_link || "");
    setValue("contact_phone", record.contact_phone || "");

    setValue("start_datetime", record.start_datetime);
    setValue("end_datetime", record.end_datetime);
    setValue("event_timezone", record.event_timezone || "Asia/Kolkata");
    setValue("visible_from", record.visible_from);

    setValue("send_announcement_push", record.send_announcement_push ?? true);
    setValue("announcement_sent_at", record.announcement_sent_at || null);
    setValue("reminder_sent_at", record.reminder_sent_at || null);
    setValue("is_active", record.is_active ?? true);
  }, [record, setValue]);

  const onSubmit = (values: AppEventInput) => {
    const payload = normalizeEvent(values);
    return onFinish(payload);
  };

  const titleText = record?.title?.en || record?.title?.kn || record?.event_code || "Event";

  return (
    <Edit
      title={`Edit Event: ${titleText}`}
      saveButtonProps={{
        ...saveButtonProps,
        onClick: handleSubmit(onSubmit),
      }}
    >
      <EventForm
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
