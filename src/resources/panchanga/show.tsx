import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/mui";
import type { DailyPanchanga } from "../../types/panchanga";

const hasValue = (value: unknown) =>
  value !== null && value !== undefined && String(value).trim() !== "";

const detailFields: Array<[keyof DailyPanchanga, string, string]> = [
  ["ayana", "ಆಯನ", "#c2185b"],
  ["rutu", "ಋತು", "#b71c1c"],
  ["masa", "ಮಾಸ", "#283593"],
  ["paksha", "ಪಕ್ಷ", "#d32f2f"],
  ["tithi", "ತಿಥಿ", "#283593"],
  ["vasara", "ವಾಸರ", "#ad1457"],
  ["nakshatra", "ನಕ್ಷತ್ರ", "#1b5e20"],
  ["yoga", "ಯೋಗ", "#2e7d32"],
  ["karana", "ಕರಣ", "#283593"],
];

const yearFields: Array<[keyof DailyPanchanga, string]> = [
  ["krishna_shaka_year", "ಶ್ರೀ ಕೃಷ್ಣ ಶಕ"],
  ["shalivahana_shaka_year", "ಶ್ರೀ ಶಾಲಿವಾಹನ ಶಕ"],
  ["kali_yuga_year", "ಕಲಿಯುಗ"],
];

export const PanchangaShow = () => {
  const { query } = useShow<DailyPanchanga>({ resource: "daily_panchanga" });
  const record = query.data?.data;

  if (query.isLoading) {
    return (
      <Show title="Panchanga Details">
        <Box display="grid" sx={{ placeItems: "center" }} minHeight={320}>
          <CircularProgress />
        </Box>
      </Show>
    );
  }

  if (!record) {
    return (
      <Show title="Panchanga Details">
        <Alert severity="error">Unable to load this Panchanga entry.</Alert>
      </Show>
    );
  }

  const years = yearFields.filter(([name]) => hasValue(record[name]));
  const details = detailFields.filter(([name]) => hasValue(record[name]));
  const notes = [record.special_note, record.special_note2, record.special_note3].filter(hasValue);
  const displayDate = hasValue(record.display_date)
    ? record.display_date
    : `ದಿನಾಂಕ: ${record.panchanga_date}`;

  return (
    <Show title="Panchanga Details">
      <Stack spacing={2.5} alignItems="center">
        <Paper
          elevation={3}
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 760,
            overflow: "hidden",
            px: { xs: 2.5, sm: 6 },
            py: { xs: 4, sm: 5 },
            textAlign: "center",
            color: "#3e2723",
            background:
              "radial-gradient(circle at 50% 25%, rgba(255,255,255,.92), rgba(235,248,252,.92) 45%, rgba(210,239,248,.96))",
            border: "1px solid #9bc7d8",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 12,
              border: "1.5px solid #283593",
              pointerEvents: "none",
            },
          }}
        >
          <Typography
            aria-hidden
            sx={{
              position: "relative",
              zIndex: 1,
              mb: 1.5,
              color: "#283593",
              letterSpacing: 3,
              fontSize: { xs: 14, sm: 18 },
            }}
          >
            ───────── ◆ ◆◆ ◆ ─────────
          </Typography>

          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            {hasValue(record.language) && (
              <Typography variant="caption" fontWeight={700} color="#37474f">
                {record.language.toUpperCase()}
              </Typography>
            )}
            <Typography
              component="h2"
              sx={{
                px: 3,
                py: 0.5,
                mx: "auto",
                borderRadius: 1,
                bgcolor: "#2e247f",
                color: "#fff176",
                fontSize: { xs: 23, sm: 30 },
                fontWeight: 800,
                lineHeight: 1.25,
              }}
            >
              ಪಂಚಾಂಗ
            </Typography>
            {record.approve_status !== null && record.approve_status !== undefined && (
              <Chip
                size="small"
                color={record.approve_status ? "success" : "default"}
                label={record.approve_status ? "Approved" : "Not Approved"}
              />
            )}
          </Stack>

          {years.length > 0 && (
            <Stack
              direction="row"
              useFlexGap
              flexWrap="wrap"
              justifyContent="center"
              divider={<Divider orientation="vertical" flexItem />}
              gap={{ xs: 1, sm: 2 }}
              my={3}
            >
              {years.map(([name, label]) => (
                <Typography key={name} sx={{ fontSize: { xs: 17, sm: 22 }, fontWeight: 700 }}>
                  {label} {String(record[name])}
                </Typography>
              ))}
            </Stack>
          )}

          {hasValue(record.samvatsara) && (
            <Box my={3} textAlign="center">
              <Typography variant="caption" display="block" color="text.secondary">
                ಸಂವತ್ಸರ
              </Typography>
              <Typography
                sx={{
                  color: "#7b1f6a",
                  fontSize: { xs: 22, sm: 28 },
                  fontWeight: 800,
                  lineHeight: 1.3,
                }}
              >
                {record.samvatsara}
              </Typography>
            </Box>
          )}

          {details.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                alignItems: "center",
                gap: { xs: 2, sm: 2.5 },
                my: 3,
              }}
            >
              {details.map(([name, label, color]) => (
                <Box
                  key={name}
                  sx={{
                    minWidth: 0,
                    px: 1,
                  }}
                >
                  <Typography variant="caption" display="block" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography
                    sx={{
                      color,
                      fontSize: { xs: 19, sm: 24 },
                      fontWeight: 800,
                      lineHeight: 1.25,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {String(record[name])}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {hasValue(displayDate) && (
            <Typography
              sx={{
                mt: 3,
                color: "#c2185b",
                fontSize: { xs: 20, sm: 26 },
                fontWeight: 800,
              }}
            >
              {String(displayDate)}
              {hasValue(record.weekday) && (
                <Box component="span" sx={{ ml: 1 }}>
                  ({record.weekday})
                </Box>
              )}
            </Typography>
          )}

          {notes.length > 0 && (
            <Stack spacing={1.25} mt={4}>
              {notes.map((note, index) => (
                <Typography
                  key={index}
                  sx={{
                    px: 2,
                    py: 1,
                    bgcolor: index === 0 ? "#4e342e" : "rgba(255,255,255,.62)",
                    color: index === 0 ? "#fff" : "#4e342e",
                    fontSize: { xs: 16, sm: 19 },
                    fontWeight: 600,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {String(note)}
                </Typography>
              ))}
            </Stack>
          )}

          <Typography
            aria-hidden
            sx={{
              position: "relative",
              zIndex: 1,
              mt: 2,
              color: "#283593",
              letterSpacing: 3,
              fontSize: { xs: 14, sm: 18 },
            }}
          >
            ───────── ◆ ◆◆ ◆ ─────────
          </Typography>
        </Paper>

        {record.image_url && (
          <Button
            component="a"
            href={record.image_url}
            target="_blank"
            rel="noopener"
            variant="outlined"
            endIcon={<OpenInNewIcon />}
          >
            Open generated poster
          </Button>
        )}
      </Stack>
    </Show>
  );
};
