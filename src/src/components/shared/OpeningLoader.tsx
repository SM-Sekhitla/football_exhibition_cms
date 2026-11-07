interface Props { error: string; leaving: boolean; onRetry: () => void; }

export default function OpeningLoader({ error, leaving, onRetry }: Props) {
  return <main className={`opening-loader${leaving ? ' opening-loader--leaving' : ''}`} aria-label="BEST5 loading">
    <div className="opening-loader__glow" aria-hidden="true"/>
    <div className="opening-loader__content">
      <p className="opening-loader__eyebrow">THE BEAUTIFUL GAME. OUR STAGE.</p>
      <div className="opening-loader__pitch" aria-hidden="true">
        <div className="opening-loader__ring"/>
        <img className="opening-loader__logo" src="/assets/images/logo/smt_logo.png" alt="" fetchPriority="high"/>
        <span className="opening-loader__trail"/>
        <div className="opening-loader__ball-path"><svg className="opening-loader__ball" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#f5f7f4" stroke="#07100c" strokeWidth="3"/><path d="m32 19 12 9-5 14H25l-5-14ZM10 12l12 2-5 12-14 2M54 12l-12 2 5 12 14 2M7 45l14-3 6 16-12-3M57 45l-14-3-6 16 12-3" fill="#07100c"/><path d="m32 3 0 16M4 30l16-2m40 2-16-2M13 51l12-9m26 9-12-9" stroke="#07100c" strokeWidth="2"/></svg></div>
        <span className="opening-loader__ground"/>
      </div>
      <h1 className="display opening-loader__title">GAME <span>ON.</span></h1>
      <p className="opening-loader__status" role={error ? 'alert' : 'status'}>{error || 'Warming up the pitch…'}</p>
      {!error && <div className="opening-loader__progress" aria-hidden="true"><span/></div>}
      {error && <button className="btn-primary mt-5" onClick={onRetry}>Try again</button>}
    </div>
  </main>;
}
