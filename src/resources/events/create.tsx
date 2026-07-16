import type { BaseRecord, HttpError } from "@refinedev/core";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import type { EventInput } from "../../types/event";
import { EventForm } from "./EventForm";

const optionalText = (value?: string | null) => value?.trim() || null;
const optionalDate = (value?: string | null) => value ? new Date(value).toISOString() : null;

const normalizeEvent = (values: EventInput): EventInput => ({
  ...values,
  event_name_en: values.event_name_en.trim(),
  event_name_kn: values.event_name_kn.trim(),
  short_description_en: values.short_description_en.trim(),
  short_description_kn: values.short_description_kn.trim(),
  full_description_en: values.full_description_en.trim(),
  full_description_kn: values.full_description_kn.trim(),
  start_datetime: optionalDate(values.start_datetime),
  end_datetime: optionalDate(values.end_datetime),
  location_en: values.location_en.trim(),
  location_kn: values.location_kn.trim(),
  registration_link: optionalText(values.registration_link),
  image_url_en: optionalText(values.image_url_en),
  image_url_kn: optionalText(values.image_url_kn),
});

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

export { normalizeEvent };
