"use client";

import { useEffect, useMemo, useState } from "react";

const CHANNEL_URL = "https://www.youtube.com/@Station_LIVE";
const REFRESH_INTERVAL = 60_000;

type VideoKind = "video" | "live" | "upcoming" | "live-archive";

type ChannelVideo = {
  id: string;
  title: string;
  publishedAt: string;
  duration: string;
  thumbnail: string;
  href: string;
  kind: VideoKind;
  scheduledStartTime?: string;
  actualStartTime?: string;
  concurrentViewers?: string;
};

type ChannelFeed = {
  configured: true;
  channel: {
    title: string;
    subscriberCount: string | null;
    videoCount: string | null;
  };
  videos: ChannelVideo[];
  live: ChannelVideo | null;
  updatedAt: string;
};

const fallbackVideos: ChannelVideo[] = [
  {
    id: "TiKh1ok5sUQ",
    title:
      "Novo Remake de Resident Evil 1 a Caminho e Jogador Vence a Microsoft na Justiça!",
    publishedAt: "2026-07-14T13:01:00-03:00",
    duration: "13:01",
    href: "https://www.youtube.com/watch?v=TiKh1ok5sUQ",
    thumbnail: "https://i.ytimg.com/vi/TiKh1ok5sUQ/hqdefault.jpg",
    kind: "video",
  },
  {
    id: "Y6zobNkPBZs",
    title:
      "Xbox prepara conversão de mídia física e sucesso de AC Black Flag Resynced",
    publishedAt: "2026-07-13T09:26:00-03:00",
    duration: "09:26",
    href: "https://www.youtube.com/watch?v=Y6zobNkPBZs",
    thumbnail: "https://i.ytimg.com/vi/Y6zobNkPBZs/hqdefault.jpg",
    kind: "video",
  },
  {
    id: "R0pyT9jzLZU",
    title:
      "O fim do Far Cry clássico e o alerta de escassez de memória RAM para 2027",
    publishedAt: "2026-07-12T11:27:00-03:00",
    duration: "11:27",
    href: "https://www.youtube.com/watch?v=R0pyT9jzLZU",
    thumbnail: "https://i.ytimg.com/vi/R0pyT9jzLZU/hqdefault.jpg",
    kind: "video",
  },
  {
    id: "qZs1j7TdgQc",
    title: "Qual console comprar para jogar GTA 6?",
    publishedAt: "2026-07-11T09:42:00-03:00",
    duration: "09:42",
    href: "https://www.youtube.com/watch?v=qZs1j7TdgQc",
    thumbnail: "https://i.ytimg.com/vi/qZs1j7TdgQc/hqdefault.jpg",
    kind: "video",
  },
  {
    id: "r4q1YXywYiU",
    title: "God of War Laufey em mídia física + Tomb Raider VR",
    publishedAt: "2026-07-11T10:06:00-03:00",
    duration: "10:06",
    href: "https://www.youtube.com/watch?v=r4q1YXywYiU",
    thumbnail: "https://i.ytimg.com/vi/r4q1YXywYiU/hqdefault.jpg",
    kind: "video",
  },
  {
    id: "J02Fnn_aIUo",
    title:
      "Assassin's Creed Black Flag Resynced e um mod incrível em Red Dead 2",
    publishedAt: "2026-07-10T12:24:00-03:00",
    duration: "12:24",
    href: "https://www.youtube.com/watch?v=J02Fnn_aIUo",
    thumbnail: "https://i.ytimg.com/vi/J02Fnn_aIUo/hqdefault.jpg",
    kind: "video",
  },
  {
    id: "YoETyE8Sw7s",
    title: "God of War 2018 pela primeira vez no PS5 Pro #8",
    publishedAt: "2026-07-09T20:00:00-03:00",
    duration: "1:33:23",
    href: "https://www.youtube.com/watch?v=YoETyE8Sw7s",
    thumbnail: "https://i.ytimg.com/vi/YoETyE8Sw7s/hqdefault.jpg",
    kind: "live-archive",
  },
];

function formatCompactNumber(value: string | null | undefined, fallback: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;

  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(parsed);
}

function dateKey(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function dayLabel(value: string) {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  return `${weekday.replace(".", "").toUpperCase()} ${day}`;
}

function publishedLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "short",
  })
    .format(new Date(value))
    .replace(".", "");
}

function liveMeta(video: ChannelVideo) {
  if (video.kind === "live") {
    return video.concurrentViewers
      ? `${formatCompactNumber(video.concurrentViewers, video.concurrentViewers)} assistindo agora`
      : "Transmissão acontecendo agora";
  }
  if (video.kind === "upcoming" && video.scheduledStartTime) {
    return `Agendada para ${new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(video.scheduledStartTime))}`;
  }
  return `${video.duration} · Transmissão encerrada`;
}

