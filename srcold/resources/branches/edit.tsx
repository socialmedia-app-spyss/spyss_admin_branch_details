import { Edit, useForm } from "@refinedev/mui";
import { TextField } from "@mui/material";

export const BranchEdit = () => {
  const { saveButtonProps, register } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <TextField {...register("branch_name")} label="Branch Name" fullWidth />
      <TextField {...register("city")} label="City" fullWidth />
    </Edit>
  );
};