import { useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/mui";
import { supabaseClient } from "../../supabaseClient";
import type { DailyAmruthaVachana } from "../../types/amruthaVachana";

const FUNCTION_NAME = "generate-amrutha-vachana-kn";

type GenerateResponse = {
  status?: "generated" | "already_current" | "skipped";
  reason?: string;
  error?: string;
};

const errorMessage = async (error: unknown) => {
  const context = (error as { context?: unknown })?.context;
  if (context instanceof Response) {
    try {
      const payload = (await context.json()) as GenerateResponse;
      if (payload.error) return payload.error;
    } catch {
      // Use the Functions client message below.
    }
  }
  return (error as { message?: string })?.message || "Unable to generate the Amrutha Vachana image.";
};

export const AmruthaVachanaShow = () => {
  const { query } = useShow<DailyAmruthaVachana>({ resource: "daily_amrutha_vachana" });
  const record = query.data?.data;
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!record) return;
    setIsGenerating(true);
    setMessage(null);
    setError(null);
    try {
      const result = await supabaseClient.functions.invoke<GenerateResponse>(FUNCTION_NAME, {
        body: { vachana_date: record.vachana_date },
      });
      if (result.error) {
        setError(await errorMessage(result.error));
        return;
      }
      if (result.data?.status === "skipped") {
        setError(result.data.reason || "Image generation was skipped.");
        return;
      }
      setMessage(
        result.data?.status === "already_current"
          ? "The generated image is already current."
          : "Amrutha Vachana image generated successfully.",
      );
      await query.refetch();
    } finally {
      setIsGenerating(false);
    }
  };

  if (query.isLoading) {
    return <Show title="Amrutha Vachana Image"><Box display="grid" sx={{ placeItems: "center" }} minHeight={320}><CircularProgress /></Box></Show>;
  }
  if (!record) {
    return <Show title="Amrutha Vachana Image"><Alert severity="error">Unable to load this Amrutha Vachana.</Alert></Show>;
  }

  const canGenerate = record.approve_status && record.is_active;
  return (
    <Show title="Amrutha Vachana Image">
      <Stack spacing={2} alignItems="center">
        <Typography variant="h6">{record.title || record.vachana_date}</Typography>
        <Stack direction="row" spacing={1}>
          <Chip size="small" color={record.approve_status ? "success" : "default"} label={record.approve_status ? "Approved" : "Not Approved"} />
          <Chip size="small" color={record.is_active ? "success" : "default"} label={record.is_active ? "Active" : "Inactive"} />
        </Stack>
        <Button
          variant="contained"
          startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
          disabled={isGenerating || !canGenerate}
          onClick={generate}
        >
          {isGenerating ? "Generating image…" : record.image_url ? "Regenerate image" : "Generate image"}
        </Button>
        {!canGenerate && <Alert severity="info" sx={{ width: "100%", maxWidth: 760 }}>Approve and activate this record before generating its image.</Alert>}
        {(error || record.image_generation_error) && <Alert severity="error" sx={{ width: "100%", maxWidth: 760 }}>{error || record.image_generation_error}</Alert>}
        {message && <Alert severity="success" sx={{ width: "100%", maxWidth: 760 }}>{message}</Alert>}
        {record.image_url ? (
          <Paper variant="outlined" sx={{ width: "100%", maxWidth: 760, p: 1.5 }}>
            <Box component="img" src={record.image_url} alt={`Generated Amrutha Vachana for ${record.vachana_date}`} sx={{ display: "block", width: "100%", height: "auto" }} />
            <Button component="a" href={record.image_url} target="_blank" rel="noopener" endIcon={<OpenInNewIcon />} sx={{ mt: 1 }}>Open full-size image</Button>
          </Paper>
        ) : (
          <Alert severity="info" sx={{ width: "100%", maxWidth: 760 }}>No generated image is available yet.</Alert>
        )}
      </Stack>
    </Show>
  );
};
