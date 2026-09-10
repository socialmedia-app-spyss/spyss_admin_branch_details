import { useEffect } from "react";
import type { HttpError } from "@refinedev/core";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { CarouselForm } from "./CarouselForm";
import { normalizeCarousel } from "./normalizeCarousel";
import type { AppCarousel, AppCarouselInput } from "../../types/carousel";

export const CarouselEdit = () => {
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
  } = useForm<AppCarousel, HttpError, any>();

  const record = query?.data?.data;

  useEffect(() => {
    if (!record) return;

    setValue("carousel_code", record.carousel_code || "");
    setValue("action_type", record.action_type || "NONE");
    setValue("action_value", record.action_value ?? "");
    setValue("start_at", record.start_at ?? null);
    setValue("end_at", record.end_at ?? null);
    setValue("is_active", record.is_active ?? true);
    setValue("default_locale", record.default_locale || "en");

    const translations = record.translations || {};
    const en = translations.en || {};
    const kn = translations.kn || {};

    setValue("image_url_en", en.image_url || "");
    setValue("title_en", en.title ?? "");
    setValue("subtitle_en", en.subtitle ?? "");
    setValue("alt_text_en", en.alt_text ?? "");
    setValue("description_en", en.description ?? "");

    setValue("image_url_kn", kn.image_url ?? "");
    setValue("title_kn", kn.title ?? "");
    setValue("subtitle_kn", kn.subtitle ?? "");
    setValue("alt_text_kn", kn.alt_text ?? "");
    setValue("description_kn", kn.description ?? "");
    setValue("translations", translations);
  }, [record, setValue]);

  const onSubmit = (values: AppCarouselInput) => {
    const payload = normalizeCarousel(values);
    return onFinish(payload);
  };

  return (
    <Edit
      title="Edit Carousel Banner"
      saveButtonProps={{
        ...saveButtonProps,
        onClick: handleSubmit(onSubmit),
      }}
    >
      <CarouselForm
        register={register}
        control={control}
        errors={errors}
        getValues={getValues}
        setValue={setValue}
        watch={watch}
      />
    </Edit>
  );
};
