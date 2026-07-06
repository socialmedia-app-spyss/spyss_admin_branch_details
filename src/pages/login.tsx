import { useLogin } from "@refinedev/core";
import { Avatar, Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import spyssLogo from "../assets/spyss-logo.png";

export const LoginPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loginError, setLoginError] = useState("");
  const { mutate: login, isPending } = useLogin<{ email: string; password: string }>({
    mutationOptions: {
      onSuccess: async ({ success, error }) => {
        if (!success) {
          setLoginError(error?.message || "Invalid email or password");
          return;
        }

        setLoginError("");
        await queryClient.invalidateQueries({ queryKey: ["auth"] });
        navigate("/dashboard", { replace: true });
      },
      onError: (error) => {
        setLoginError(error.message || "Invalid email or password");
      },
    },
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isPending) {
      return;
    }
    setLoginError("");
    login({ email, password });
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f9ff 0%, #eef4fb 100%)",
        px: 2,
        py: 4,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 460,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
		  
          <Avatar
            src={spyssLogo}
            alt="SPYSS Logo"
            sx={{
              width: { xs: 90, sm: 104 },
              height: { xs: 90, sm: 104 },
              mx: "auto",
              mb: 2,
              bgcolor: "transparent",
            }}
            imgProps={{
              style: {
                objectFit: "contain",
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Shri Patanjali Yoga Shikshana Samithi (R) Karnataka
          </Typography>
		  <Typography component="h1" variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
            SPYSS Branches Admin Panel
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {loginError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {loginError}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isPending}
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.3, fontWeight: 600, borderRadius: 2 }}
            >
              {isPending ? "Signing In..." : "Sign In"}
            </Button>
            <Link to="/register" style={{ textDecoration: "none" }}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                sx={{ py: 1.2, fontWeight: 600, borderRadius: 2 }}
              >
                Register
              </Button>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
