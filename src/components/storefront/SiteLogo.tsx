import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const LOGO_WIDTH = 1536;
const LOGO_HEIGHT = 1024;
const FOOTER_LOGO_WIDTH = 1774;
const FOOTER_LOGO_HEIGHT = 887;

type SiteLogoProps = {
  variant?: "header" | "footer";
  className?: string;
  priority?: boolean;
};

export function SiteLogo({
  variant = "header",
  className,
  priority = false,
}: SiteLogoProps) {
  if (variant === "header") {
    return (
      <div
        className={cn(
          "h-10 w-[130px] overflow-hidden sm:w-[170px] md:w-[200px]",
          className,
        )}
      >
        <Image
          src="/logo.png?v=3"
          alt={SITE_NAME}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          priority={priority}
          unoptimized
          className="h-full w-full object-cover object-center"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-[4.5rem] w-[min(100%,480px)] sm:h-20 sm:w-[min(100%,620px)] md:h-[5.5rem] md:w-[min(100%,780px)]",
        className,
      )}
    >
      <Image
        src="/logo-footer.png?v=2"
        alt={SITE_NAME}
        width={FOOTER_LOGO_WIDTH}
        height={FOOTER_LOGO_HEIGHT}
        priority={priority}
        unoptimized
        className="h-full w-full object-contain object-left"
      />
    </div>
  );
}
