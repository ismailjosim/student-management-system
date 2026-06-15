import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
  imageClassName?: string;
  textClassName?: string;
};

export function BrandLogo({
  className,
  compact = false,
  imageClassName,
  textClassName,
}: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <Image
        src="/android-chrome-192x192.png"
        alt=""
        width={40}
        height={40}
        priority
        className={imageClassName ?? 'size-10 object-contain'}
      />
      {!compact && <span className={textClassName}>{APP_NAME}</span>}
    </span>
  );
}
