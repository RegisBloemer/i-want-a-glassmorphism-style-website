const YOUTUBE_API_ROOT = "https://www.googleapis.com/youtube/v3";
const CHANNEL_HANDLE = "@Station_LIVE";
const CACHE_TTL_MS = 55_000;

type YouTubeThumbnail = { url?: string };

type YouTubeVideo = {
  id: string;
  snippet?: {
    title?: string;
    publishedAt?: string;
    liveBroadcastContent?: "none" | "live" | "upcoming";
    thumbnails?: Record<string, YouTubeThumbnail>;
  };
  contentDetails?: { duration?: string };
  liveStreamingDetails?: {
    scheduledStartTime?: string;
    actualStartTime?: string;
    actualEndTime?: string;
    concurrentViewers?: string;
  };
};

type PublicVideo = {
  id: string;
  title: string;
  publishedAt: string;
  duration: string;
  thumbnail: string;
  href: string;
  kind: "video" | "live" | "upcoming" | "live-archive";
  scheduledStartTime?: string;
  actualStartTime?: string;
  concurrentViewers?: string;
};

type FeedResponse = {
  configured: true;
  channel: {
    title: string;
    subscriberCount: string | null;
    videoCount: string | null;
  };
  videos: PublicVideo[];
  live: PublicVideo | null;
  updatedAt: string;
};

let memoryCache: { expiresAt: number; value: FeedResponse } | null = null;

function formatDuration(value = "PT0S") {
  const match = value.match(/P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "00:00";

  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0) + days * 24;
  const minutes = Number(match[3] ?? 0);
  const seconds = Number(match[4] ?? 0);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function selectThumbnail(video: YouTubeVideo) {
  const thumbnails = video.snippet?.thumbnails;
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
  );
}

async function youtubeGet<T>(path: string, params: Record<string, string>, apiKey: string) {
  const url = new URL(`${YOUTUBE_API_ROOT}/${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`YouTube Data API returned ${response.status}`);
  }
  return (await response.json()) as T;
}

async function loadChannelFeed(apiKey: string): Promise<FeedResponse> {
  const channelResult = await youtubeGet<{
    items?: Array<{
      id: string;
      snippet?: { title?: string };
      contentDetails?: { relatedPlaylists?: { uploads?: string } };
      statistics?: { subscriberCount?: string; videoCount?: string };
    }>;
  }>(
    "channels",
    {
      part: "snippet,contentDetails,statistics",
      forHandle: CHANNEL_HANDLE,
      maxResults: "1",
    },
    apiKey,
  );

  const channel = channelResult.items?.[0];
  const uploadsPlaylist = channel?.contentDetails?.relatedPlaylists?.uploads;
  if (!channel || !uploadsPlaylist) throw new Error("StationLIVE channel was not found");

  const playlistResult = await youtubeGet<{
    items?: Array<{ contentDetails?: { videoId?: string } }>;
  }>(
    "playlistItems",
    {
      part: "contentDetails",
      playlistId: uploadsPlaylist,
      maxResults: "15",
    },
    apiKey,
  );

  const ids = (playlistResult.items ?? [])
    .map((item) => item.contentDetails?.videoId)
    .filter((id): id is string => Boolean(id));

  if (!ids.length) throw new Error("The channel uploads playlist is empty");

  const videoResult = await youtubeGet<{ items?: YouTubeVideo[] }>(
    "videos",
    {
      part: "snippet,contentDetails,liveStreamingDetails",
      id: ids.join(","),
    },
    apiKey,
  );

  const videos = (videoResult.items ?? [])
    .map((video): PublicVideo => {
      const broadcastState = video.snippet?.liveBroadcastContent;
      const kind =
        broadcastState === "live"
          ? "live"
          : broadcastState === "upcoming"
            ? "upcoming"
            : video.liveStreamingDetails?.actualEndTime
              ? "live-archive"
              : "video";

      return {
        id: video.id,
        title: video.snippet?.title ?? "Conteúdo StationLIVE",
        publishedAt:
          kind === "video"
            ? (video.snippet?.publishedAt ?? new Date().toISOString())
            : (video.liveStreamingDetails?.actualStartTime ??
              video.liveStreamingDetails?.scheduledStartTime ??
              video.snippet?.publishedAt ??
              new Date().toISOString()),
        duration: kind === "live" ? "NO AR" : formatDuration(video.contentDetails?.duration),
        thumbnail: selectThumbnail(video),
        href: `https://www.youtube.com/watch?v=${video.id}`,
        kind,
        scheduledStartTime: video.liveStreamingDetails?.scheduledStartTime,
        actualStartTime: video.liveStreamingDetails?.actualStartTime,
        concurrentViewers: video.liveStreamingDetails?.concurrentViewers,
      };
    })
    .sort((a, b) => {
      if (a.kind === "live" && b.kind !== "live") return -1;
      if (b.kind === "live" && a.kind !== "live") return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

  return {
    configured: true,
    channel: {
      title: channel.snippet?.title ?? "StationLIVE",
      subscriberCount: channel.statistics?.subscriberCount ?? null,
      videoCount: channel.statistics?.videoCount ?? null,
    },
    videos,
    live: videos.find((video) => video.kind === "live") ?? null,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return Response.json(
      { configured: false, message: "YouTube synchronization is not configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (memoryCache && memoryCache.expiresAt > Date.now()) {
    return Response.json(memoryCache.value, {
      headers: { "Cache-Control": "public, max-age=20, s-maxage=55, stale-while-revalidate=300" },
    });
  }

  try {
    const value = await loadChannelFeed(apiKey);
    memoryCache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
    return Response.json(value, {
      headers: { "Cache-Control": "public, max-age=20, s-maxage=55, stale-while-revalidate=300" },
    });
  } catch {
    if (memoryCache) {
      return Response.json(memoryCache.value, {
        headers: { "Cache-Control": "public, max-age=20, s-maxage=55, stale-while-revalidate=300" },
      });
    }
    return Response.json(
      { configured: false, message: "YouTube is temporarily unavailable" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
