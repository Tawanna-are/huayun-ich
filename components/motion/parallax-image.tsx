type ParallaxImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export function ParallaxImage({ src, alt, className }: ParallaxImageProps) {
  return (
    <div className={className}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full scale-105 object-cover transition duration-700 hover:scale-110"
      />
    </div>
  );
}
