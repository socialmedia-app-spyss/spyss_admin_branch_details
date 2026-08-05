import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { Alert, AlertTitle, Chip, Stack } from "@mui/material";
import { useGetIdentity, useList } from "@refinedev/core";
import type { DailyPanchanga } from "../../types/panchanga";
import type { UserProfile } from "../../types/user";

const MINIMUM_FUTURE_ENTRIES = 7;

export const AttentionPanel = () => {
  const { data: identity } = useGetIdentity<UserProfile>();
  const canManagePanchanga =
    identity?.role === "SUPER_ADMIN" || identity?.role === "PANCHANGA_ADMIN";
  const panchangas = useList<DailyPanchanga>({
    resource: "daily_panchanga",
    pagination: { mode: "off" },
    queryOptions: { enabled: canManagePanchanga },
  });

  if (!canManagePanchanga || panchangas.query.isLoading) return null;

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const records = panchangas.result?.data ?? [];
  const futureCount = records.filter((item) => item.panchanga_date > today).length;
  const waitingApproval = records.filter(
    (item) => item.panchanga_date >= today && !item.approve_status,
  ).length;
  const needsMoreFutureEntries = futureCount < MINIMUM_FUTURE_ENTRIES;

  if (!needsMoreFutureEntries && waitingApproval === 0) {
    return (
      <Alert severity="success" variant="outlined" sx={{ borderRadius: 2.5 }}>
        Panchanga content is ready: one full week of future entries is available and all scheduled entries are approved.
      </Alert>
    );
  }

  return (
    <Alert
      severity="warning"
      variant="outlined"
      sx={{ borderRadius: 2.5, alignItems: "flex-start" }}
    >
      <AlertTitle sx={{ fontWeight: 700 }}>Needs your attention</AlertTitle>
      <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
        {needsMoreFutureEntries && (
          <Chip
            icon={<CalendarMonthOutlinedIcon />}
            label={`Panchanga: ${futureCount}/${MINIMUM_FUTURE_ENTRIES} future entries available`}
            color="warning"
            variant="outlined"
          />
        )}
        {waitingApproval > 0 && (
          <Chip
            icon={<AccessTimeIcon />}
            label={`Panchanga: ${waitingApproval} scheduled entries waiting approval`}
            color="warning"
            variant="outlined"
          />
        )}
      </Stack>
    </Alert>
  );
};
