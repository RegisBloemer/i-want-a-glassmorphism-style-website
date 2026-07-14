const CHANNEL_URL = "https://www.youtube.com/@Station_LIVE";

const releaseDays = [
  {
    date: "TER 14",
    kicker: "HOJE",
    active: true,
    items: [
      {
        title:
          "Novo Remake de Resident Evil 1 a Caminho e Jogador Vence a Microsoft na Justiça!",
        duration: "13:01",
        href: "https://www.youtube.com/watch?v=TiKh1ok5sUQ",
      },
    ],
  },
  {
    date: "SEG 13",
    kicker: "NOTÍCIAS",
    items: [
      {
        title:
          "Xbox prepara conversão de mídia física e sucesso de AC Black Flag Resynced",
        duration: "09:26",
        href: "https://www.youtube.com/watch?v=Y6zobNkPBZs",
      },
    ],
  },
  {
    date: "DOM 12",
    kicker: "GIRO DO DIA",
    items: [
      {
        title:
          "O fim do Far Cry clássico e o alerta de escassez de memória RAM para 2027",
        duration: "11:27",
        href: "https://www.youtube.com/watch?v=R0pyT9jzLZU",
      },
    ],
  },
  {
    date: "SÁB 11",
    kicker: "DOSE DUPLA",
    items: [
      {
        title: "Qual console comprar para jogar GTA 6?",
        duration: "09:42",
        href: "https://www.youtube.com/watch?v=qZs1j7TdgQc",
      },
      {
        title: "God of War Laufey em mídia física + Tomb Raider VR",
        duration: "10:06",
        href: "https://www.youtube.com/watch?v=r4q1YXywYiU",
      },
    ],
  },
  {
    date: "SEX 10",
    kicker: "CHECKPOINT",
    items: [
      {
        title:
          "Assassin's Creed Black Flag Resynced e um mod incrível em Red Dead 2",
        duration: "12:24",
        href: "https://www.youtube.com/watch?v=J02Fnn_aIUo",
      },
    ],
  },
];

const featuredVideos = [
  {
    eyebrow: "ÚLTIMO VÍDEO",
    title:
      "Novo Remake de Resident Evil 1 a Caminho e Jogador Vence a Microsoft na Justiça!",
    meta: "13:01 · Publicado hoje",
    href: "https://www.youtube.com/watch?v=TiKh1ok5sUQ",
    thumbnail: "https://i.ytimg.com/vi/TiKh1ok5sUQ/hqdefault.jpg",
  },
  {
    eyebrow: "XBOX + MÍDIA FÍSICA",
    title:
      "Xbox prepara conversão de mídia física e sucesso de AC Black Flag Resynced",
    meta: "09:26 · Ontem",
    href: "https://www.youtube.com/watch?v=Y6zobNkPBZs",
    thumbnail: "https://i.ytimg.com/vi/Y6zobNkPBZs/hqdefault.jpg",
  },
  {
    eyebrow: "TECNOLOGIA + GAMES",
    title:
      "O fim do Far Cry clássico e o alerta de escassez de memória RAM para 2027",
    meta: "11:27 · Há 2 dias",
    href: "https://www.youtube.com/watch?v=R0pyT9jzLZU",
    thumbnail: "https://i.ytimg.com/vi/R0pyT9jzLZU/hqdefault.jpg",
  },
];

export default function Home() {
  return (
    <main className="site-shell">
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
          <span className="signal-copy">
            <i aria-hidden="true" /> 1–2 VÍDEOS POR DIA
          </span>
        </nav>
      </header>

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
              href="https://www.youtube.com/watch?v=TiKh1ok5sUQ"
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
              <dd>3,58 mil</dd>
            </div>
            <div>
              <dt>CATÁLOGO</dt>
              <dd>407 vídeos</dd>
            </div>
            <div>
              <dt>FREQUÊNCIA</dt>
              <dd>Todo dia</dd>
            </div>
          </dl>
        </div>

        <div className="release-panel">
          <div className="panel-heading">
            <div>
              <p>10—14 // JUL</p>
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
                key={day.date}
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
                      key={item.href}
                    >
                      <span className="content-type">VÍDEO</span>
                      <strong>{item.title}</strong>
                      <small>{item.duration}</small>
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <aside className="live-strip" aria-label="Live recente">
            <span className="live-icon" aria-hidden="true">
              <i />
            </span>
            <div>
              <p>LIVE RECENTE · QUANDO ROLAR, APARECE AQUI</p>
              <a
                href="https://www.youtube.com/watch?v=YoETyE8Sw7s"
                target="_blank"
                rel="noreferrer"
              >
                God of War 2018 pela primeira vez no PS5 Pro #8
              </a>
              <small>1:33:23 · Transmitido há 3 dias</small>
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
              key={video.href}
            >
              <div className="thumbnail-wrap">
                <img src={video.thumbnail} alt="" loading="lazy" />
                <span className="play-cue" aria-hidden="true">
                  ▶
                </span>
              </div>
              <div className="video-card-copy">
                <p>{video.eyebrow}</p>
                <h3>{video.title}</h3>
                <span>{video.meta}</span>
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
