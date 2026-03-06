/**
 * OAuth Manager - Handles Google OAuth for Firestore access.
 */

import { OAuth2Client } from 'google-auth-library';

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class OAuthManager {
  private client: OAuth2Client;

  constructor(config: OAuthConfig) {
    this.client = new OAuth2Client(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  /**
   * Generate the OAuth authorization URL.
   */
  getAuthUrl(state: string): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        // Firestore access
        'https://www.googleapis.com/auth/datastore',
        // User identity
        'openid',
        'email',
        'profile',
      ],
      state,
    });
  }

  /**
   * Exchange authorization code for tokens.
   */
  async exchangeCode(code: string): Promise<OAuthTokens> {
    const { tokens } = await this.client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to get tokens from OAuth exchange');
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date || Date.now() + 3600 * 1000,
      scope: tokens.scope || '',
    };
  }

  /**
   * Refresh an access token using the refresh token.
   */
  async refreshTokens(refreshToken: string): Promise<OAuthTokens> {
    this.client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await this.client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error('Failed to refresh access token');
    }

    return {
      accessToken: credentials.access_token,
      refreshToken: credentials.refresh_token || refreshToken,
      expiresAt: credentials.expiry_date || Date.now() + 3600 * 1000,
      scope: credentials.scope || '',
    };
  }

  /**
   * Get a valid access token, refreshing if needed.
   */
  async getValidAccessToken(tokens: OAuthTokens): Promise<string> {
    // Refresh if expiring in less than 5 minutes
    if (tokens.expiresAt < Date.now() + 5 * 60 * 1000) {
      const refreshed = await this.refreshTokens(tokens.refreshToken);
      return refreshed.accessToken;
    }
    return tokens.accessToken;
  }

  /**
   * Verify the access token and get user info.
   */
  async verifyToken(accessToken: string): Promise<{
    email: string;
    name: string;
    picture?: string;
  }> {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to verify token');
    }

    const data = (await response.json()) as {
      email: string;
      name: string;
      picture?: string;
    };
    
    return {
      email: data.email,
      name: data.name,
      picture: data.picture,
    };
  }
}
