import type { HttpError } from "@refinedev/core";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import type { DailyPanchanga, DailyPanchangaInput } from "../../types/panchanga";
import { PanchangaForm } from "./PanchangaForm";
import { normalizePanchanga } from "./create";

export const PanchangaEdit = () => {
  const form = useForm<DailyPanchanga, HttpError, DailyPanchangaInput>();
  return <Edit title="Edit Daily Panchanga" saveButtonProps={{ ...form.saveButtonProps, onClick: form.handleSubmit((values) => form.refineCore.onFinish(normalizePanchanga(values))) }}>
    <PanchangaForm register={form.register} control={form.control} errors={form.formState.errors} />
  </Edit>;
};
