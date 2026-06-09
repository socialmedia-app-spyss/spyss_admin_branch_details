import { useRegister } from "@refinedev/core";
import { Box, TextField, Button, Typography, Container } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";

export const RegisterPage = () => {
  const { mutate: register } = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); // New state for full_name

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Pass full_name along with email and password
    register({ email, password, full_name: fullName });
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
          Register for SPYSS Admin
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="full-name"
            label="Full Name"
            name="full_name"
            autoComplete="name"
            autoFocus
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button fullWidth variant="outlined">
              Already have an account? Sign In
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
};