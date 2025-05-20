import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface MockupProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function Mockup({ src, alt = "Device mockup", width = 1203, height = 753, className }: MockupProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const aspectRatio = height / width;

  useEffect(() => {
    // Pre-load the image
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);

    return () => {
      img.onload = null;
    };
  }, [src]);

  return (
    <div
      className={cn(
        "flex flex-col transition-opacity duration-500 mockup-float",
        isLoaded ? "opacity-100" : "opacity-40",
        className
      )}
    >
      {/* Device mockup - adaptive for all screen sizes */}
      <div className="mx-auto relative w-full">
        {/* Complete device mockup */}
        <div className={cn(
          "relative z-10 rounded-[1.25rem] sm:rounded-[1.75rem] md:rounded-[2.5rem] overflow-hidden",
          "shadow-[0_10px_30px_rgba(0,0,0,0.3)] sm:shadow-[0_15px_45px_rgba(0,0,0,0.35)] md:shadow-[0_20px_60px_rgba(0,0,0,0.4)]",
          "w-full mx-auto max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%]",
          "bg-zinc-800"
        )}>
          {/* Device frame details */}
          <div className="absolute inset-0 border-[8px] sm:border-[10px] md:border-[14px] lg:border-[16px] border-zinc-800 rounded-[1.25rem] sm:rounded-[1.75rem] md:rounded-[2.5rem] z-20 pointer-events-none">
            {/* Top bezel with camera/speaker */}
            <div className="absolute top-0 left-0 right-0 h-4 sm:h-5 md:h-8 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-zinc-600"></div>
                <div className="w-8 sm:w-12 md:w-16 lg:w-20 h-0.5 sm:h-1 bg-zinc-700 rounded-full"></div>
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-zinc-600"></div>
              </div>
            </div>

            {/* Side buttons */}
            <div className="absolute left-[-8px] sm:left-[-10px] md:left-[-14px] lg:left-[-16px] top-16 sm:top-20 md:top-24 w-[2px] sm:w-[3px] md:w-[4px] h-6 sm:h-8 md:h-10 bg-zinc-700 rounded-l-md"></div>
            <div className="absolute left-[-8px] sm:left-[-10px] md:left-[-14px] lg:left-[-16px] top-28 sm:top-32 md:top-36 w-[2px] sm:w-[3px] md:w-[4px] h-6 sm:h-8 md:h-10 bg-zinc-700 rounded-l-md"></div>
            <div className="absolute right-[-8px] sm:right-[-10px] md:right-[-14px] lg:right-[-16px] top-20 sm:top-24 md:top-28 w-[2px] sm:w-[3px] md:w-[4px] h-8 sm:h-10 md:h-14 bg-zinc-700 rounded-r-md"></div>
          </div>

          {/* Screen content with placeholder */}
          <div className="relative">
            <div className="pt-[4px] pb-[8px] px-[4px] sm:pt-[6px] sm:pb-[10px] sm:px-[6px] md:pt-[8px] md:pb-[12px] md:px-[8px] lg:pt-[10px] lg:pb-[14px] lg:px-[10px]">
              {/* This div reserves space for the image with the correct aspect ratio */}
              <div
                className="w-full rounded-lg sm:rounded-xl md:rounded-2xl bg-zinc-900/50"
                style={{
                  aspectRatio: `${width} / ${height}`,
                  display: isLoaded ? "none" : "block"
                }}
              />

              {/* Actual image shown when loaded */}
              <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={cn(
                  "w-full h-auto rounded-lg sm:rounded-xl md:rounded-2xl",
                  isLoaded ? "block" : "hidden"
                )}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/20 via-zinc-900/5 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 
