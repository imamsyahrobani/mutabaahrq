import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: 'emblem' | 'full' | 'compact';
}

/**
 * Logo Resmi Lembaga Rumah Qur'an Kuningan
 * Menggunakan aset logo resmi: /assets/aistudio/logo_RQ_ff33ff6c.jfif
 * Menampilkan kaligrafi monogram RQ khas Rumah Qur'an (Inspiring For Anything)
 */
export const RumahQuranLogo: React.FC<LogoProps> = ({
  className = '',
  size = 48,
  showText = false,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Official Logo Container */}
      <div
        className="rounded-xl overflow-hidden bg-white shadow-xs border border-slate-200/90 shrink-0 flex items-center justify-center p-0.5 transition-transform"
        style={{ width: size, height: size }}
      >
        {!imageError ? (
          <img
            src="/assets/aistudio/logo_RQ_ff33ff6c.jfif"
            alt="Logo Resmi Rumah Qur'an Kuningan"
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          /* Elegant Fallback Monogram if file unavailable */
          <div className="w-full h-full bg-gradient-to-br from-red-600 to-amber-500 text-white font-extrabold flex items-center justify-center text-xs">
            RQ
          </div>
        )}
      </div>

      {/* Typography Label */}
      {showText && (
        <div className="flex flex-col text-left">
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 leading-tight">
            RUMAH QUR'AN <span className="text-emerald-700">KUNINGAN</span>
          </span>
          <span className="text-[10px] text-emerald-800 font-semibold tracking-wider uppercase">
            Lembaga Tahfidz & Tahsin Al-Qur'an
          </span>
        </div>
      )}
    </div>
  );
};
