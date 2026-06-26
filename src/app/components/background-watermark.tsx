interface BackgroundWatermarkProps {
  size?: string;
}

export function BackgroundWatermark({ size = "w-[600px]" }: BackgroundWatermarkProps) {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center"
      aria-hidden="true"
    >
      <img
        src="/logo.png"
        alt=""
        className={`${size} max-w-[80vw] opacity-[0.04] hidden dark:block`}
      />
      <img
        src="/logo-light.png"
        alt=""
        className={`${size} max-w-[80vw] opacity-[0.06] block dark:hidden`}
      />
    </div>
  );
}
