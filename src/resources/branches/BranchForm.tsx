import { useEffect, useMemo, useRef, useState } from "react";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import { useGetIdentity } from "@refinedev/core";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import {
  getLocalizedValayaName,
} from "../../services/valayaScope";
import { resolveGoogleMapLink } from "../../utils/mapLinkResolver";
import { getLocalizedName } from "../../utils/i18n";
import { useLanguage } from "../../hooks/useLanguage";
import {
  emptyMasterOptions,
  getMasterOptions,
  type MasterOptions,
} from "../../services/masterOptionsService";
import type { BranchFormValues } from "../../types/branch";
import type { UserProfile } from "../../types/user";

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

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));
const ampm = ["AM", "PM"];
export const classDayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

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

const normalizeLabel = (value: string) =>
  value.trim().toLowerCase().replace(/[\s_-]+/g, "");

const matchesOption = (value: string, expected: string) =>
  normalizeLabel(value) === normalizeLabel(expected);

const findByEnglishNameOrCode = <T extends object>(
  records: T[],
  expected: string,
  nameEnKey: keyof T,
  codeKey: keyof T,
) =>
  records.find((record) => {
    const nameEn = record[nameEnKey];
    const code = record[codeKey];
    return (
      (typeof nameEn === "string" && matchesOption(nameEn, expected)) ||
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

  if (!/^[A-Za-z0-9\s()&/.,'-]+$/.test(branchName)) {
    return "Use English letters, numbers, and basic punctuation only.";
  }

  if (/^[0-9]+$/.test(branchName)) {
    return "Branch name cannot contain only numbers.";
  }

  if (!/[A-Za-z]/.test(branchName)) {
    return "Branch name must contain alphabetic characters.";
  }

  return true;
};

const englishTextPattern = /^[A-Za-z0-9\s.,#/'()&:-]+$/;
const kannadaTextPattern = /^[\u0C80-\u0CFF\u200C\u200D0-9\s.,#/'()&:-]+$/;

const validateEnglishText = (value?: string | null) => {
  const text = String(value ?? "").trim();

  if (!text) {
    return true;
  }

  if (!/[A-Za-z]/.test(text) || !englishTextPattern.test(text)) {
    return "Enter this field in English only.";
  }

  return true;
};

const validateKannadaText = (value?: string | null) => {
  const text = String(value ?? "").trim();

  if (!text) {
    return true;
  }

  if (!/[\u0C80-\u0CFF]/.test(text) || !kannadaTextPattern.test(text)) {
    return "ಈ ಕ್ಷೇತ್ರವನ್ನು ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ನಮೂದಿಸಿ.";
  }

  return true;
};

const validatePhoneNumber = (value?: string | null, fieldName = "Contact number") => {
  const phoneNumber = String(value ?? "").trim();

  if (!phoneNumber) {
    return `${fieldName} is required.`;
  }

  if (!/^\+?[0-9\s()-]+$/.test(phoneNumber)) {
    return "Use numbers only. A plus sign is allowed only at the beginning.";
  }

  if (
    (phoneNumber.match(/\+/g) || []).length > 1 ||
    (phoneNumber.includes("+") && !phoneNumber.startsWith("+"))
  ) {
    return "A plus sign is allowed only at the beginning.";
  }

  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.length < 10) {
    return `${fieldName} must contain at least 10 digits.`;
  }

  return true;
};

const validateOptionalPhoneNumber = (value?: string | null) => {
  const phoneNumber = String(value ?? "").trim();
  if (!phoneNumber) return true;
  return validatePhoneNumber(phoneNumber, "WhatsApp number");
};

const normalizeOptionalNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
};

const formatLocationDetailsList = (items: string[]) => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};

type LocationDetailsMessage = {
  found?: string;
  missing?: string;
  error?: string;
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
  const [options, setOptions] = useState<MasterOptions>(emptyMasterOptions);
  const [startHour, setStartHour] = useState("");
  const [startMinute, setStartMinute] = useState("");
  const [startAmPm, setStartAmPm] = useState("");
  const [endHour, setEndHour] = useState("");
  const [endMinute, setEndMinute] = useState("");
  const [endAmPm, setEndAmPm] = useState("");
  const [selectedValayaCode, setSelectedValayaCode] = useState("");
  const [isFetchingLocationDetails, setIsFetchingLocationDetails] = useState(false);
  const [locationDetailsMessage, setLocationDetailsMessage] = useState<LocationDetailsMessage | null>(null);

  const defaultValuesApplied = useRef(false);
  const classTimingsParsed = useRef(false);
  const { data: identity } = useGetIdentity<UserProfile>();
  const classTimings = watch("class_timings");
  const selectedCountryId = watch("country_id");
  const selectedValayaId = watch("valaya_id");
  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const googleLocationLink = watch("google_location_link");
  const timingSource = classTimings || initialClassTimings;
  const isValayaAdmin = identity?.role === "VALAYA_ADMIN";
  const { language } = useLanguage();

  // Load master options in 1 single RPC call (with in-memory session caching)
  useEffect(() => {
    let isMounted = true;
    void getMasterOptions().then((loadedOptions) => {
      if (isMounted) {
        setOptions(loadedOptions);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Apply form defaults
  useEffect(() => {
    if (
      !applyDefaults ||
      defaultValuesApplied.current ||
      options.categories.length === 0 ||
      options.countries.length === 0
    ) {
      return;
    }

    const category = findByEnglishNameOrCode(options.categories, "General", "category_name_en", "category_code");
    const batch = findByEnglishNameOrCode(options.batches, "Morning", "batch_name_en", "batch_code");
    const country = findByEnglishNameOrCode(options.countries, "India", "country_name_en", "country_code");
    const state = findByEnglishNameOrCode(options.states, "Karnataka", "state_name_en", "state_code");
    const status = findByEnglishNameOrCode(options.statuses, "Active", "status_name_en", "status_code");
    const medium = findByEnglishNameOrCode(options.mediums, "Kannada", "medium_name_en", "medium_code");

    if (category) setValue("category_id", category.id);
    if (batch) setValue("batch_id", batch.id);
    if (country && !selectedCountryId) setValue("country_id", country.id);
    if (state && !selectedStateId) setValue("state_id", state.id);
    if (status) setValue("status_id", status.id);
    if (medium) setValue("medium_id", medium.id);
    setValue("is_active", true);

    defaultValuesApplied.current = true;
  }, [
    applyDefaults,
    options.batches,
    options.categories,
    options.countries,
    options.mediums,
    options.states,
    options.statuses,
    selectedCountryId,
    selectedStateId,
    setValue,
  ]);

  // Parse existing class timings
  useEffect(() => {
    if (classTimingsParsed.current || !timingSource) {
      return;
    }

    const match = timingSource.match(
      /^(\d{1,2}):(\d{2}) (AM|PM) - (\d{1,2}):(\d{2}) (AM|PM)$/,
    );

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

  // Sync timings
  useEffect(() => {
    if (!applyDefaults && !classTimingsParsed.current) {
      return;
    }

    if (startHour && startMinute && startAmPm && endHour && endMinute && endAmPm) {
      setValue(
        "class_timings",
        `${startHour}:${startMinute} ${startAmPm} - ${endHour}:${endMinute} ${endAmPm}`,
        { shouldValidate: true },
      );
    }
  }, [applyDefaults, endAmPm, endHour, endMinute, setValue, startAmPm, startHour, startMinute]);

  // Auto-select batch from start time
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

    const batch = findByEnglishNameOrCode(options.batches, batchName, "batch_name_en", "batch_code");

    if (batch) {
      setValue("batch_id", batch.id, { shouldValidate: true });
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
    return endTimeInMinutes - startTimeInMinutes >= 45
      ? true
      : "Class timing must be at least 45 minutes.";
  }, [endAmPm, endHour, endMinute, startAmPm, startHour, startMinute]);

  const filteredStates = useMemo(
    () => options.states.filter((state) => state.country_id === selectedCountryId),
    [options.states, selectedCountryId],
  );

  const safeStateValue = filteredStates.some((state) => state.id === selectedStateId)
    ? selectedStateId ?? ""
    : "";

  const filteredDistricts = useMemo(() => {
    const mappedDistrictIds = new Set(
      options.valayaDistricts
        .filter((mapping) => mapping.valaya_id === selectedValayaId)
        .map((mapping) => mapping.district_id),
    );
    const districtsForState = options.districts.filter(
      (district) =>
        district.state_id === selectedStateId &&
        (!selectedValayaId || mappedDistrictIds.has(district.id)),
    );
    if (isValayaAdmin && (identity?.accessible_district_ids?.length ?? 0) > 0) {
      const allowedDistrictIds = new Set(identity?.accessible_district_ids ?? []);
      return districtsForState.filter((district) => allowedDistrictIds.has(district.id));
    }
    return districtsForState;
  }, [
    identity?.accessible_district_ids,
    isValayaAdmin,
    options.districts,
    options.valayaDistricts,
    selectedStateId,
    selectedValayaId,
  ]);

  const safeDistrictValue = filteredDistricts.some((district) => district.id === selectedDistrictId)
    ? selectedDistrictId ?? ""
    : "";

  // Regions filtered by selected District
  const filteredRegions = useMemo(() => {
    if (!selectedDistrictId) return [];
    return options.regions.filter((region) => region.district_id === selectedDistrictId);
  }, [options.regions, selectedDistrictId]);

  const displayedValayaOptions = useMemo(() => {
    if (
      !selectedValayaCode ||
      options.distinctValayas.some((valaya) => valaya.valaya_code === selectedValayaCode)
    ) {
      return options.distinctValayas;
    }
    return [
      ...options.distinctValayas,
      {
        id: selectedValayaId || selectedValayaCode,
        valaya_name_en: identity?.valaya_name || selectedValayaCode,
        valaya_name_kn: identity?.valaya_name || selectedValayaCode,
        valaya_code: selectedValayaCode,
      },
    ];
  }, [identity?.valaya_name, options.distinctValayas, selectedValayaCode, selectedValayaId]);

  const safeValayaCode = displayedValayaOptions.some(
    (valaya) => valaya.valaya_code === selectedValayaCode,
  )
    ? selectedValayaCode
    : "";

  const coordinateMapLink = useMemo(() => {
    const rawLatitude: unknown = latitude;
    const rawLongitude: unknown = longitude;
    if (
      rawLatitude === "" ||
      rawLatitude === null ||
      rawLatitude === undefined ||
      rawLongitude === "" ||
      rawLongitude === null ||
      rawLongitude === undefined
    ) {
      return "";
    }
    const lat = Number(rawLatitude);
    const lng = Number(rawLongitude);
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return "";
    }
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }, [latitude, longitude]);

  const trimmedGoogleLocationLink = String(googleLocationLink ?? "").trim();
  const canOpenGoogleLocationLink = trimmedGoogleLocationLink.startsWith("https://");

  const handleFetchLocationDetails = async () => {
    setLocationDetailsMessage(null);
    if (!trimmedGoogleLocationLink) {
      setLocationDetailsMessage({ error: "Please enter Google location link first." });
      return;
    }
    setIsFetchingLocationDetails(true);
    try {
      const result = await resolveGoogleMapLink(trimmedGoogleLocationLink);
      if (!result.success) {
        const isNotMapsLocation = result.error?.includes("does not open a Google Maps location");
        setLocationDetailsMessage({
          error: isNotMapsLocation
            ? "This link is not a Google Maps location. Please open the place in Google Maps, tap Share, copy the Maps link, and try again."
            : result.error || "Could not fetch location details.",
        });
        return;
      }
      if (result.address) setValue("full_address_en", result.address, { shouldDirty: true, shouldValidate: true });
      if (result.area) setValue("area_en", result.area, { shouldDirty: true, shouldValidate: true });
      if (result.nagara) setValue("nagara_en", result.nagara, { shouldDirty: true, shouldValidate: true });
      if (result.pincode) setValue("pincode", result.pincode, { shouldDirty: true, shouldValidate: true });
      if (result.latitude != null) setValue("latitude", result.latitude, { shouldDirty: true, shouldValidate: true });
      if (result.longitude != null) setValue("longitude", result.longitude, { shouldDirty: true, shouldValidate: true });

      const foundDetails = [
        result.address ? "address" : null,
        result.area ? "area" : null,
        result.nagara ? "nagara" : null,
        result.pincode ? "pincode" : null,
        result.latitude != null ? "latitude" : null,
        result.longitude != null ? "longitude" : null,
      ].filter((d): d is string => Boolean(d));

      const missingDetails = [
        result.address ? null : "address",
        result.area ? null : "area",
        result.pincode ? null : "pincode",
        result.latitude != null ? null : "latitude",
        result.longitude != null ? null : "longitude",
      ].filter((d): d is string => Boolean(d));

      if (missingDetails.length > 0) {
        setLocationDetailsMessage({
          found: foundDetails.length > 0 ? `Found ${formatLocationDetailsList(foundDetails)}.` : undefined,
          missing: `Could not find ${formatLocationDetailsList(missingDetails)} in this link. Please fill the missing details manually.`,
        });
        return;
      }
      setLocationDetailsMessage({ found: `Found ${formatLocationDetailsList(foundDetails)} in this link.` });
    } catch (error) {
      console.error("Fetch location details error:", error);
      setLocationDetailsMessage({ error: "Failed to fetch location details." });
    } finally {
      setIsFetchingLocationDetails(false);
    }
  };

  useEffect(() => {
    if (isValayaAdmin && identity?.valaya_code) {
      setSelectedValayaCode(identity.valaya_code);
      if (identity.valaya_id) {
        setValue("valaya_id", identity.valaya_id);
      }
      return;
    }
    if (selectedValayaId && options.valayas.length > 0) {
      const selectedValaya = options.valayas.find((valaya) => valaya.id === selectedValayaId);
      setSelectedValayaCode(selectedValaya?.valaya_code ?? "");
    }
  }, [identity?.valaya_code, identity?.valaya_id, isValayaAdmin, options.valayas, selectedValayaId, setValue]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* SECTION 1: REGION (AT START) */}
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {language === "kn" ? "ಪ್ರದೇಶ (Region)" : "Region"}
          </Typography>
          <Divider sx={{ mb: 2.5 }} />

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.country_id}>
                <InputLabel id="country-label">Country *</InputLabel>
                <Controller
                  name="country_id"
                  control={control}
                  rules={{ required: "Select a country." }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="country-label"
                      label="Country *"
                      value={field.value || ""}
                      onChange={(event) => {
                        field.onChange(event);
                        setSelectedValayaCode("");
                        setValue("state_id", "", { shouldDirty: true, shouldValidate: true });
                        setValue("district_id", "", { shouldDirty: true, shouldValidate: true });
                        setValue("valaya_id", "", { shouldDirty: true, shouldValidate: true });
                        setValue("region_id", "", { shouldDirty: true, shouldValidate: true });
                      }}
                    >
                      <MenuItem value="">Select country</MenuItem>
                      {options.countries.map((country) => (
                        <MenuItem key={country.id} value={country.id}>
                          {getLocalizedName(country.country_name_en, country.country_name_kn, language)}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>{errors.country_id?.message || "Defaults to India."}</FormHelperText>
              </FormControl>
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
                      value={safeStateValue}
                      disabled={!selectedCountryId}
                      onChange={(event) => {
                        field.onChange(event);
                        setSelectedValayaCode("");
                        setValue("district_id", "", { shouldDirty: true, shouldValidate: true });
                        setValue("valaya_id", "", { shouldDirty: true, shouldValidate: true });
                        setValue("region_id", "", { shouldDirty: true, shouldValidate: true });
                      }}
                    >
                      <MenuItem value="">Select state</MenuItem>
                      {filteredStates.map((state) => (
                        <MenuItem key={state.id} value={state.id}>
                          {getLocalizedName(state.state_name_en, state.state_name_kn, language)}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>{errors.state_id?.message || "Filtered by selected country."}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!errors.valaya_id}>
                <InputLabel id="valaya-label">Valaya *</InputLabel>
                <Controller
                  name="valaya_id"
                  control={control}
                  rules={{ validate: (value) => Boolean(value) || "Select a Valaya and district combination." }}
                  render={() => (
                    <Select
                      labelId="valaya-label"
                      label="Valaya *"
                      value={safeValayaCode}
                      disabled={isValayaAdmin}
                      onChange={(event) => {
                        const valayaCode = event.target.value;
                        setSelectedValayaCode(valayaCode);
                        const selectedValaya = displayedValayaOptions.find(
                          (valaya) => valaya.valaya_code === valayaCode,
                        );
                        setValue("valaya_id", selectedValaya?.id ?? "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        setValue("district_id", "", { shouldDirty: true, shouldValidate: true });
                        setValue("region_id", "", { shouldDirty: true, shouldValidate: true });
                      }}
                    >
                      <MenuItem value="">Select Valaya</MenuItem>
                      {displayedValayaOptions.map((valaya) => (
                        <MenuItem key={valaya.valaya_code} value={valaya.valaya_code}>
                          {getLocalizedValayaName(valaya, language)}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>
                  {errors.valaya_id?.message ||
                    (isValayaAdmin
                      ? "Valaya is fixed from your admin access."
                      : "Select the branch Valaya.")}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
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
                      disabled={!selectedStateId}
                      onChange={(event) => {
                        const districtId = event.target.value;
                        field.onChange(districtId);
                        setValue("district_id", districtId, { shouldDirty: true, shouldValidate: true });
                        setValue("region_id", "", { shouldDirty: true, shouldValidate: true });
                      }}
                    >
                      <MenuItem value="">Select district</MenuItem>
                      {filteredDistricts.map((district) => (
                        <MenuItem key={district.id} value={district.id}>
                          {getLocalizedName(district.district_name_en, district.district_name_kn, language)}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>{errors.district_id?.message || "Filtered by selected state."}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!errors.region_id}>
                <InputLabel id="region-label">Region (Zone) *</InputLabel>
                <Controller
                  name="region_id"
                  control={control}
                  rules={{
                    validate: (value) =>
                      filteredRegions.length === 0 || Boolean(value) || "This field is required",
                  }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="region-label"
                      label="Region (Zone) *"
                      value={field.value || ""}
                      disabled={!selectedDistrictId}
                      onChange={(event) => {
                        field.onChange(event.target.value || null);
                      }}
                    >
                      <MenuItem value="">
                        <em>{language === "kn" ? "ಯಾವುದೂ ಇಲ್ಲ / ಅನ್ವಯಿಸುವುದಿಲ್ಲ" : "None / Not Applicable"}</em>
                      </MenuItem>
                      {filteredRegions.map((region) => (
                        <MenuItem key={region.id} value={region.id}>
                          {getLocalizedName(region.region_name_en, region.region_name_kn, language)}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>
                  {filteredRegions.length > 0
                    ? errors.region_id?.message || "Required for the selected district."
                    : "No specific regions configured for this district."}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* SECTION 2: BRANCH OVERVIEW & DETAILS */}
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {language === "kn" ? "ಶಾಖೆಯ ವಿವರಗಳು" : "Branch Details"}
          </Typography>
          <Divider sx={{ mb: 2.5 }} />

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                {...register("branch_name_en", {
                  required: "Branch name is required.",
                  setValueAs: (value) => normalizeBranchName(String(value ?? "")),
                  validate: validateBranchName,
                })}
                label="Branch Name (English) *"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.branch_name_en}
                helperText={
                  errors.branch_name_en?.message ||
                  "Use Title Case (e.g. 'Mysuru Central'). If 'SPYSS' is in the name, write it in uppercase."
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                {...register("branch_name_kn", {
                  required: "ಶಾಖೆಯ ಹೆಸರು ಅಗತ್ಯವಿದೆ.",
                  setValueAs: (value) => normalizeBranchName(String(value ?? "")),
                  validate: validateKannadaText,
                })}
                label="ಶಾಖೆಯ ಹೆಸರು (ಕನ್ನಡ) *"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.branch_name_kn}
                helperText={errors.branch_name_kn?.message || "ಶಾಖೆಯ ಹೆಸರನ್ನು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ (ಉದಾ: 'ಮೈಸೂರು ಸೆಂಟ್ರಲ್')."}
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
                helperText={errors.branch_start_date?.message || "Date when yoga classes officially started."}
              />
            </Grid>

            <Grid item xs={12} md={4}>
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
                          {getLocalizedName(status.status_name_en, status.status_name_kn, language)}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>{errors.status_id?.message || "Current branch status (e.g., Active, Suspended)."}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value ?? true}
                          onChange={(e) => field.onChange(e.target.checked)}
                          color="success"
                        />
                      }
                      label={field.value ? "Active (Publicly Visible)" : "Inactive"}
                      sx={{ mt: 1 }}
                    />
                  )}
                />
                <FormHelperText>Controls visibility in the mobile app directory.</FormHelperText>
              </FormControl>
            </Grid>

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
                          {getLocalizedName(category.category_name_en, category.category_name_kn, language)}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>{errors.category_id?.message || "Defaults to General."}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.medium_id}>
                <InputLabel id="medium-label">Medium *</InputLabel>
                <Controller
                  name="medium_id"
                  control={control}
                  rules={{ required: "Medium is required." }}
                  render={({ field }) => (
                    <Select {...field} labelId="medium-label" label="Medium *" value={field.value || ""}>
                      {options.mediums.map((medium) => (
                        <MenuItem key={medium.id} value={medium.id}>
                          {getLocalizedName(medium.medium_name_en, medium.medium_name_kn, language)}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>
                  {errors.medium_id?.message || "Teaching language for this branch. Defaults to Kannada."}
                </FormHelperText>
              </FormControl>
            </Grid>

            {/* CLASS SCHEDULE SUB-SECTION */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={700}>
                {language === "kn" ? "ತರಗತಿ ವೇಳಾಪಟ್ಟಿ" : "Class Schedule"}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.class_timings}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Class Timings (Start & End Time) *
                </Typography>
                <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body2" fontWeight={600}>
                        Start Time:
                      </Typography>
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>HH</InputLabel>
                        <Select value={startHour} label="HH" onChange={(e) => setStartHour(e.target.value)}>
                          {hours.map((h) => (
                            <MenuItem key={h} value={h}>{h}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>MM</InputLabel>
                        <Select value={startMinute} label="MM" onChange={(e) => setStartMinute(e.target.value)}>
                          {minutes.map((m) => (
                            <MenuItem key={m} value={m}>{m}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>AM/PM</InputLabel>
                        <Select value={startAmPm} label="AM/PM" onChange={(e) => setStartAmPm(e.target.value)}>
                          {ampm.map((p) => (
                            <MenuItem key={p} value={p}>{p}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body2" fontWeight={600}>
                        End Time:
                      </Typography>
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>HH</InputLabel>
                        <Select value={endHour} label="HH" onChange={(e) => setEndHour(e.target.value)}>
                          {hours.map((h) => (
                            <MenuItem key={h} value={h}>{h}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>MM</InputLabel>
                        <Select value={endMinute} label="MM" onChange={(e) => setEndMinute(e.target.value)}>
                          {minutes.map((m) => (
                            <MenuItem key={m} value={m}>{m}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={4} sm={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>AM/PM</InputLabel>
                        <Select value={endAmPm} label="AM/PM" onChange={(e) => setEndAmPm(e.target.value)}>
                          {ampm.map((p) => (
                            <MenuItem key={p} value={p}>{p}</MenuItem>
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
                    label="Computed Class Timings *"
                    fullWidth
                    size="small"
                    sx={{ mt: 2 }}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ readOnly: true }}
                    error={!!errors.class_timings}
                    helperText={
                      errors.class_timings?.message ||
                      "Select start and end time above (minimum duration: 45 minutes)."
                    }
                  />
                </Box>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={8}>
              <FormControl fullWidth error={!!errors.class_days}>
                <InputLabel id="class-days-label">Class Days *</InputLabel>
                <Controller
                  name="class_days"
                  control={control}
                  rules={{ required: "Select at least one class day." }}
                  render={({ field }) => (
                    <Select
                      multiple
                      labelId="class-days-label"
                      label="Class Days *"
                      value={normalizeClassDays(field.value || [])}
                      onChange={(event) => {
                        const value = event.target.value;
                        field.onChange(
                          normalizeClassDays(typeof value === "string" ? value.split(",") : value),
                        );
                      }}
                    >
                      {classDayOptions.map((day) => (
                        <MenuItem key={day} value={day}>{day}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>
                  {errors.class_days?.message ||
                    "Days on which classes are conducted (defaults to all 7 days)."}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
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
                          {getLocalizedName(batch.batch_name_en, batch.batch_name_kn, language)}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>{errors.batch_id?.message || "Auto-calculated from class start time (Morning, Afternoon, Evening)."}</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* SECTION 3: ADDRESS & MAP LOCATION */}
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {language === "kn" ? "ವಿಳಾಸ ಮತ್ತು ಸ್ಥಳ ವಿವರಗಳು" : "Address & Map Location"}
          </Typography>
          <Divider sx={{ mb: 2.5 }} />

          <Grid container spacing={2.5}>

            {/* Google Location Link & Auto-fill */}
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Google Maps Location Auto-Fill
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5, flexDirection: { xs: "column", sm: "row" } }}>
                  <TextField
                    {...register("google_location_link", {
                      setValueAs: (value) => String(value ?? "").trim(),
                      validate: (value) => {
                        const val = String(value ?? "").trim();
                        if (!val) return true;
                        return val.startsWith("https://") || "Google location link must start with https://";
                      },
                    })}
                    label="Google Maps Share Link"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.google_location_link}
                    helperText={errors.google_location_link?.message || "Paste the Google Maps share link and click Auto-Fill."}
                  />
                  <Button
                    variant="contained"
                    startIcon={isFetchingLocationDetails ? undefined : <AutoAwesomeIcon />}
                    onClick={handleFetchLocationDetails}
                    disabled={isFetchingLocationDetails || !trimmedGoogleLocationLink}
                    sx={{ minWidth: 220, whiteSpace: "nowrap" }}
                  >
                    {isFetchingLocationDetails ? "Fetching Details…" : "Auto-Fill Address & GPS"}
                  </Button>
                </Box>
                {locationDetailsMessage && (
                  <Box>
                    {locationDetailsMessage.found && (
                      <Typography variant="body2" color="success.main" fontWeight={600}>
                        {locationDetailsMessage.found}
                      </Typography>
                    )}
                    {locationDetailsMessage.missing && (
                      <Typography variant="body2" color="warning.main">
                        {locationDetailsMessage.missing}
                      </Typography>
                    )}
                    {locationDetailsMessage.error && (
                      <Typography variant="body2" color="error">
                        {locationDetailsMessage.error}
                      </Typography>
                    )}
                  </Box>
                )}
                {canOpenGoogleLocationLink && (
                  <Button
                    component="a"
                    href={trimmedGoogleLocationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="text"
                    size="small"
                    startIcon={<OpenInNewIcon />}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Test Link in Google Maps
                  </Button>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("full_address_en", {
                  required: "Full address (English) is required.",
                  setValueAs: (value) => String(value ?? "").trim(),
                  validate: validateEnglishText,
                })}
                label="Full Address (English) *"
                fullWidth
                multiline
                minRows={3}
                InputLabelProps={{ shrink: true }}
                error={!!errors.full_address_en}
                helperText={errors.full_address_en?.message || "Street address, building name, and landmarks."}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("full_address_kn", {
                  required: "ಪೂರ್ಣ ವಿಳಾಸ ಅಗತ್ಯವಿದೆ.",
                  setValueAs: (value) => String(value ?? "").trim(),
                  validate: validateKannadaText,
                })}
                label="ಪೂರ್ಣ ವಿಳಾಸ (ಕನ್ನಡ) *"
                fullWidth
                multiline
                minRows={3}
                InputLabelProps={{ shrink: true }}
                error={!!errors.full_address_kn}
                helperText={errors.full_address_kn?.message || "ಪೂರ್ಣ ವಿಳಾಸವನ್ನು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ."}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("area_en", {
                  required: "Area (English) is required.",
                  setValueAs: (value) => String(value ?? "").trim().replace(/\s+/g, " "),
                  minLength: { value: 3, message: "Area must be at least 3 characters." },
                  maxLength: { value: 50, message: "Area must be 50 characters or fewer." },
                  validate: validateEnglishText,
                })}
                label="Area / Locality (English) *"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.area_en}
                helperText={errors.area_en?.message || "Locality / neighborhood name (e.g., 'Gokulam 3rd Stage')."}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("area_kn", {
                  required: "ಪ್ರದೇಶದ ಹೆಸರು ಅಗತ್ಯವಿದೆ.",
                  setValueAs: (value) => String(value ?? "").trim().replace(/\s+/g, " "),
                  minLength: { value: 3, message: "ಪ್ರದೇಶದ ಹೆಸರು ಕನಿಷ್ಠ 3 ಅಕ್ಷರಗಳಾಗಿರಬೇಕು." },
                  maxLength: { value: 50, message: "ಪ್ರದೇಶದ ಹೆಸರು 50 ಅಕ್ಷರಗಳಿಗಿಂತ ಹೆಚ್ಚಿರಬಾರದು." },
                  validate: validateKannadaText,
                })}
                label="ಪ್ರದೇಶ / ಬಡಾವಣೆ (ಕನ್ನಡ) *"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.area_kn}
                helperText={errors.area_kn?.message || "ಪ್ರದೇಶದ ಹೆಸರನ್ನು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ."}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("nagara_en", {
                  setValueAs: (value) => String(value ?? "").trim() || null,
                  validate: validateEnglishText,
                })}
                label="Nagara (English)"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.nagara_en}
                helperText={errors.nagara_en?.message || "Optional. Town / Nagara name."}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("nagara_kn", {
                  setValueAs: (value) => String(value ?? "").trim() || null,
                  validate: validateKannadaText,
                })}
                label="ನಗರ (ಕನ್ನಡ)"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.nagara_kn}
                helperText={errors.nagara_kn?.message || "ಐಚ್ಛಿಕ. ನಗರದ ಹೆಸರು."}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("upa_nagara_en", {
                  setValueAs: (value) => String(value ?? "").trim() || null,
                  validate: validateEnglishText,
                })}
                label="Upa Nagara (English)"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.upa_nagara_en}
                helperText={errors.upa_nagara_en?.message || "Optional. Sub-town / Upa Nagara."}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("upa_nagara_kn", {
                  setValueAs: (value) => String(value ?? "").trim() || null,
                  validate: validateKannadaText,
                })}
                label="ಉಪ ನಗರ (ಕನ್ನಡ)"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.upa_nagara_kn}
                helperText={errors.upa_nagara_kn?.message || "ಐಚ್ಛಿಕ. ಉಪ ನಗರದ ಹೆಸರು."}
              />
            </Grid>

            <Grid item xs={12} md={4}>
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
                helperText={errors.pincode?.message || "6-digit postal code."}
              />
            </Grid>

            <Grid item xs={12} md={4}>
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
                helperText={errors.latitude?.message || "GPS Latitude (-90 to 90)."}
              />
            </Grid>

            <Grid item xs={12} md={4}>
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
                helperText={errors.longitude?.message || "GPS Longitude (-180 to 180)."}
              />
            </Grid>

            {coordinateMapLink && (
              <Grid item xs={12}>
                <Button
                  component="a"
                  href={coordinateMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  size="small"
                  startIcon={<OpenInNewIcon />}
                >
                  Verify GPS Pin in Google Maps
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* SECTION 4: CONTACT DETAILS */}
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {language === "kn" ? "ಸಂಪರ್ಕ ವಿವರಗಳು" : "Contact Details"}
          </Typography>
          <Divider sx={{ mb: 2.5 }} />

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                {...register("mukhyashikshak_en", {
                  required: "Mukhyashikshak (English) is required.",
                  setValueAs: (value) => String(value ?? "").trim(),
                  validate: validateEnglishText,
                })}
                label="Mukhyashikshak (English) *"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.mukhyashikshak_en}
                helperText={errors.mukhyashikshak_en?.message || "Lead yoga teacher / coordinator for this branch."}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("mukhyashikshak_kn", {
                  required: "ಮುಖ್ಯಶಿಕ್ಷಕರ ಹೆಸರು ಅಗತ್ಯವಿದೆ.",
                  setValueAs: (value) => String(value ?? "").trim(),
                  validate: validateKannadaText,
                })}
                label="ಮುಖ್ಯಶಿಕ್ಷಕರ ಹೆಸರು (ಕನ್ನಡ) *"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.mukhyashikshak_kn}
                helperText={errors.mukhyashikshak_kn?.message || "ಮುಖ್ಯಶಿಕ್ಷಕರ ಹೆಸರನ್ನು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ."}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("contact_number", {
                  required: "Contact number is required.",
                  setValueAs: (value) => String(value ?? "").trim(),
                  validate: (v) => validatePhoneNumber(v, "Contact number"),
                })}
                label="Primary Contact Number *"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.contact_number}
                helperText={errors.contact_number?.message || "Primary phone number for branch inquiries."}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                {...register("whatsapp_number", {
                  setValueAs: (value) => String(value ?? "").trim() || null,
                  validate: validateOptionalPhoneNumber,
                })}
                label="WhatsApp Number"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.whatsapp_number}
                helperText={errors.whatsapp_number?.message || "Optional. WhatsApp helpline number."}
              />
            </Grid>


            <Grid item xs={12} md={6}>
              <TextField
                {...register("email_id", {
                  setValueAs: (value) => String(value ?? "").trim() || null,
                  validate: (value) => {
                    const val = String(value ?? "").trim();
                    if (!val) return true;
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || "Enter a valid email address.";
                  },
                })}
                label="Branch Email ID"
                fullWidth
                type="email"
                InputLabelProps={{ shrink: true }}
                error={!!errors.email_id}
                helperText={errors.email_id?.message || "Optional. Branch official email address."}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
