import { google } from "googleapis";
import { db } from "@repo/db";
import { account } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { getHeaders } from '@tanstack/react-start/server'
import { auth } from "@repo/auth/auth";

export const GetUserSession = async () => {
  const session = await auth.api.getSession({
    headers: new Headers(await getHeaders() as Record<string, string>),
  });
  if (!session?.user) {
    throw new Error("User not authenticated");
  }
  return session.user;
};

export const setupGoogleAuth = async (userId: string) => {
  const googleAccount = await db
    .select()
    .from(account)
    .where(eq(account.userId, userId));

  if (googleAccount.length === 0) {
    throw new Error("Please connect your Google account");
  }

  const accessToken = googleAccount[0]?.accessToken;
  const refreshToken = googleAccount[0]?.refreshToken;

  console.log('Token check:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessTokenLength: accessToken?.length,
    refreshTokenLength: refreshToken?.length
  });

  if (!refreshToken) {
    throw new Error("REFRESH_TOKEN_MISSING: Please disconnect and reconnect your Google account to grant calendar permissions again.");
  }

  const oauth2Client = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  });

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  oauth2Client.on("tokens", async (tokens) => {
    console.log('Auto-refreshing tokens...');
    try {
      await db
        .update(account)
        .set({
          accessToken: tokens.access_token,
          ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
          updatedAt: new Date(),
        })
        .where(eq(account.userId, userId));
      console.log('Tokens updated successfully');
    } catch (error) {
      console.error('Error updating tokens:', error);
    }
  });

  try {
    const tokenInfo = await oauth2Client.getTokenInfo(accessToken || '');
    console.log('Token info:', tokenInfo);
  } catch (tokenError) {
    console.log('Token invalid, attempting refresh...');
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);

      await db
        .update(account)
        .set({
          accessToken: credentials.access_token,
          ...(credentials.refresh_token && { refreshToken: credentials.refresh_token }),
          updatedAt: new Date(),
        })
        .where(eq(account.userId, userId));

      console.log('Token refreshed successfully');
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      throw new Error("REFRESH_FAILED: Your Google account session has expired. Please disconnect and reconnect your Google account.");
    }
  }

  return oauth2Client;
};

export const getCalendarClient = async (userId: string) => {
  const oauth2Client = await setupGoogleAuth(userId);
  return google.calendar({ version: "v3", auth: oauth2Client });
};

export const checkGoogleAuthStatus = async (userId: string) => {
  try {
    const googleAccount = await db
      .select()
      .from(account)
      .where(eq(account.userId, userId));

    if (googleAccount.length === 0) {
      return { status: 'not_connected', message: 'No Google account connected' };
    }

    const accessToken = googleAccount[0]?.accessToken;
    const refreshToken = googleAccount[0]?.refreshToken;
    if (!refreshToken) {
      return { status: 'refresh_token_missing', message: 'Refresh token missing - re-authorization required' };
    }

    if (!accessToken) {
      return { status: 'access_token_missing', message: 'Access token missing' };
    }

    const oauth2Client = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    });

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    try {
      await oauth2Client.getTokenInfo(accessToken);
      return { status: 'valid', message: 'Tokens are valid' };
    } catch (error) {
      try {
        await oauth2Client.refreshAccessToken();
        return { status: 'refreshed', message: 'Tokens refreshed successfully' };
      } catch (refreshError) {
        return { status: 'expired', message: 'Tokens expired - re-authorization required' };
      }
    }
  } catch (error) {
    return { status: 'error', message: `Error checking auth status: ${error}` };
  }
};
