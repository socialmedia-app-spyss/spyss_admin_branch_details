export const normalizeLabel = (value: string) =>
  value.trim().toLowerCase().replace(/[\s_-]+/g, "");

export const matchesOption = (value: string, expected: string) =>
  normalizeLabel(value) === normalizeLabel(expected);

const isKarnatakaCodeOrName = (val: string) =>
  matchesOption(val, "KA") ||
  matchesOption(val, "KAR") ||
  matchesOption(val, "Karnataka");

export const isKarnatakaState = (
  stateId?: string,
  states: { id: string; state_name_en?: string; state_code?: string }[] = [],
): boolean => {
  if (!stateId) return false;
  const state = states.find(
    (s) =>
      s.id === stateId ||
      (s.state_code && matchesOption(s.state_code, stateId)) ||
      (isKarnatakaCodeOrName(stateId) &&
        (isKarnatakaCodeOrName(s.state_code || "") || isKarnatakaCodeOrName(s.state_name_en || ""))),
  );
  if (!state) return false;
  return (
    matchesOption(state.state_name_en || "", "Karnataka") ||
    matchesOption(state.state_code || "", "KA") ||
    matchesOption(state.state_code || "", "KAR")
  );
};

export const validateValaya = (
  valayaId: string | null | undefined,
  _isKarnataka: boolean,
): true | string => {
  return Boolean(valayaId) || "Select a Valaya and district combination.";
};

export const normalizeValayaId = (valayaId?: string | null): string | null =>
  valayaId?.trim() || null;
