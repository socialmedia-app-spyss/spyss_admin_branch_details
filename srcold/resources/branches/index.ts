import { CreateButton, EditButton, ShowButton, DeleteButton } from "@refinedev/mui";

export const BranchResource = {
  name: "branches",

  list: "/branches",
  create: "/branches/create",
  edit: "/branches/edit/:id",
  show: "/branches/show/:id",

  meta: {
    canDelete: true,
  },
};