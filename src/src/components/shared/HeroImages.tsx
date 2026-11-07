import { useEffect, useState } from 'react';

/** Keep the previous image visible until the requested image is fully decoded. */
export default function HeroImages({ images, active }: { images: string[]; active: number }) {
  const requested = images[active] || '';
  const [layers, setLayers] = useState({ current: '', previous: '' });

  useEffect(() => {
    let cancelled = false;
    if (!requested) return;
    const image = new Image();
    image.src = requested;
    void image.decode().then(() => {
      if (!cancelled) setLayers(previous => previous.current === requested ? previous : { current: requested, previous: previous.current });
    }).catch(() => { /* Keep the last successful image when a slide fails to load. */ });
    return () => { cancelled = true; };
  }, [requested]);

  // Preload the other slides without making them visible or restarting their animation.
  useEffect(() => {
    const preloads = images.filter(Boolean).map(src => { const image = new Image(); image.src = src; return image; });
    return () => { preloads.forEach(image => { image.src = ''; }); };
  }, [images]);

  return <div className="hero-images" aria-hidden="true">
    {layers.previous && <img className="hero-images__previous" src={layers.previous} alt=""/>}
    {layers.current && <img key={layers.current} className="hero-images__current" src={layers.current} alt=""/>}
  </div>;
}
