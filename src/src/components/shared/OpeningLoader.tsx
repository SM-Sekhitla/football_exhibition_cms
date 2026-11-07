interface Props { error: string; leaving: boolean; onRetry: () => void; }

const parts = '/assets/images/animation/mascot-parts.png';
function MascotPart({ viewBox, className }: { viewBox: string; className: string }) {
  return <svg className={className} viewBox={viewBox} overflow="hidden"><image href={parts} width="1263" height="1246"/></svg>;
}

export default function OpeningLoader({ error, leaving, onRetry }: Props) {
  return <main className={`opening-loader${leaving ? ' opening-loader--leaving' : ''}`} aria-label="BEST5 loading">
    <div className="opening-loader__glow" aria-hidden="true"/>
    <div className="opening-loader__content">
      <p className="opening-loader__eyebrow">THE BEAUTIFUL GAME. OUR STAGE.</p>
      <div className="opening-loader__pitch" aria-hidden="true">
        <div className="opening-loader__ring"/>
        <img className="opening-loader__badge" src="/assets/images/logo/smt_logo.png" alt="" fetchPriority="high"/>
        <div className="opening-loader__mascot">
          <MascotPart className="mascot-leg mascot-leg--planted" viewBox="185 790 305 320"/>
          <MascotPart className="mascot-leg mascot-leg--kicking" viewBox="810 230 300 290"/>
          <MascotPart className="mascot-body" viewBox="20 50 640 525"/>
        </div>
        <span className="opening-loader__trail"/>
        <div className="opening-loader__ball-path"><MascotPart className="opening-loader__ball" viewBox="785 770 320 320"/></div>
        <span className="opening-loader__ground"/>
      </div>
      <h1 className="display opening-loader__title">GAME <span>ON.</span></h1>
      <p className="opening-loader__status" role={error ? 'alert' : 'status'}>{error || 'Warming up the pitch…'}</p>
      {!error && <div className="opening-loader__progress" aria-hidden="true"><span/></div>}
      {error && <button className="btn-primary mt-5" onClick={onRetry}>Try again</button>}
    </div>
  </main>;
}
