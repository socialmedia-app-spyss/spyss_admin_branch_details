import {useShow, useTable, useGetIdentity, useList} from "@refinedev/core";
import { Branch } from "./types/branch";
import {Event} from "./types/event.ts";

export const TempRefineApiCheck = () => {
    const show = useShow();
    const table = useTable();
    const identity = useGetIdentity();

    const showResult = useList<Event>();

    console.log(showResult.);
    console.log(show);
    console.log(table);
    console.log(identity);

    return null;
};
