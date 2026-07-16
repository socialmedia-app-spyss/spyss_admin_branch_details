import type { HttpError } from "@refinedev/core";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { useEffect } from "react";
import type { Event, EventInput } from "../../types/event";
import { EventForm } from "./EventForm";
import { normalizeEvent } from "./create";

export const EventEdit = () => {
  const {
    saveButtonProps,
    register,
    control,
    getValues,
    handleSubmit,
    setValue,
    formState: { errors },
    refineCore: { onFinish, query },
  } = useForm<Event, HttpError, EventInput>();

  const record = query?.data?.data;

  useEffect(() => {
    if (!record) return;
    setValue("start_datetime", record.start_datetime ?? null);
    setValue("end_datetime", record.end_datetime ?? null);
    setValue("is_active", record.is_active);
  }, [record?.id, record?.start_datetime, record?.end_datetime, record?.is_active, setValue]);

  return (
    <Edit
      title="Edit Event"
      saveButtonProps={{ ...saveButtonProps, onClick: handleSubmit((values) => onFinish(normalizeEvent(values))) }}
    >
      <EventForm register={register} control={control} errors={errors} getValues={getValues} />
    </Edit>
  );
};
