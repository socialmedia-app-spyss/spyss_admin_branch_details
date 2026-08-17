import { useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useShow, useOne } from "@refinedev/core";
import { Show } from "@refinedev/mui";
import { supabaseClient } from "../../supabaseClient";
import type { DailyPanchanga } from "../../types/panchanga";
import type { UserProfile } from "../../types/user";

const PANCHANGA_IMAGE_FUNCTION =
  import.meta.env.VITE_PANCHANGA_IMAGE_FUNCTION || "generate-panchanga-kn";

type GeneratePosterResponse = {
  status?: "generated" | "already_current" | "skipped";
  image_url?: string;
  reason?: string;
  error?: string;
};

const functionErrorMessage = async (error: unknown) => {
  const context = (error as { context?: unknown })?.context;
  if (context instanceof Response) {
    try {
      const payload = (await context.json()) as GeneratePosterResponse;
      if (payload.error) return payload.error;
    } catch {
      // Fall back to the Functions client error below.
    }
  }
  return (error as { message?: string })?.message || "Unable to generate the Panchanga image.";
};

export const PanchangaShow = () => {
  const { query } = useShow<DailyPanchanga>({ resource: "daily_panchanga" });
  const record = query.data?.data;
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const { data: createdBy } = useOne<UserProfile>({
    resource: "users",
    id: record?.created_by,
    queryOptions: { enabled: Boolean(record?.created_by) },
  });

  const { data: updatedBy } = useOne<UserProfile>({
    resource: "users",
    id: record?.updated_by,
    queryOptions: { enabled: Boolean(record?.updated_by) },
  });

  const generatePoster = async () => {
    if (!record) return;

    setIsGenerating(true);
    setGenerationMessage(null);
    setGenerationError(null);

    try {
      const { data, error } = await supabaseClient.functions.invoke<GeneratePosterResponse>(
        PANCHANGA_IMAGE_FUNCTION,
        { body: { panchanga_date: record.panchanga_date } },
      );

      if (error) {
        setGenerationError(await functionErrorMessage(error));
        return;
      }

      if (data?.status === "skipped") {
        setGenerationError(data.reason || "Image generation was skipped.");
        return;
      }

      setGenerationMessage(
        data?.status === "already_current"
          ? "The generated poster is already current."
          : "Panchanga poster generated successfully.",
      );
      await query.refetch();
    } finally {
      setIsGenerating(false);
    }
  };

  if (query.isLoading) {
    return (
      <Show title="Panchanga Image">
        <Box display="grid" sx={{ placeItems: "center" }} minHeight={320}>
          <CircularProgress />
        </Box>
      </Show>
    );
  }

  if (!record) {
    return (
      <Show title="Panchanga Image">
        <Alert severity="error">Unable to load this Panchanga entry.</Alert>
      </Show>
    );
  }

  return (
    <Show title="Panchanga Image">
      <Stack spacing={2} alignItems="center" width="100%">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h6">{record.display_date || record.panchanga_date}</Typography>
          <Chip
            size="small"
            color={record.approve_status ? "success" : "default"}
            label={record.approve_status ? "Approved" : "Not Approved"}
          />
        </Stack>

        <Button
          variant="contained"
          startIcon={
            isGenerating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />
          }
          onClick={generatePoster}
          disabled={isGenerating || record.approve_status !== true}
        >
          {isGenerating
            ? "Generating poster…"
            : record.image_url
              ? "Regenerate poster"
              : "Generate poster"}
        </Button>

        {(createdBy?.data || updatedBy?.data) && (
          <Paper variant="outlined" sx={{ p: 2, width: "100%", maxWidth: 760 }}>
            <Typography variant="h6" gutterBottom>Audit Trail</Typography>
            {createdBy?.data && (
              <Typography variant="body2">
                Created by: {createdBy.data.name} ({createdBy.data.email}) on {new Date(record.created_at).toLocaleString()}
              </Typography>
            )}
            {updatedBy?.data && (
              <Typography variant="body2">
                Last updated by: {updatedBy.data.name} ({updatedBy.data.email}) on {new Date(record.updated_at).toLocaleString()}
              </Typography>
            )}
          </Paper>
        )}

        {record.approve_status !== true && (
          <Alert severity="info" sx={{ width: "100%", maxWidth: 760 }}>
            Approve this Panchanga entry before generating its poster.
          </Alert>
        )}
        {(generationError || record.image_generation_error) && (
          <Alert severity="error" sx={{ width: "100%", maxWidth: 760 }}>
            {generationError || record.image_generation_error}
          </Alert>
        )}
        {generationMessage && (
          <Alert severity="success" sx={{ width: "100%", maxWidth: 760 }}>
            {generationMessage}
          </Alert>
        )}

        {record.image_url ? (
          <Paper variant="outlined" sx={{ width: "100%", maxWidth: 760, p: 1.5 }}>
            <Box
              component="img"
              src={record.image_url}
              alt={`Generated Panchanga poster for ${record.panchanga_date}`}
              sx={{ display: "block", width: "100%", height: "auto", objectFit: "contain" }}
            />
            <Button
              component="a"
              href={record.image_url}
              target="_blank"
              rel="noopener"
              variant="text"
              endIcon={<OpenInNewIcon />}
              sx={{ mt: 1 }}
            >
              Open full-size image
            </Button>
          </Paper>
        ) : (
          <Alert severity="info" sx={{ width: "100%", maxWidth: 760 }}>
            No generated poster is available yet.
          </Alert>
        )}
      </Stack>
    </Show>
  );
};