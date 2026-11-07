interface Props { error: string; leaving: boolean; onRetry: () => void; }

export default function OpeningLoader({ error, leaving, onRetry }: Props) {
  return <main className={`opening-loader${leaving ? ' opening-loader--leaving' : ''}`} aria-label="BEST5 loading">
    <div className="opening-loader__ambient" aria-hidden="true"/>
    <div className="opening-loader__content">
      <div className="opening-loader__mark">
        <img src="/assets/images/logo/smt_logo.png" alt="BEST5 Football Exhibition" fetchPriority="high"/>
      </div>
      <div className="opening-loader__divider" aria-hidden="true"><span/></div>
      <p className="opening-loader__label">FOOTBALL. CULTURE. COMMUNITY.</p>
      <div className="opening-loader__feedback">
        <p className="opening-loader__status" role={error ? 'alert' : 'status'}>{error || 'Loading your matchday experience'}</p>
        {!error && <span className="opening-loader__dots" aria-hidden="true"><i/><i/><i/></span>}
        {error && <button className="btn-primary mt-5" onClick={onRetry}>Try again</button>}
      </div>
    </div>
    <span className="opening-loader__edition" aria-hidden="true">BEST5 / THE FOOTBALL EXHIBITION</span>
  </main>;
}
