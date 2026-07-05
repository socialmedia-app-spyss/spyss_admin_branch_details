import { useLogin } from "@refinedev/core";
import { Box, TextField, Button, Typography, Container } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

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
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in to SPYSS Admin
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
            sx={{ mt: 3, mb: 2 }}
          >
            {isPending ? "Signing In..." : "Sign In"}
          </Button>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button fullWidth variant="outlined">
              Register
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
};
