import "@supabase/functions-js/edge-runtime.d.ts";

const PROJECT_ID = Deno.env.get("FIREBASE_PROJECT_ID")!;
const CLIENT_EMAIL = Deno.env.get("FIREBASE_CLIENT_EMAIL")!;
const PRIVATE_KEY = Deno.env
  .get("FIREBASE_PRIVATE_KEY")!
  .replace(/\\n/g, "\n");

interface RequestBody {
  title: string;
  body: string;
  topic?: string;

  notification_code?: string;
  priority?: string;
  type?: string;
  version?: number;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return Response.json(
        {
          success: false,
          error: "Method Not Allowed",
        },
        {
          status: 405,
        },
      );
    }

    const body: RequestBody = await req.json();

    if (!body.title || !body.body) {
      return Response.json(
        {
          success: false,
          error: "title and body are required",
        },
        {
          status: 400,
        },
      );
    }

    const topic = body.topic ?? "all_users";

    //----------------------------------------------------------
    // Create JWT
    //----------------------------------------------------------

    const now = Math.floor(Date.now() / 1000);

    const header = {
      alg: "RS256",
      typ: "JWT",
    };

    const payload = {
      iss: CLIENT_EMAIL,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    };

    const encoder = new TextEncoder();

    const encode = (obj: unknown) =>
      btoa(JSON.stringify(obj))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

    const unsignedJwt =
      `${encode(header)}.${encode(payload)}`;

    //----------------------------------------------------------
    // Import Private Key
    //----------------------------------------------------------

    const pem = PRIVATE_KEY
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replace(/\s/g, "");

    const binary = atob(pem);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      bytes.buffer,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["sign"],
    );

    //----------------------------------------------------------
    // Sign JWT
    //----------------------------------------------------------

    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      encoder.encode(unsignedJwt),
    );

    const jwt =
      unsignedJwt +
      "." +
      btoa(
        String.fromCharCode(...new Uint8Array(signature)),
      )
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

    //----------------------------------------------------------
    // Exchange JWT for OAuth Token
    //----------------------------------------------------------

    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type:
            "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: jwt,
        }),
      },
    );

    const tokenJson = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(JSON.stringify(tokenJson));
    }

    //----------------------------------------------------------
    // Send FCM
    //----------------------------------------------------------

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenJson.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            topic,

            notification: {
              title: body.title,
              body: body.body,
            },

            data: {
              notification_code:
                body.notification_code ?? "",

              priority:
                body.priority ?? "NORMAL",

              type:
                body.type ?? "GENERAL",

              version:
                String(body.version ?? 1),
            },
          },
        }),
      },
    );

    const json = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(json));
    }

    return Response.json({
      success: true,
      result: json,
    });
  } catch (e) {
    console.error(e);

    return Response.json(
      {
        success: false,
        error: String(e),
      },
      {
        status: 500,
      },
    );
  }
});