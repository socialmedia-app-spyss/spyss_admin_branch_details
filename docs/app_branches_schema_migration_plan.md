# `public.app_branches` Schema Migration & UI Enhancement Specification

This document provides the complete specification, field mappings, validation logic, suggestions, and architectural plan to support `public.app_branches` in `spyss_admin_branch_details`.

---

## 1. Schema Definition

```sql
create table public.app_branches (
  id uuid not null default gen_random_uuid (),
  branch_code character varying(20) not null,
  version integer not null default 1,
  branch_name jsonb not null,
  full_address jsonb not null default '{}'::jsonb,
  area jsonb not null default '{}'::jsonb,
  nagara jsonb not null default '{}'::jsonb,
  upa_nagara jsonb not null default '{}'::jsonb,
  mukhyashikshak jsonb not null default '{}'::jsonb,
  class_timings character varying(100) not null,
  category_id uuid not null,
  batch_id uuid not null,
  medium_id uuid not null,
  status_id uuid not null,
  country_id uuid not null,
  state_id uuid not null,
  district_id uuid not null,
  valaya_id uuid not null,
  region_id uuid null,
  class_days text[] not null default array[
    'Monday'::text,
    'Tuesday'::text,
    'Wednesday'::text,
    'Thursday'::text,
    'Friday'::text,
    'Saturday'::text,
    'Sunday'::text
  ],
  pincode character varying(10) not null,
  latitude numeric(10, 7) null,
  longitude numeric(10, 7) null,
  google_location_link text null,
  contact_number character varying(20) not null,
  whatsapp_number character varying(20) null,
  spyss_main_contact_number character varying(20) not null default '9481580160'::character varying,
  email_id character varying(255) null,
  branch_start_date date null,
  is_active boolean not null default true,
  branch_name_en_sort text GENERATED ALWAYS as (
    COALESCE(
      NULLIF(btrim((branch_name ->> 'en'::text)), ''::text),
      NULLIF(btrim((branch_name ->> 'kn'::text)), ''::text),
      ''::text
    )
  ) STORED null,
  created_by uuid null default auth.uid (),
  updated_by uuid null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint app_branches_pkey primary key (id),
  constraint app_branches_branch_code_key unique (branch_code),
  constraint app_branches_country_id_fkey foreign KEY (country_id) references master_countries (id) on delete RESTRICT,
  constraint app_branches_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete set null,
  constraint app_branches_medium_id_fkey foreign KEY (medium_id) references master_mediums (id) on delete RESTRICT,
  constraint app_branches_status_id_fkey foreign KEY (status_id) references master_branch_statuses (id) on delete RESTRICT,
  constraint app_branches_updated_by_fkey foreign KEY (updated_by) references auth.users (id) on delete set null,
  constraint app_branches_valaya_id_fkey foreign KEY (valaya_id) references master_valayas (id) on delete RESTRICT,
  constraint fk_branch_valaya_district foreign KEY (valaya_id, district_id) references master_valaya_districts (valaya_id, district_id),
  constraint app_branches_category_id_fkey foreign KEY (category_id) references master_categories (id) on delete RESTRICT,
  constraint fk_branch_country_state foreign KEY (country_id, state_id) references master_states (country_id, id),
  constraint fk_branch_district_region foreign KEY (district_id, region_id) references master_regions (district_id, id),
  constraint fk_branch_state_district foreign KEY (state_id, district_id) references master_districts (state_id, id),
  constraint app_branches_batch_id_fkey foreign KEY (batch_id) references master_batches (id) on delete RESTRICT,
  constraint app_branches_version_check check ((version > 0)),
  constraint chk_app_branches_coordinates check (
    (
      (
        (latitude is null)
        and (longitude is null)
      )
      or (
        (
          (latitude >= ('-90'::integer)::numeric)
          and (latitude <= (90)::numeric)
        )
        and (
          (longitude >= ('-180'::integer)::numeric)
          and (longitude <= (180)::numeric)
        )
      )
    )
  ),
  constraint chk_app_branches_json check (
    (
      (jsonb_typeof(branch_name) = 'object'::text)
      and (jsonb_typeof(full_address) = 'object'::text)
      and (jsonb_typeof(area) = 'object'::text)
      and (jsonb_typeof(nagara) = 'object'::text)
      and (jsonb_typeof(upa_nagara) = 'object'::text)
      and (jsonb_typeof(mukhyashikshak) = 'object'::text)
    )
  ),
  constraint chk_app_branches_name_required check (
    (
      (
        NULLIF(btrim((branch_name ->> 'en'::text)), ''::text) is not null
      )
      or (
        NULLIF(btrim((branch_name ->> 'kn'::text)), ''::text) is not null
      )
    )
  )
);
```

---

## 2. Core Differences from Legacy `latest_branches`

