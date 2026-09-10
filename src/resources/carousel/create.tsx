import type { BaseRecord, HttpError } from "@refinedev/core";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { CarouselForm } from "./CarouselForm";
import { normalizeCarousel } from "./normalizeCarousel";
import type { AppCarouselInput } from "../../types/carousel";

export const CarouselCreate = () => {
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
  } = useForm<BaseRecord, HttpError, any>({
    defaultValues: {
      carousel_code: "",
      action_type: "NONE",
      action_value: "",
      start_at: null,
      end_at: null,
      is_active: true,
      default_locale: "en",
      image_url_en: "",
      title_en: "",
      subtitle_en: "",
      alt_text_en: "",
      description_en: "",
      image_url_kn: "",
      title_kn: "",
      subtitle_kn: "",
      alt_text_kn: "",
      description_kn: "",
    },
  });

  const onSubmit = (values: AppCarouselInput) => {
    const payload = normalizeCarousel(values);
    return onFinish(payload);
  };

  return (
    <Create
      title="Create Carousel Banner"
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
    </Create>
  );
};
