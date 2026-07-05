import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue, type UseFormWatch } from "react-hook-form";
import { useGetIdentity } from "@refinedev/core";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { supabaseClient } from "../../supabaseClient";
import {
  getDistinctValayaOptions,
  getMatchingValayaIdForDistrict,
  type ValayaOption,
  type ValayaScopeRow,
} from "../../services/valayaScope";
import { resolveGoogleMapLink } from "../../utils/mapLinkResolver";
import type {
  BranchCreateInput,
  MasterBatch,
  MasterBranchStatus,
  MasterCategory,
  MasterDistrict,
  MasterMedium,
  MasterState,
  MasterValaya,
} from "../../types/branch";
import type { UserProfile } from "../../types/user";

type BranchFormValues = BranchCreateInput;

type BranchFormProps = {
  register: UseFormRegister<BranchFormValues>;
  control: Control<BranchFormValues>;
  errors: FieldErrors<BranchFormValues>;
  setValue: UseFormSetValue<BranchFormValues>;
  watch: UseFormWatch<BranchFormValues>;
  selectedStateId?: string;
  selectedDistrictId?: string;
  applyDefaults?: boolean;
  initialClassTimings?: string | null;
};

type MasterOptions = {
  categories: MasterCategory[];
  batches: MasterBatch[];
  states: MasterState[];
  districts: MasterDistrict[];
  valayas: MasterValaya[];
  statuses: MasterBranchStatus[];
  mediums: MasterMedium[];
};

const emptyOptions: MasterOptions = {
  categories: [],
  batches: [],
  states: [],
  districts: [],
  valayas: [],
  statuses: [],
  mediums: [],
};

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));
const ampm = ["AM", "PM"];
export const classDayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const normalizeClassDays = (days?: string[] | null) =>
  classDayOptions.filter((day) => days?.includes(day));

const convertToMinutes = (hour: string, minute: string, period: string): number => {
  let h = parseInt(hour, 10);
  const m = parseInt(minute, 10);

  if (period === "PM" && h !== 12) {
    h += 12;
  } else if (period === "AM" && h === 12) {
    h = 0;
  }

  return h * 60 + m;
};

const sortByDisplayOrder = <T extends { display_order: number }>(records: T[] | null) =>
  [...(records ?? [])].sort((a, b) => a.display_order - b.display_order);

const normalizeLabel = (value: string) => value.trim().toLowerCase().replace(/[\s_-]+/g, "");

const matchesOption = (value: string, expected: string) => normalizeLabel(value) === normalizeLabel(expected);

const findByNameOrCode = <T extends object>(
  records: T[],
  expected: string,
  nameKey: keyof T,
  codeKey: keyof T,
) =>
  records.find((record) => {
    const name = record[nameKey];
    const code = record[codeKey];
    return (
      (typeof name === "string" && matchesOption(name, expected)) ||
      (typeof code === "string" && matchesOption(code, expected))
    );
  });

const getBatchNameFromStartTime = (hour: string, minute: string, period: string) => {
  const startTimeInMinutes = convertToMinutes(hour, minute, period);

  if (startTimeInMinutes >= 2 * 60 && startTimeInMinutes <= 10 * 60 + 59) {
    return "Morning";
  }

  if (startTimeInMinutes >= 11 * 60 && startTimeInMinutes <= 15 * 60 + 59) {
    return "Afternoon";
  }

  if (startTimeInMinutes >= 16 * 60 && startTimeInMinutes <= 21 * 60 + 59) {
    return "Evening";
  }

  return "";
};

const normalizeBranchName = (value: string) => value.trim().replace(/\s+/g, " ");

