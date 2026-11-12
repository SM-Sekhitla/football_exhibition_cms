import { useEffect, useState } from 'react';

/** Keep the previous image visible until the requested image is fully decoded. */
export default function HeroImages({ images, active }: { images: string[]; active: number }) {
  const requested = images[active] || '';
  const [layers, setLayers] = useState({ current: '', previous: '' });

  useEffect(() => {
    let cancelled = false;
    if (!requested) return;
    const image = new Image();
    image.fetchPriority = 'high';
    image.src = requested;
    void image.decode().then(() => {
      if (!cancelled) setLayers(previous => previous.current === requested ? previous : { current: requested, previous: previous.current });
    }).catch(() => { /* Keep the last successful image when a slide fails to load. */ });
    return () => { cancelled = true; };
  }, [requested]);

  const currentImage = layers.current;

  // Only fetch the next slide once the visible image is ready.
  useEffect(() => {
    if (currentImage !== requested || images.length < 2) return;
    const image = new Image();
    const timer = window.setTimeout(() => {
      image.fetchPriority = 'low';
      image.src = images[(active + 1) % images.length];
    }, 1200);
    return () => { window.clearTimeout(timer); image.src = ''; };
  }, [images, active, requested, currentImage]);

  return <div className="hero-images" aria-hidden="true">
    {layers.previous && <img className="hero-images__previous" src={layers.previous} alt=""/>}
    {layers.current && <img key={layers.current} className="hero-images__current" src={layers.current} alt=""/>}
  </div>;
}
