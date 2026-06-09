import { Create, useForm } from "@refinedev/mui";
import { TextField } from "@mui/material";

export const BranchCreate = () => {
  const { saveButtonProps, register } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <TextField {...register("branch_name")} label="Branch Name" fullWidth />
      <TextField {...register("city")} label="City" fullWidth />
    </Create>
  );
};