1. **JSONB Bilingual Columns**:
   - `branch_name`, `full_address`, `area`, `nagara`, `upa_nagara`, `mukhyashikshak` are now `jsonb` with schema `{"en": "...", "kn": "..."}`.
   - Constraint `chk_app_branches_json` requires each to be a valid JSON object.
   - Constraint `chk_app_branches_name_required` requires at least `en` or `kn` branch name.
2. **Master Regions (`region_id`)**:
   - Optional `region_id uuid` referencing `master_regions (district_id, id)`.
   - Dependent on selected `district_id`.
3. **SPYSS Main Contact Number (`spyss_main_contact_number`)**:
   - Defaults to `'9481580160'`.
4. **Active Flag (`is_active`)**:
   - `boolean not null default true`.
5. **Version (`version`)**:
   - `integer not null default 1`, auto-incremented on updates via DB trigger `trg_handle_branch_update`.
6. **Resource target**:
   - Queries target `app_branches` instead of `latest_branches`.

---

## 3. UI Form Guidance, Suggestions & Validation Rules

### Section A: Overview & Naming
- **Branch Name (English)**:
  - *Validation*: Required, 4-200 characters, English letters/spaces only, Title Case (e.g., "Mysuru Central", "Jayanagar 4th Block").
  - *Suggestion / Helper*: *"Enter official branch name in Title Case. If 'SPYSS' is in the name, write it in uppercase."*
- **Branch Name (Kannada)**:
  - *Validation*: Required, must contain valid Kannada Unicode (`\u0C80-\u0CFF`).
  - *Suggestion / Helper*: *"ಶಾಖೆಯ ಅಧಿಕೃತ ಹೆಸರನ್ನು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ (ಉದಾ: 'ಮೈಸೂರು ಸೆಂಟ್ರಲ್')."*
- **Status, Category, Batch, Medium**:
  - *Auto-defaults*: Status: `Active`, Category: `General`, Medium: `Kannada`.
  - *Batch*: Auto-selected based on start time (`Morning` 2 AM-10:59 AM, `Afternoon` 11 AM-3:59 PM, `Evening` 4 PM-9:59 PM).

### Section B: Location & Geography
- **Google Location Link**:
  - *Action*: "Auto-fill Location Details" button.
  - *Suggestion / Helper*: *"Paste a shared Google Maps link and click 'Auto-fill' to automatically populate Address, Area, Nagara, Pincode, and Coordinates."*
- **Country & State**: Defaults to `India` and `Karnataka`.
- **Valaya & District**:
  - Filtered based on Valaya admin scope or state selection.
- **Region (New)**:
  - *Suggestion / Helper*: *"Select sub-district region / zone (filtered by district)."*
- **Coordinates (Latitude & Longitude)**:
  - *Validation*: Latitude [-90, 90], Longitude [-180, 180], or both blank.
  - *Helper*: Map preview link button enabled when valid coordinates exist.

### Section C: Contact Details
- **Mukhyashikshak (English & Kannada)**:
  - *Validation*: Required, valid English and Kannada scripts respectively.
- **Contact Number**:
  - *Validation*: Required, 10-15 digits.
- **WhatsApp Number**:
  - *Validation*: Optional, 10-15 digits if entered.
- **SPYSS Main Contact Number**:
  - *Default*: `'9481580160'`.
  - *Suggestion / Helper*: *"Central SPYSS public helpline number."*
- **Email ID**:
  - *Validation*: Optional, valid email format.

### Section D: Schedule & Activity
- **Class Days**: Multi-select pills for Monday-Sunday (defaults to all 7 days).
- **Class Timings**: Start and End time selectors with minimum 45 minutes duration validation.
- **Is Active**: Switch toggle (Active / Inactive).

---

## 4. Implementation Steps

1. **`src/types/branch.ts`**:
   - Add `LocalizedString` (`{ en?: string; kn?: string }`).
   - Add `MasterRegion` and `PartialMasterRegion`.
   - Update `Branch`, `BranchCreateInput`, `BranchUpdateInput`, `BranchWithMasters`.
2. **`src/utils/i18n.ts`**:
   - Add `getLocalizedJson` helper.
3. **`src/resources/branches/BranchForm.tsx`**:
   - Add `master_regions` fetching and district-based filtering.
   - Add inputs for `spyss_main_contact_number`, `is_active`, `region_id`.
   - Add contextual suggestions and tooltips for all fields.
4. **`src/resources/branches/create.tsx` & `edit.tsx`**:
   - Serialize/deserialize between flat form inputs and JSONB database objects.
5. **`src/resources/branches/list.tsx` & `show.tsx`**:
   - Update resource to `app_branches`.
   - Add region name and active status display.
6. **`src/App.tsx` & Dashboard Pages**:
   - Update resource bindings from `latest_branches` to `app_branches`.
