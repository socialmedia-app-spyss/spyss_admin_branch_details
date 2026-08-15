import type { BaseRecord, HttpError } from "@refinedev/core";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import type { EventInput } from "../../types/event";
import { EventForm } from "./EventForm";
import { normalizeEvent } from "./normalizeEvent";

export const EventCreate = () => {
  const {
    saveButtonProps,
    register,
    control,
    getValues,
    handleSubmit,
    formState: { errors },
    refineCore: { onFinish },
  } = useForm<BaseRecord, HttpError, EventInput>({
    defaultValues: {
      event_name_en: "",
      event_name_kn: "",
      short_description_en: "",
      short_description_kn: "",
      full_description_en: "",
      full_description_kn: "",
      start_datetime: null,
      end_datetime: null,
      location_en: "",
      location_kn: "",
      registration_link: "",
      image_url_en: "",
      image_url_kn: "",
      is_active: true,
    },
  });

  return (
    <Create
      title="Create Event"
      saveButtonProps={{ ...saveButtonProps, onClick: handleSubmit((values) => onFinish(normalizeEvent(values))) }}
    >
      <EventForm register={register} control={control} errors={errors} getValues={getValues} />
    </Create>
  );
};