const validateBranchName = (value: string) => {
  const branchName = normalizeBranchName(value);

  if (!branchName) {
    return "Branch name is required.";
  }

  if (branchName.length < 4) {
    return "Branch name must be at least 4 characters.";
  }

  if (branchName.length > 200) {
    return "Branch name must be 200 characters or fewer.";
  }

  if (/https?:\/\/|www\.|\.com|\.org|\.net|\.in/i.test(branchName)) {
    return "Branch name cannot be a URL.";
  }

  if (/\+?\d[\d\s().-]{8,}\d/.test(branchName)) {
    return "Branch name cannot be a phone number.";
  }

  if (!/^[A-Za-z ]+$/.test(branchName)) {
    return "Use English letters and spaces only.";
  }

  if (/^[0-9]+$/.test(branchName)) {
    return "Branch name cannot contain only numbers.";
  }

  if (!/[A-Za-z]/.test(branchName)) {
    return "Branch name cannot contain only special characters.";
  }

  const words = branchName.split(" ");
  const hasValidCasing = words.every((word) => word === "SPYSS" || /^[A-Z][a-z]*$/.test(word));

  if (!hasValidCasing) {
    return "Use title case, such as 'Mysuru Central'. If the name contains SPYSS, write it as SPYSS.";
  }

  return true;
};

const validatePhoneNumber = (value?: string | null) => {
  const phoneNumber = String(value ?? "").trim();

  if (!phoneNumber) {
    return "Contact number is required.";
  }

  if (!/^\+?[0-9\s()-]+$/.test(phoneNumber)) {
    return "Use numbers only. A plus sign is allowed only at the beginning.";
  }

  if ((phoneNumber.match(/\+/g) || []).length > 1 || (phoneNumber.includes("+") && !phoneNumber.startsWith("+"))) {
    return "A plus sign is allowed only at the beginning.";
  }

  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.length < 10) {
    return "Contact number must contain at least 10 digits.";
  }

  return true;
};

const normalizeOptionalNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
};

const getValidCoordinates = (latValue: string, lngValue: string) => {
  const lat = Number(latValue);
  const lng = Number(lngValue);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return {
    latitude: lat,
    longitude: lng,
  };
};

const extractCoordinatesFromGoogleMapsLink = (value?: string | null) => {
  const link = String(value ?? "").trim();

  if (!link) {
    return null;
  }

  const decodedLink = decodeURIComponent(link);
  const coordinatePatterns = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&]query=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&]ll=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&]center=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /\/search\/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
  ];

  for (const pattern of coordinatePatterns) {
    const match = decodedLink.match(pattern);
    const coordinates = match ? getValidCoordinates(match[1], match[2]) : null;

    if (coordinates) {
      return coordinates;
    }
  }

  return null;
};

