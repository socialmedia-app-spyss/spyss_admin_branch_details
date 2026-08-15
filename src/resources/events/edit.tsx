import type { HttpError } from "@refinedev/core";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { useEffect } from "react";
import type { Event, EventInput } from "../../types/event";
import { EventForm } from "./EventForm";
import { normalizeEvent } from "./normalizeEvent";

export const EventEdit = () => {
  const {
    saveButtonProps,
    register,
    control,
    getValues,
    handleSubmit,
    reset,
    formState: { errors },
    refineCore: { onFinish, query },
  } = useForm<Event, HttpError, EventInput>();

  const record = query?.data?.data;

  useEffect(() => {
    if (!record) return;
    reset({
      event_name_en: record.event_name_en ?? "",
      event_name_kn: record.event_name_kn ?? "",
      short_description_en: record.short_description_en ?? "",
      short_description_kn: record.short_description_kn ?? "",
      full_description_en: record.full_description_en ?? "",
      full_description_kn: record.full_description_kn ?? "",
      start_datetime: record.start_datetime ?? null,
      end_datetime: record.end_datetime ?? null,
      location_en: record.location_en ?? "",
      location_kn: record.location_kn ?? "",
      registration_link: record.registration_link ?? "",
      image_url_en: record.image_url_en ?? "",
      image_url_kn: record.image_url_kn ?? "",
      is_active: record.is_active,
    });
  }, [record, reset]);

  return (
    <Edit
      title="Edit Event"
      saveButtonProps={{ ...saveButtonProps, onClick: handleSubmit((values) => onFinish(normalizeEvent(values))) }}
    >
      <EventForm register={register} control={control} errors={errors} getValues={getValues} />
    </Edit>
  );
};
