import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";

// In-memory cache for app access token
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAppAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  // Get new app access token
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.TWITCH_CLIENT_ID,
      client_secret: env.TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get app access token: ${response.statusText}`);
  }

  const data = await response.json() as {
    access_token: string;
    expires_in: number;
    token_type: string;
  };

  // Cache the token with 1 hour buffer before expiration
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 3600) * 1000,
  };

  return data.access_token;
}

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
}

interface TwitchUsersResponse {
  data: TwitchUser[];
}

interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  tags: string[];
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean;
}

interface TwitchStreamsResponse {
  data: TwitchStream[];
  pagination: {
    cursor?: string;
  };
}

export const twitchRouter = createTRPCRouter({
  getUserProfile: publicProcedure
    .input(z.object({ 
      username: z.string().min(1, "Username is required").toLowerCase() 
    }))
    .query(async ({ input }) => {
      try {
        const accessToken = await getAppAccessToken();

        const response = await fetch(
          `https://api.twitch.tv/helix/users?login=${encodeURIComponent(input.username)}`,
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Client-Id": env.TWITCH_CLIENT_ID,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.statusText}`);
        }

        const data = await response.json() as TwitchUsersResponse;

        if (data.data.length === 0) {
          return null; // User not found
        }

        const user = data.data[0];
        if (!user) {
          return null;
        }

        return {
          id: user.id,
          username: user.login,
          displayName: user.display_name,
          profileImageUrl: user.profile_image_url,
          description: user.description,
          viewCount: user.view_count,
          createdAt: user.created_at,
        };
      } catch (error) {
        console.error("Error fetching user profile:", error);
        throw new Error("Failed to fetch user profile");
      }
    }),

  getUserProfiles: publicProcedure
    .input(z.object({ 
      usernames: z.array(z.string().min(1)).max(100, "Maximum 100 usernames allowed") 
    }))
    .query(async ({ input }) => {
      try {
        if (input.usernames.length === 0) {
          return [];
        }

        const accessToken = await getAppAccessToken();
        const lowercaseUsernames = input.usernames.map(u => u.toLowerCase());
        const loginParams = lowercaseUsernames.map(u => `login=${encodeURIComponent(u)}`).join('&');

        const response = await fetch(
          `https://api.twitch.tv/helix/users?${loginParams}`,
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Client-Id": env.TWITCH_CLIENT_ID,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch user profiles: ${response.statusText}`);
        }

        const data = await response.json() as TwitchUsersResponse;

        return data.data.map(user => ({
          id: user.id,
          username: user.login,
          displayName: user.display_name,
          profileImageUrl: user.profile_image_url,
          description: user.description,
          viewCount: user.view_count,
          createdAt: user.created_at,
        }));
      } catch (error) {
        console.error("Error fetching user profiles:", error);
        throw new Error("Failed to fetch user profiles");
      }
    }),

  getStreamStatus: publicProcedure
    .input(z.object({ 
      username: z.string().min(1, "Username is required").toLowerCase() 
    }))
    .query(async ({ input }) => {
      try {
        const accessToken = await getAppAccessToken();

        const response = await fetch(
          `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(input.username)}`,
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Client-Id": env.TWITCH_CLIENT_ID,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch stream status: ${response.statusText}`);
        }

        const data = await response.json() as TwitchStreamsResponse;

        // If data.data has items, the user is live
        const isLive = data.data.length > 0;
        const streamData = data.data[0];

        return {
          isLive,
          streamInfo: streamData ? {
            id: streamData.id,
            title: streamData.title,
            gameName: streamData.game_name,
            viewerCount: streamData.viewer_count,
            startedAt: streamData.started_at,
            thumbnailUrl: streamData.thumbnail_url,
          } : null,
        };
      } catch (error) {
        console.error("Error fetching stream status:", error);
        // Return offline status on error to avoid showing online when we can't determine
        return {
          isLive: false,
          streamInfo: null,
        };
      }
    }),

  getMultipleStreamStatus: publicProcedure
    .input(z.object({ 
      usernames: z.array(z.string().min(1)).max(100, "Maximum 100 usernames allowed") 
    }))
    .query(async ({ input }) => {
      try {
        if (input.usernames.length === 0) {
          return [];
        }

        const accessToken = await getAppAccessToken();
        const lowercaseUsernames = input.usernames.map(u => u.toLowerCase());
        const loginParams = lowercaseUsernames.map(u => `user_login=${encodeURIComponent(u)}`).join('&');

        const response = await fetch(
          `https://api.twitch.tv/helix/streams?${loginParams}`,
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Client-Id": env.TWITCH_CLIENT_ID,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch stream statuses: ${response.statusText}`);
        }

        const data = await response.json() as TwitchStreamsResponse;

        // Create a map of live streamers
        const liveStreamers = new Map(
          data.data.map(stream => [stream.user_login.toLowerCase(), {
            id: stream.id,
            title: stream.title,
            gameName: stream.game_name,
            viewerCount: stream.viewer_count,
            startedAt: stream.started_at,
            thumbnailUrl: stream.thumbnail_url,
          }])
        );

        // Return status for all requested usernames
        return lowercaseUsernames.map(username => ({
          username,
          isLive: liveStreamers.has(username),
          streamInfo: liveStreamers.get(username) || null,
        }));
      } catch (error) {
        console.error("Error fetching stream statuses:", error);
        // Return all offline on error
        return input.usernames.map(username => ({
          username: username.toLowerCase(),
          isLive: false,
          streamInfo: null,
        }));
      }
    }),

  // Validate user existence
  validateUser: publicProcedure
    .input(z.object({ 
      username: z.string().min(1, "Username is required").toLowerCase() 
    }))
    .query(async ({ input }) => {
      try {
        const accessToken = await getAppAccessToken();

        const response = await fetch(
          `https://api.twitch.tv/helix/users?login=${encodeURIComponent(input.username)}`,
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Client-Id": env.TWITCH_CLIENT_ID,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to validate user: ${response.statusText}`);
        }

        const data = await response.json() as TwitchUsersResponse;
        return { exists: data.data.length > 0 };
      } catch (error) {
        console.error("Error validating user:", error);
        return { exists: false };
      }
    }),

  // Get complete user info with stream status for autocomplete
  getUsersWithStatus: publicProcedure
    .input(z.object({ 
      usernames: z.array(z.string().min(1)).max(10, "Maximum 10 usernames allowed") 
    }))
    .query(async ({ input }) => {
      try {
        if (input.usernames.length === 0) {
          return [];
        }

        const accessToken = await getAppAccessToken();
        const lowercaseUsernames = input.usernames.map(u => u.toLowerCase());
        
        // Fetch both user profiles and stream status in parallel
        const [usersResponse, streamsResponse] = await Promise.all([
          fetch(
            `https://api.twitch.tv/helix/users?${lowercaseUsernames.map(u => `login=${encodeURIComponent(u)}`).join('&')}`,
            {
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Client-Id": env.TWITCH_CLIENT_ID,
              },
            }
          ),
          fetch(
            `https://api.twitch.tv/helix/streams?${lowercaseUsernames.map(u => `user_login=${encodeURIComponent(u)}`).join('&')}`,
            {
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Client-Id": env.TWITCH_CLIENT_ID,
              },
            }
          )
        ]);

        if (!usersResponse.ok || !streamsResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const [usersData, streamsData] = await Promise.all([
          usersResponse.json() as Promise<TwitchUsersResponse>,
          streamsResponse.json() as Promise<TwitchStreamsResponse>
        ]);

        // Create maps for quick lookup
        const usersMap = new Map(
          usersData.data.map(user => [user.login.toLowerCase(), user])
        );

        const liveStreamers = new Map(
          streamsData.data.map(stream => [stream.user_login.toLowerCase(), {
            id: stream.id,
            title: stream.title,
            gameName: stream.game_name,
            viewerCount: stream.viewer_count,
            startedAt: stream.started_at,
            thumbnailUrl: stream.thumbnail_url,
          }])
        );

        // Return combined data for requested usernames
        return lowercaseUsernames.map(username => {
          const user = usersMap.get(username);
          const streamInfo = liveStreamers.get(username);
          
          if (!user) {
            return {
              username,
              exists: false,
              profileImageUrl: null,
              displayName: null,
              isLive: false,
              streamInfo: null,
            };
          }

          return {
            username: user.login,
            exists: true,
            profileImageUrl: user.profile_image_url,
            displayName: user.display_name,
            isLive: !!streamInfo,
            streamInfo: streamInfo || null,
          };
        }).filter(result => result.exists); // Only return existing users
      } catch (error) {
        console.error("Error fetching users with status:", error);
        return [];
      }
    }),
}); 