export const BranchForm = ({
  register,
  control,
  errors,
  setValue,
  watch,
  selectedStateId,
  selectedDistrictId,
  applyDefaults = true,
  initialClassTimings,
}: BranchFormProps) => {
  const [options, setOptions] = useState<MasterOptions>(emptyOptions);
  const [startHour, setStartHour] = useState("");
  const [startMinute, setStartMinute] = useState("");
  const [startAmPm, setStartAmPm] = useState("");
  const [endHour, setEndHour] = useState("");
  const [endMinute, setEndMinute] = useState("");
  const [endAmPm, setEndAmPm] = useState("");
  const [valayaOptions, setValayaOptions] = useState<ValayaOption[]>([]);
  const [selectedValayaCode, setSelectedValayaCode] = useState("");
  const [isFetchingLatLng, setIsFetchingLatLng] = useState(false);
  const [latLngMessage, setLatLngMessage] = useState<string | null>(null);
  const defaultValuesApplied = useRef(false);
  const classTimingsParsed = useRef(false);
  const { data: identity } = useGetIdentity<UserProfile>();
  const classTimings = watch("class_timings");
  const selectedValayaId = watch("valaya_id");
  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const googleLocationLink = watch("google_location_link");
  const timingSource = classTimings || initialClassTimings;
  const isValayaAdmin = identity?.role === "VALAYA_ADMIN";
  const isSuperAdmin = identity?.role === "SUPER_ADMIN";

  useEffect(() => {
    const fetchMasterOptions = async () => {
      const [
        categories,
        batches,
        states,
        districts,
        valayas,
        statuses,
        mediums,
        distinctValayas,
      ] = await Promise.all([
        supabaseClient.from("master_categories").select("*").eq("is_active", true).order("display_order"),
        supabaseClient.from("master_batches").select("*").eq("is_active", true).order("display_order"),
        supabaseClient.from("master_states").select("*").eq("is_active", true).order("display_order"),
        supabaseClient.from("master_districts").select("*").eq("is_active", true).order("display_order"),
        supabaseClient.from("master_valayas").select("*").eq("is_active", true).order("display_order"),
        supabaseClient.from("master_branch_statuses").select("*").eq("is_active", true).order("display_order"),
        supabaseClient.from("master_mediums").select("*").eq("is_active", true).order("display_order"),
        getDistinctValayaOptions(),
      ]);

      setOptions({
        categories: sortByDisplayOrder(categories.data as MasterCategory[] | null),
        batches: sortByDisplayOrder(batches.data as MasterBatch[] | null),
        states: sortByDisplayOrder(states.data as MasterState[] | null),
        districts: sortByDisplayOrder(districts.data as MasterDistrict[] | null),
        valayas: sortByDisplayOrder(valayas.data as MasterValaya[] | null),
        statuses: sortByDisplayOrder(statuses.data as MasterBranchStatus[] | null),
        mediums: sortByDisplayOrder(mediums.data as MasterMedium[] | null),
      });
      setValayaOptions(distinctValayas);
    };

    fetchMasterOptions();
  }, []);

  useEffect(() => {
    if (!applyDefaults || defaultValuesApplied.current || options.categories.length === 0) {
      return;
    }

    const category = findByNameOrCode(options.categories, "General", "category_name", "category_code");
    const batch = findByNameOrCode(options.batches, "Morning", "batch_name", "batch_code");
    const state = findByNameOrCode(options.states, "Karnataka", "state_name", "state_code");
    const status = findByNameOrCode(options.statuses, "Active", "status_name", "status_code");
    const medium = findByNameOrCode(options.mediums, "Kannada", "medium_name", "medium_code");

    if (category) {
      setValue("category_id", category.id as string);
    }

    if (batch) {
      setValue("batch_id", batch.id as string);
    }

    if (state && !selectedStateId) {
      setValue("state_id", state.id as string);
    }

    if (status) {
      setValue("status_id", status.id as string);
    }

    if (medium) {
      setValue("medium_id", medium.id as string);
    }

    defaultValuesApplied.current = true;
  }, [applyDefaults, options.batches, options.categories, options.mediums, options.states, options.statuses, selectedStateId, setValue]);

  useEffect(() => {
    if (classTimingsParsed.current || !timingSource) {
      return;
    }

    const match = timingSource.match(/^(\d{1,2}):(\d{2}) (AM|PM) - (\d{1,2}):(\d{2}) (AM|PM)$/);

    if (!match) {
      return;
    }

    setStartHour(match[1].padStart(2, "0"));
    setStartMinute(match[2]);
    setStartAmPm(match[3]);
    setEndHour(match[4].padStart(2, "0"));
    setEndMinute(match[5]);
    setEndAmPm(match[6]);
    classTimingsParsed.current = true;
  }, [timingSource]);

  useEffect(() => {
    if (!applyDefaults && !classTimingsParsed.current) {
      return;
    }

    if (startHour && startMinute && startAmPm && endHour && endMinute && endAmPm) {
      setValue("class_timings", `${startHour}:${startMinute} ${startAmPm} - ${endHour}:${endMinute} ${endAmPm}`, {
        shouldValidate: true,
      });
    }
  }, [applyDefaults, endAmPm, endHour, endMinute, setValue, startAmPm, startHour, startMinute]);

  useEffect(() => {
    if (!applyDefaults && !classTimingsParsed.current) {
      return;
    }

    if (!startHour || !startMinute || !startAmPm) {
      return;
    }

    const batchName = getBatchNameFromStartTime(startHour, startMinute, startAmPm);
    if (!batchName) {
      setValue("batch_id", "", { shouldValidate: true });
      return;
    }

    const batch = findByNameOrCode(options.batches, batchName, "batch_name", "batch_code");

    if (batch) {
      setValue("batch_id", batch.id as string, { shouldValidate: true });
    }
  }, [applyDefaults, options.batches, setValue, startAmPm, startHour, startMinute]);

  const timingValidationMessage = useMemo(() => {
    if (!startHour || !startMinute || !startAmPm || !endHour || !endMinute || !endAmPm) {
      return "All start and end time components must be selected.";
    }

    const startTimeInMinutes = convertToMinutes(startHour, startMinute, startAmPm);
    const endTimeInMinutes = convertToMinutes(endHour, endMinute, endAmPm);

    if (endTimeInMinutes <= startTimeInMinutes) {
      return "End time must be greater than start time.";
    }

    return endTimeInMinutes - startTimeInMinutes >= 45 ? true : "Class timing must be at least 45 minutes.";
  }, [endAmPm, endHour, endMinute, startAmPm, startHour, startMinute]);

  const valayaRowsForSelectedCode = useMemo<ValayaScopeRow[]>(() => {
    if (isValayaAdmin) {
      return identity?.accessible_valaya_rows ?? [];
    }

    if (!selectedValayaCode) {
      return [];
    }

    return options.valayas.filter((valaya) => valaya.valaya_code === selectedValayaCode);
  }, [identity?.accessible_valaya_rows, isValayaAdmin, options.valayas, selectedValayaCode]);

  const filteredDistricts = useMemo(() => {
    const districtsForState = options.districts.filter((district) => district.state_id === selectedStateId);

    if (isValayaAdmin || selectedValayaCode) {
      const allowedDistrictIds = new Set(valayaRowsForSelectedCode.map((row) => row.district_id));
      return districtsForState.filter((district) => allowedDistrictIds.has(district.id));
    }

    return districtsForState;
  }, [isValayaAdmin, options.districts, selectedStateId, selectedValayaCode, valayaRowsForSelectedCode]);

  const safeDistrictValue = filteredDistricts.some((district) => district.id === selectedDistrictId)
    ? selectedDistrictId ?? ""
    : "";

  const displayedValayaOptions = useMemo(() => {
    if (!selectedValayaCode || valayaOptions.some((valaya) => valaya.valaya_code === selectedValayaCode)) {
      return valayaOptions;
    }

    return [
      ...valayaOptions,
      {
        id: selectedValayaId || selectedValayaCode,
        valaya_name: identity?.valaya_name || selectedValayaCode,
        valaya_code: selectedValayaCode,
      },
    ];
  }, [identity?.valaya_name, selectedValayaCode, selectedValayaId, valayaOptions]);
  const safeValayaCode = displayedValayaOptions.some((valaya) => valaya.valaya_code === selectedValayaCode)
    ? selectedValayaCode
    : "";

  const coordinateMapLink = useMemo(() => {
    const rawLatitude: unknown = latitude;
    const rawLongitude: unknown = longitude;

    if (rawLatitude === "" || rawLatitude === null || rawLatitude === undefined || rawLongitude === "" || rawLongitude === null || rawLongitude === undefined) {
      return "";
    }

    const lat = Number(rawLatitude);
    const lng = Number(rawLongitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return "";
    }

    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }, [latitude, longitude]);

  const trimmedGoogleLocationLink = String(googleLocationLink ?? "").trim();
  const canOpenGoogleLocationLink = trimmedGoogleLocationLink.startsWith("https://");

  useEffect(() => {
    const coordinates = extractCoordinatesFromGoogleMapsLink(googleLocationLink);

    if (!coordinates) {
      return;
    }

    if (latitude !== coordinates.latitude) {
      setValue("latitude", coordinates.latitude, { shouldDirty: true, shouldValidate: true });
    }

    if (longitude !== coordinates.longitude) {
      setValue("longitude", coordinates.longitude, { shouldDirty: true, shouldValidate: true });
    }
  }, [googleLocationLink, latitude, longitude, setValue]);

  const handleFetchLatLng = async () => {
    setLatLngMessage(null);

    if (!trimmedGoogleLocationLink) {
      setLatLngMessage("Please enter Google location link first.");
      return;
    }

    setIsFetchingLatLng(true);

    try {
      const result = await resolveGoogleMapLink(trimmedGoogleLocationLink);

      if (!result.success || result.latitude === undefined || result.longitude === undefined) {
        setLatLngMessage(result.error || "Could not fetch latitude and longitude.");
        return;
      }

      setValue("latitude", result.latitude, { shouldDirty: true, shouldValidate: true });
      setValue("longitude", result.longitude, { shouldDirty: true, shouldValidate: true });
      setLatLngMessage("Latitude and longitude fetched successfully.");
    } catch (error) {
      console.error("Fetch lat/long error:", error);
      setLatLngMessage("Failed to fetch latitude and longitude.");
    } finally {
      setIsFetchingLatLng(false);
    }
  };

  useEffect(() => {
    if (!identity) {
      return;
    }

    console.log("BranchForm Valaya scope", {
      role: identity.role,
      userValayaId: identity.valaya_id,
      valayaCode: identity.valaya_code,
      accessibleValayaRows: identity.accessible_valaya_rows,
      districtOptions: filteredDistricts,
    });
  }, [filteredDistricts, identity]);

  useEffect(() => {
    if (isValayaAdmin && identity?.valaya_code) {
      setSelectedValayaCode(identity.valaya_code);
      return;
    }

    if (selectedValayaId && options.valayas.length > 0) {
      const selectedValaya = options.valayas.find((valaya) => valaya.id === selectedValayaId);
      setSelectedValayaCode(selectedValaya?.valaya_code ?? "");
    }
  }, [identity?.valaya_code, isValayaAdmin, options.valayas, selectedValayaId]);

  useEffect(() => {
    if (!selectedDistrictId || valayaRowsForSelectedCode.length === 0) {
      return;
    }

    const matchingValayaId = getMatchingValayaIdForDistrict(valayaRowsForSelectedCode, selectedDistrictId);

    if (matchingValayaId && matchingValayaId !== selectedValayaId) {
      setValue("valaya_id", matchingValayaId, { shouldDirty: true, shouldValidate: true });
    }
  }, [selectedDistrictId, selectedValayaId, setValue, valayaRowsForSelectedCode]);

  return (
    <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <input type="hidden" {...register("medium_id", { required: "Medium is required." })} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            {...register("country", { required: "This field is required" })}
            label="Country *"
            fullWidth
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly: true }}
            error={!!errors.country}
            helperText={errors.country?.message || "Defaults to India."}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.state_id}>
            <InputLabel id="state-label">State *</InputLabel>
            <Controller
              name="state_id"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="state-label"
                  label="State *"
                  value={field.value || ""}
                  onChange={(event) => {
                    field.onChange(event);
                    setSelectedValayaCode("");
                    setValue("district_id", "", { shouldDirty: true, shouldValidate: true });
                    setValue("valaya_id", "", { shouldDirty: true, shouldValidate: true });
                  }}
                >
                  <MenuItem value="">Select state</MenuItem>
                  {options.states.map((state) => (
                    <MenuItem key={state.id} value={state.id}>
                      {state.state_name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText>{errors.state_id?.message || "Defaults to Karnataka. Select another state only if the branch is outside Karnataka."}</FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.district_id}>
            <InputLabel id="district-label">District *</InputLabel>
            <Controller
              name="district_id"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="district-label"
                  label="District *"
                  value={safeDistrictValue}
                  disabled={!selectedStateId || ((isSuperAdmin || !isValayaAdmin) && !selectedValayaCode)}
                  onChange={(event) => {
                    const districtId = event.target.value;
                    field.onChange(districtId);
                    setValue("district_id", districtId, { shouldDirty: true, shouldValidate: true });
                    const matchingValayaId = getMatchingValayaIdForDistrict(valayaRowsForSelectedCode, districtId);
                    setValue("valaya_id", matchingValayaId ?? "", { shouldDirty: true, shouldValidate: true });
                  }}
                >
                  <MenuItem value="">Select district</MenuItem>
                  {filteredDistricts.map((district) => (
                    <MenuItem key={district.id} value={district.id}>
                      {district.district_name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText>{errors.district_id?.message || "Select the district where the branch is located."}</FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.valaya_id}>
            <InputLabel id="valaya-label">Valaya *</InputLabel>
            <Controller
              name="valaya_id"
              control={control}
              rules={{
                validate: (value) =>
                  Boolean(selectedValayaCode && value) ||
                  "Select a Valaya and district combination.",
              }}
              render={() => (
                <Select
                  labelId="valaya-label"
                  label="Valaya *"
                  value={safeValayaCode}
                  disabled={isValayaAdmin}
                  onChange={(event) => {
                    const valayaCode = event.target.value;
                    setSelectedValayaCode(valayaCode);
                    setValue("district_id", "", { shouldDirty: true, shouldValidate: true });
                    setValue("valaya_id", "", { shouldDirty: true, shouldValidate: true });
                  }}
                >
                  <MenuItem value="">Select Valaya</MenuItem>
                  {displayedValayaOptions.map((valaya) => (
                    <MenuItem key={valaya.valaya_code} value={valaya.valaya_code}>
                      {valaya.valaya_name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText>
              {errors.valaya_id?.message ||
                (isValayaAdmin
                  ? "Valaya is fixed from your admin access. Select the district for this Valaya."
                  : "Choose a Valaya first, then select the district.")}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <TextField
            {...register("branch_name", {
              required: "Branch name is required.",
              setValueAs: (value) => normalizeBranchName(String(value ?? "")),
              validate: validateBranchName,
            })}
            label="Branch Name *"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.branch_name}
            helperText={
              errors.branch_name?.message ||
              "Use title case with English letters and spaces only, for example 'SPYSS Mysuru Central'."
            }
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            {...register("branch_start_date", { required: "Branch start date is required." })}
            label="Branch Start Date *"
            fullWidth
            type="date"
            InputLabelProps={{ shrink: true }}
            error={!!errors.branch_start_date}
            helperText={errors.branch_start_date?.message || "Select the date on which the branch started."}
          />
        </Grid>
      </Grid>

      <FormControl fullWidth error={!!errors.class_timings}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Class Timings *
        </Typography>
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2 }}>
          <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle2">Start Time</Typography>
            </Grid>
            <Grid item xs={4} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>HH</InputLabel>
                <Select value={startHour} label="HH" onChange={(event) => setStartHour(event.target.value)}>
                  {hours.map((hour) => (
                    <MenuItem key={hour} value={hour}>
                      {hour}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>MM</InputLabel>
                <Select value={startMinute} label="MM" onChange={(event) => setStartMinute(event.target.value)}>
                  {minutes.map((minute) => (
                    <MenuItem key={minute} value={minute}>
                      {minute}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>AM/PM</InputLabel>
                <Select value={startAmPm} label="AM/PM" onChange={(event) => setStartAmPm(event.target.value)}>
                  {ampm.map((period) => (
                    <MenuItem key={period} value={period}>
                      {period}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle2">End Time</Typography>
            </Grid>
            <Grid item xs={4} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>HH</InputLabel>
                <Select value={endHour} label="HH" onChange={(event) => setEndHour(event.target.value)}>
                  {hours.map((hour) => (
                    <MenuItem key={hour} value={hour}>
                      {hour}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>MM</InputLabel>
                <Select value={endMinute} label="MM" onChange={(event) => setEndMinute(event.target.value)}>
                  {minutes.map((minute) => (
                    <MenuItem key={minute} value={minute}>
                      {minute}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>AM/PM</InputLabel>
                <Select value={endAmPm} label="AM/PM" onChange={(event) => setEndAmPm(event.target.value)}>
                  {ampm.map((period) => (
                    <MenuItem key={period} value={period}>
                      {period}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            {...register("class_timings", {
              required: "Class timings are required.",
              validate: () => timingValidationMessage,
            })}
            label="Final Class Timings *"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly: true }}
            error={!!errors.class_timings}
            helperText={errors.class_timings?.message || "Select the start and end time. The batch is calculated automatically from the start time."}
          />
        </Box>
      </FormControl>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.category_id}>
            <InputLabel id="category-label">Category *</InputLabel>
            <Controller
              name="category_id"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field }) => (
                <Select {...field} labelId="category-label" label="Category *" value={field.value || ""}>
                  {options.categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.category_name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText>{errors.category_id?.message || "Defaults to General. Change it only when the branch belongs to a different category."}</FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.batch_id}>
            <InputLabel id="batch-label">Batch *</InputLabel>
            <Controller
              name="batch_id"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field }) => (
                <Select {...field} labelId="batch-label" label="Batch *" value={field.value || ""} disabled>
                  {options.batches.map((batch) => (
                    <MenuItem key={batch.id} value={batch.id}>
                      {batch.batch_name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText>{errors.batch_id?.message || "Calculated automatically from the class start time: morning, afternoon, or evening."}</FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.status_id}>
            <InputLabel id="status-label">Status *</InputLabel>
            <Controller
              name="status_id"
              control={control}
              rules={{ required: "Status is required." }}
              render={({ field }) => (
                <Select {...field} labelId="status-label" label="Status *" value={field.value || ""}>
                  {options.statuses.map((status) => (
                    <MenuItem key={status.id} value={status.id}>
                      {status.status_name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText>{errors.status_id?.message || "Select the current branch status."}</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>

      <TextField
        {...register("full_address", { required: "This field is required" })}
        label="Full Address *"
        fullWidth
        multiline
        minRows={3}
        InputLabelProps={{ shrink: true }}
        error={!!errors.full_address}
        helperText={errors.full_address?.message || "Enter the complete address, including landmark or building details if available."}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            {...register("area", {
              required: "Area is required.",
              setValueAs: (value) => String(value ?? "").trim().replace(/\s+/g, " "),
              minLength: { value: 3, message: "Area must be at least 3 characters." },
              maxLength: { value: 30, message: "Area must be 30 characters or fewer." },
            })}
            label="Area *"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.area}
            helperText={errors.area?.message || "Enter the locality, neighborhood, or area name."}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            {...register("pincode", {
              required: "Pincode is required.",
              setValueAs: (value) => String(value ?? "").trim(),
              validate: (value) => /^\d{6}$/.test(String(value ?? "")) || "Pincode must be exactly 6 digits.",
            })}
            label="Pincode *"
            fullWidth
            inputProps={{ inputMode: "numeric", maxLength: 6 }}
            InputLabelProps={{ shrink: true }}
            error={!!errors.pincode}
            helperText={errors.pincode?.message || "Enter the 6-digit postal pincode."}
          />
        </Grid>
      </Grid>

      <FormControl fullWidth error={!!errors.class_days}>
        <InputLabel id="class-days-label">Class Days *</InputLabel>
        <Controller
          name="class_days"
          control={control}
          rules={{ required: "This field is required" }}
          render={({ field }) => (
            <Select
              multiple
              labelId="class-days-label"
              label="Class Days *"
              value={normalizeClassDays(field.value || [])}
              onChange={(event) => {
                const value = event.target.value;
                field.onChange(normalizeClassDays(typeof value === "string" ? value.split(",") : value));
              }}
            >
              {classDayOptions.map((day) => (
                <MenuItem key={day} value={day}>
                  {day}
                </MenuItem>
              ))}
            </Select>
          )}
        />
        <FormHelperText>
          {errors.class_days?.message ||
            "Select only the days on which classes are conducted. For example, if classes are held only on Saturday and Sunday, select only Saturday and Sunday."}
        </FormHelperText>
      </FormControl>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
        <Box sx={{ display: "flex", gap: 1, width: "100%", alignItems: "flex-start", flexDirection: { xs: "column", sm: "row" } }}>
          <TextField
            {...register("google_location_link", {
              required: "Google location link is required.",
              setValueAs: (value) => String(value ?? "").trim(),
              validate: (value) =>
                String(value ?? "").startsWith("https://") || "Google location link must start with https://.",
            })}
            label="Google Location Link *"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.google_location_link}
            helperText={errors.google_location_link?.message || "Paste the Google Maps link. Latitude and longitude will auto-fill when the link contains coordinates."}
          />
          <Button
            variant="outlined"
            onClick={handleFetchLatLng}
            disabled={isFetchingLatLng || !trimmedGoogleLocationLink}
            sx={{ minWidth: 150, mt: { xs: 0, sm: 1 } }}
          >
            {isFetchingLatLng ? "Fetching..." : "Fetch Lat/Long"}
          </Button>
        </Box>
        {latLngMessage && (
          <Typography variant="body2" color={latLngMessage.includes("successfully") ? "success.main" : "error"}>
            {latLngMessage}
          </Typography>
        )}
        <Button
          component="a"
          href={canOpenGoogleLocationLink ? trimmedGoogleLocationLink : undefined}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          startIcon={<OpenInNewIcon />}
          disabled={!canOpenGoogleLocationLink}
        >
          Test Google Location Link
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            {...register("latitude", {
              setValueAs: normalizeOptionalNumber,
              validate: (value) =>
                value === null ||
                value === undefined ||
                (typeof value === "number" && !Number.isNaN(value) && value >= -90 && value <= 90) ||
                "Latitude must be between -90 and 90.",
            })}
            label="Latitude"
            fullWidth
            type="text"
            InputLabelProps={{ shrink: true }}
            inputProps={{ inputMode: "decimal" }}
            error={!!errors.latitude}
            helperText={errors.latitude?.message || "Optional. Latitude must be between -90 and 90."}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            {...register("longitude", {
              setValueAs: normalizeOptionalNumber,
              validate: (value) =>
                value === null ||
                value === undefined ||
                (typeof value === "number" && !Number.isNaN(value) && value >= -180 && value <= 180) ||
                "Longitude must be between -180 and 180.",
            })}
            label="Longitude"
            fullWidth
            type="text"
            InputLabelProps={{ shrink: true }}
            inputProps={{ inputMode: "decimal" }}
            error={!!errors.longitude}
            helperText={errors.longitude?.message || "Optional. Longitude must be between -180 and 180."}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            component="a"
            href={coordinateMapLink || undefined}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            disabled={!coordinateMapLink}
          >
            Test Latitude and Longitude in Google Maps
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            {...register("mukhyashikshak", { required: "This field is required" })}
            label="Mukhyashikshak *"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.mukhyashikshak}
            helperText={errors.mukhyashikshak?.message || "Enter the name of the mukhyashikshak responsible for this branch."}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            {...register("email_id", {
              required: "Email is required.",
              setValueAs: (value) => String(value ?? "").trim(),
              validate: (value) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ||
                "Enter a valid email address.",
            })}
            label="Email *"
            fullWidth
            type="email"
            InputLabelProps={{ shrink: true }}
            error={!!errors.email_id}
            helperText={errors.email_id?.message || "Enter the branch or coordinator email address."}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            {...register("contact_number", {
              required: "Contact number is required.",
              setValueAs: (value) => String(value ?? "").trim(),
              validate: validatePhoneNumber,
            })}
            label="Contact Number *"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.contact_number}
            helperText={errors.contact_number?.message || "Enter the primary contact number for this branch."}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            {...register("whatsapp_number", {
              required: "WhatsApp number is required.",
              setValueAs: (value) => String(value ?? "").trim(),
              validate: validatePhoneNumber,
            })}
            label="WhatsApp Number *"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.whatsapp_number}
            helperText={errors.whatsapp_number?.message || "Enter the WhatsApp number for this branch."}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
