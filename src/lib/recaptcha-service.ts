// src/lib/recaptcha-service.ts

interface RecaptchaVerificationResponse {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  score: number;
  action: string;
  error_codes?: string[];
}

/**
 * Verifica token de reCAPTCHA v3 con los servidores de Google
 */
export async function verifyRecaptcha(token: string, action: string): Promise<{
  success: boolean;
  score: number;
  error?: string;
}> {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || "0.5");

    if (!secretKey) {
      throw new Error("RECAPTCHA_SECRET_KEY not configured");
    }

    if (!token) {
      return {
        success: false,
        score: 0,
        error: "Token not provided",
      };
    }

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });

    if (!response.ok) {
      throw new Error(`reCAPTCHA verification failed with status ${response.status}`);
    }

    const data: RecaptchaVerificationResponse = await response.json();

    // Verificar que la acción sea correcta
    if (data.action !== action) {
      return {
        success: false,
        score: 0,
        error: "Invalid action",
      };
    }

    // Verificar score mínimo
    if (data.score < minScore) {
      return {
        success: false,
        score: data.score,
        error: `Score too low: ${data.score} (minimum: ${minScore})`,
      };
    }

    return {
      success: true,
      score: data.score,
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return {
      success: false,
      score: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