export default function Home() {
  const [feed, setFeed] = useState<ChannelFeed | null>(null);

  useEffect(() => {
    let active = true;

    async function refreshChannel() {
      try {
        const response = await fetch("/api/youtube", { cache: "no-store" });
        if (!response.ok) return;
        const nextFeed = (await response.json()) as ChannelFeed;
        if (active && nextFeed.configured && nextFeed.videos.length) {
          setFeed(nextFeed);
        }
      } catch {
        // The static fallback keeps the page usable during temporary API errors.
      }
    }

    void refreshChannel();
    const interval = window.setInterval(refreshChannel, REFRESH_INTERVAL);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const videos = feed?.videos.length ? feed.videos : fallbackVideos;
  const activeLive = feed?.live ?? videos.find((video) => video.kind === "live") ?? null;
  const latestVideo = videos.find((video) => video.kind !== "upcoming") ?? videos[0];
  const liveFeature =
    activeLive ??
    videos.find((video) => video.kind === "upcoming") ??
    videos.find((video) => video.kind === "live-archive") ??
    fallbackVideos.find((video) => video.kind === "live-archive")!;

  const releaseDays = useMemo(() => {
    const grouped = new Map<string, ChannelVideo[]>();
    for (const video of videos) {
      const key = dateKey(video.publishedAt);
      const current = grouped.get(key) ?? [];
      current.push(video);
      grouped.set(key, current);
    }

    const today = dateKey(new Date().toISOString());
    return Array.from(grouped.entries())
      .slice(0, 5)
      .map(([key, items], index) => ({
        key,
        date: dayLabel(items[0].publishedAt),
        kicker:
          key === today
            ? "HOJE"
            : items.length > 1
              ? "DOSE DUPLA"
              : index === 0
                ? "MAIS RECENTE"
                : "NOTÍCIAS",
        active: index === 0,
        items,
      }));
  }, [videos]);

  const rangeLabel = useMemo(() => {
    if (!releaseDays.length) return "ÚLTIMOS DIAS";
    const first = releaseDays.at(-1)?.items[0].publishedAt ?? videos[0].publishedAt;
    const last = releaseDays[0].items[0].publishedAt;
    const firstDay = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
    }).format(new Date(first));
    const lastParts = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "short",
    }).formatToParts(new Date(last));
    const lastDay = lastParts.find((part) => part.type === "day")?.value ?? "";
    const month = lastParts.find((part) => part.type === "month")?.value ?? "";
    return `${firstDay}—${lastDay} // ${month.replace(".", "").toUpperCase()}`;
  }, [releaseDays, videos]);

  const featuredVideos = videos
    .filter((video) => video.kind !== "upcoming" && video.kind !== "live")
    .slice(0, 3);

  return (
    <main className={`site-shell${activeLive ? " is-live-mode" : ""}`}>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="page-grid" aria-hidden="true" />

      <header className="topbar">
        <a
          className="brand"
          href={CHANNEL_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Abrir o canal StationLIVE no YouTube"
        >
          <img src="/station-live-logo.png" alt="" className="brand-mark" />
          <span className="brand-copy">
            <strong>STATION LIVE</strong>
            <small>GAMING NEWS</small>
          </span>
        </a>

        <nav className="channel-nav" aria-label="Conteúdo do canal">
          <a href={`${CHANNEL_URL}/videos`} target="_blank" rel="noreferrer">
            VÍDEOS
          </a>
          <a href={`${CHANNEL_URL}/streams`} target="_blank" rel="noreferrer">
            LIVES
          </a>
          <span className={`signal-copy${activeLive ? " is-live" : ""}`}>
            <i aria-hidden="true" /> {activeLive ? "AO VIVO AGORA" : "1–2 VÍDEOS POR DIA"}
          </span>
        </nav>
      </header>

      {activeLive && (
        <section className="live-takeover" aria-labelledby="live-now-title">
          <div className="live-stage">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeLive.id}?autoplay=1&mute=1&rel=0`}
              title={activeLive.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="live-takeover-copy">
            <p className="live-status-pill">
              <i aria-hidden="true" /> AO VIVO AGORA
            </p>
            <p className="live-overline">STATION LIVE // TRANSMISSÃO EM ANDAMENTO</p>
            <h2 id="live-now-title">{activeLive.title}</h2>
            <p className="live-audience">{liveMeta(activeLive)}</p>
            <a
              className="button button-live"
              href={activeLive.href}
              target="_blank"
              rel="noreferrer"
            >
              ASSISTIR NO YOUTUBE <span aria-hidden="true">↗</span>
            </a>
            <small>Esta área desaparece automaticamente quando a transmissão termina.</small>
          </div>
        </section>
      )}

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="ghost-logo" aria-hidden="true">
            <img src="/station-live-logo.png" alt="" />
          </div>

          <p className="eyebrow">
            <span aria-hidden="true" /> STATION LIVE // CONTEÚDO DIÁRIO
          </p>
          <h1 id="hero-title">
            O JOGO
            <br />
            MUDA
            <br />
            <span>TODO DIA.</span>
          </h1>
          <p className="hero-description">
            Um ou dois vídeos por dia com as notícias mais interessantes de
            games e tecnologia. E, quando a jogatina pede, uma live com a
            galera.
          </p>

          <div className="hero-actions">
            <a
              className="button button-primary"
              href={latestVideo.href}
              target="_blank"
              rel="noreferrer"
            >
              VER ÚLTIMO VÍDEO <span aria-hidden="true">↗</span>
            </a>
            <a
              className="button button-ghost"
              href={CHANNEL_URL}
              target="_blank"
              rel="noreferrer"
            >
              ABRIR O CANAL
            </a>
          </div>

          <dl className="channel-stats" aria-label="Números do canal">
            <div>
              <dt>INSCRITOS</dt>
              <dd>{formatCompactNumber(feed?.channel.subscriberCount, "3,58 mil")}</dd>
            </div>
            <div>
              <dt>CATÁLOGO</dt>
              <dd>{formatCompactNumber(feed?.channel.videoCount, "407")} vídeos</dd>
            </div>
            <div>
              <dt>ATUALIZAÇÃO</dt>
              <dd>{feed ? "Automática" : "Todo dia"}</dd>
            </div>
          </dl>
        </div>

        <div className="release-panel">
          <div className="panel-heading">
            <div>
              <p>{rangeLabel}</p>
              <h2>ÚLTIMOS CHECKPOINTS</h2>
            </div>
            <span className="panel-badge">
              <i aria-hidden="true" /> VÍDEOS + LIVE
            </span>
          </div>

          <div className="timeline" aria-label="Conteúdos publicados por dia">
            {releaseDays.map((day) => (
              <article
                className={`day-row${day.active ? " is-active" : ""}`}
                key={day.key}
              >
                <span className="timeline-node" aria-hidden="true" />
                <div className="day-date">
                  <strong>{day.date}</strong>
                  <span>{day.kicker}</span>
                </div>
                <div className="day-content">
                  {day.items.map((item) => (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      key={item.id}
                    >
                      <span className="content-type">
                        {item.kind === "video" ? "VÍDEO" : "LIVE"}
                      </span>
                      <strong>{item.title}</strong>
                      <small>{item.kind === "live" ? "NO AR" : item.duration}</small>
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <aside className="live-strip" aria-label="Live do canal">
            <span className="live-icon" aria-hidden="true">
              <i />
            </span>
            <div>
              <p>
                {liveFeature.kind === "live"
                  ? "AO VIVO AGORA"
                  : liveFeature.kind === "upcoming"
                    ? "PRÓXIMA LIVE"
                    : "LIVE RECENTE"}
              </p>
              <a href={liveFeature.href} target="_blank" rel="noreferrer">
                {liveFeature.title}
              </a>
              <small>{liveMeta(liveFeature)}</small>
            </div>
            <a
              className="live-arrow"
              href={`${CHANNEL_URL}/streams`}
              target="_blank"
              rel="noreferrer"
              aria-label="Ver todas as lives"
            >
              ↗
            </a>
          </aside>
        </div>
      </section>

      <section className="recent" aria-labelledby="recent-title">
        <div className="section-heading">
          <div>
            <p>NO AR AGORA</p>
            <h2 id="recent-title">VÍDEOS RECENTES</h2>
          </div>
          <a href={`${CHANNEL_URL}/videos`} target="_blank" rel="noreferrer">
            VER TODOS <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="video-grid">
          {featuredVideos.map((video, index) => (
            <a
              className={`video-card${index === 0 ? " featured" : ""}`}
              href={video.href}
              target="_blank"
              rel="noreferrer"
              key={video.id}
            >
              <div className="thumbnail-wrap">
                <img src={video.thumbnail} alt="" loading="lazy" />
                <span className="play-cue" aria-hidden="true">
                  ▶
                </span>
              </div>
              <div className="video-card-copy">
                <p>{index === 0 ? "ÚLTIMO VÍDEO" : video.kind === "live-archive" ? "LIVE COMPLETA" : "NOTÍCIAS"}</p>
                <h3>{video.title}</h3>
                <span>{video.duration} · {publishedLabel(video.publishedAt)}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer>
        <div className="footer-brand">
          <img src="/station-live-logo.png" alt="" />
          <span>STATION LIVE</span>
        </div>
        <p>Notícias, tecnologia e jogatina — sem enrolação.</p>
        <a href={CHANNEL_URL} target="_blank" rel="noreferrer">
          YOUTUBE ↗
        </a>
      </footer>
    </main>
  );
}
