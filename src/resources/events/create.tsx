import type { HttpError } from "@refinedev/core";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { EventForm } from "./EventForm";
import { generateEventCode, normalizeEvent } from "./normalizeEvent";
import type { AppEvent, AppEventInput } from "../../types/event";

export const EventCreate = () => {
  const now = new Date();
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

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
  } = useForm<AppEvent, HttpError, any>({
    defaultValues: {
      event_code: generateEventCode(),
      version: 1,
      category: "GENERAL",
      title_en: "",
      title_kn: "",
      short_description_en: "",
      short_description_kn: "",
      full_description_en: "",
      full_description_kn: "",
      location_name_en: "",
      location_name_kn: "",
      address_en: "",
      address_kn: "",
      map_url: "",
      registration_link: "",
      contact_person_en: "",
      contact_person_kn: "",
      contact_phone: "",
      image_url_en: "",
      image_url_kn: "",
      start_datetime: now.toISOString(),
      end_datetime: nextHour.toISOString(),
      event_timezone: "Asia/Kolkata",
      visible_from: now.toISOString(),
      send_announcement_push: true,
      is_active: true,
    },
  });

  const onSubmit = (values: AppEventInput) => {
    const payload = normalizeEvent(values);
    return onFinish(payload);
  };

  return (
    <Create
      title="Create New App Event / Shibira"
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
        isEdit={false}
      />
    </Create>
  );
};
