import { useId } from 'react';
import type { UserProfile } from '@/types';
import {
  ACCENTS,
  HAIR_COLORS,
  SKIN_TONES,
  bmiInfo,
  bmiOf,
  clamp,
} from '@/lib/avatar';

type Props = {
  profile: UserProfile;
  size?: number;
  variant?: 'full' | 'bust';
  className?: string;
};

/**
 * Параметрична ілюстрація «AI-людини»: статура, зріст і пропорції
 * рахуються з профілю користувача (стать, зріст, вага).
 */
export default function UserAvatar({ profile, size = 240, variant = 'full', className = '' }: Props) {
  const uid = useId().replace(/:/g, '');
  const skinTone = SKIN_TONES[clamp(profile.skinTone, 0, SKIN_TONES.length - 1)];
  const hairTone = HAIR_COLORS[clamp(profile.hairColor, 0, HAIR_COLORS.length - 1)];
  const accent = ACCENTS[profile.accent] ?? ACCENTS.blush;

  const bmi = bmiOf(profile) || 22;
  const widthScale = clamp(0.82 + (bmi - 21) * 0.05, 0.7, 1.5);
  const heightScale = clamp(1 + (profile.heightCm - 170) * 0.0026, 0.9, 1.09);
  const info = bmiInfo(bmi);

  const gender = profile.gender;
  const shoulderW = (gender === 'male' ? 70 : gender === 'female' ? 58 : 63) * widthScale;
  const hipW = (gender === 'female' ? 58 : gender === 'male' ? 49 : 53) * widthScale;
  const waistW = (gender === 'female' ? 41 : gender === 'male' ? 45 : 43) * widthScale;
  const legW = (gender === 'female' ? 17 : 19) * clamp(widthScale, 0.85, 1.35);
  const armW = 12 * clamp(widthScale, 0.9, 1.3);

  const headCY = 76;
  const headRX = gender === 'male' ? 21 : 20;
  const headRY = 23;
  const shoulderY = 116;
  const waistY = 148;
  const hipY = 170;
  const legTop = 174;
  const footY = 236;

  const hxL = 100 - shoulderW / 2;
  const hxR = 100 + shoulderW / 2;
  const wxL = 100 - waistW / 2;
  const wxR = 100 + waistW / 2;
  const ixL = 100 - hipW / 2;
  const ixR = 100 + hipW / 2;

  const torso = `M ${hxL} ${shoulderY + 8}
    C ${hxL - 3} ${waistY - 12}, ${wxL - 2} ${waistY - 8}, ${wxL} ${waistY + 4}
    C ${wxL - 2} ${hipY - 12}, ${ixL} ${hipY - 10}, ${ixL + 3} ${hipY + 2}
    L ${ixR - 3} ${hipY + 2}
    C ${ixR} ${hipY - 10}, ${wxR + 2} ${hipY - 12}, ${wxR} ${waistY + 4}
    C ${wxR + 2} ${waistY - 8}, ${hxR + 3} ${waistY - 12}, ${hxR} ${shoulderY + 8}
    Z`;

  const pants = '#6B4E44';
  const shoes = '#3D2A25';

  const armLeft = `M ${hxL + 7} ${shoulderY + 8}
    C ${hxL - 7} ${shoulderY + 26}, ${hxL - 10} ${waistY + 12}, ${hxL - 4} ${hipY + 8}`;
  const armRight = `M ${hxR - 7} ${shoulderY + 8}
    C ${hxR + 7} ${shoulderY + 26}, ${hxR + 10} ${waistY + 12}, ${hxR + 4} ${hipY + 8}`;
  const sleeveLeft = `M ${hxL + 7} ${shoulderY + 8}
    C ${hxL - 6} ${shoulderY + 22}, ${hxL - 8} ${shoulderY + 34}, ${hxL - 8} ${shoulderY + 44}`;
  const sleeveRight = `M ${hxR - 7} ${shoulderY + 8}
    C ${hxR + 6} ${shoulderY + 22}, ${hxR + 8} ${shoulderY + 34}, ${hxR + 8} ${shoulderY + 44}`;

  const hasLongHair = gender === 'female';
  const hasBob = gender === 'neutral';

  return (
    <svg
      role="img"
      aria-label={`Ілюстрація користувача ${profile.name}: зріст ${profile.heightCm} см, вага ${profile.weightKg} кг`}
      viewBox={variant === 'bust' ? '46 38 108 108' : '0 0 200 260'}
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <linearGradient id={`outfit-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent.main} />
          <stop offset="100%" stopColor={accent.deep} />
        </linearGradient>
        <linearGradient id={`skin-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skinTone.color} />
          <stop offset="100%" stopColor={skinTone.shade} />
        </linearGradient>
        <radialGradient id={`halo-${uid}`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={accent.soft} stopOpacity="0.95" />
          <stop offset="70%" stopColor={accent.soft} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent.soft} stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="132" rx="86" ry="104" fill={`url(#halo-${uid})`} />

      {/* ground shadow */}
      <ellipse cx="100" cy="249" rx={40 * widthScale} ry="6" fill="#513B35" opacity="0.12" />

      <g transform={`translate(100 250) scale(1 ${heightScale}) translate(-100 -250)`}>
        {/* hair behind the head */}
        {hasLongHair && (
          <>
            <ellipse cx="100" cy="80" rx="27" ry="30" fill={hairTone.color} />
            <rect x="72" y="78" width="12" height="54" rx="6" fill={hairTone.color} />
            <rect x="116" y="78" width="12" height="54" rx="6" fill={hairTone.color} />
            <rect x="72" y="118" width="12" height="14" rx="6" fill={hairTone.shade} />
            <rect x="116" y="118" width="12" height="14" rx="6" fill={hairTone.shade} />
          </>
        )}
        {hasBob && (
          <>
            <ellipse cx="100" cy="76" rx="26" ry="27" fill={hairTone.color} />
            <rect x="73" y="74" width="12" height="30" rx="6" fill={hairTone.color} />
            <rect x="115" y="74" width="12" height="30" rx="6" fill={hairTone.color} />
          </>
        )}

        {/* legs */}
        <rect x={100 - legW - 3} y={legTop} width={legW} height={footY - legTop} rx={legW / 2} fill={pants} />
        <rect x={100 + 3} y={legTop} width={legW} height={footY - legTop} rx={legW / 2} fill={pants} />

        {/* shoes */}
        <rect x={100 - legW - 7} y={footY - 4} width={legW + 8} height="13" rx="6.5" fill={shoes} />
        <rect x={100 + 3} y={footY - 4} width={legW + 8} height="13" rx="6.5" fill={shoes} />

        {/* arms */}
        <path d={armLeft} stroke={`url(#skin-${uid})`} strokeWidth={armW} strokeLinecap="round" fill="none" />
        <path d={armRight} stroke={`url(#skin-${uid})`} strokeWidth={armW} strokeLinecap="round" fill="none" />
        <path d={sleeveLeft} stroke={`url(#outfit-${uid})`} strokeWidth={armW + 3} strokeLinecap="round" fill="none" />
        <path d={sleeveRight} stroke={`url(#outfit-${uid})`} strokeWidth={armW + 3} strokeLinecap="round" fill="none" />
        <circle cx={hxL - 4} cy={hipY + 8} r={armW / 2 - 1} fill={skinTone.color} />
        <circle cx={hxR + 4} cy={hipY + 8} r={armW / 2 - 1} fill={skinTone.color} />

        {/* hips + torso */}
        <rect x={ixL} y={hipY - 8} width={hipW} height={26} rx={12} fill={pants} />
        <path d={torso} fill={`url(#outfit-${uid})`} />
        <path
          d={`M ${100 - waistW / 2 + 2} ${waistY + 6} L ${100 + waistW / 2 - 2} ${waistY + 6}`}
          stroke={accent.soft}
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* neck + head */}
        <rect x="93.5" y="92" width="13" height="20" rx="6.5" fill={skinTone.shade} />
        <circle cx={100 - headRX - 1} cy={headCY + 3} r="4.5" fill={skinTone.color} />
        <circle cx={100 + headRX + 1} cy={headCY + 3} r="4.5" fill={skinTone.color} />
        <ellipse cx="100" cy={headCY} rx={headRX} ry={headRY} fill={`url(#skin-${uid})`} />

        {/* hair on top */}
        {!hasLongHair && !hasBob && (
          <path
            d="M 79 76 Q 79 49 100 49 Q 121 49 121 76 Q 113 60 100 62 Q 87 60 79 76 Z"
            fill={hairTone.color}
          />
        )}
        {(hasLongHair || hasBob) && (
          <path
            d="M 79 78 Q 78 49 100 49 Q 122 49 121 78 Q 114 61 102 64 Q 96 72 88 65 Q 82 68 79 78 Z"
            fill={hairTone.color}
          />
        )}
        <path
          d="M 92 56 Q 100 51 108 56"
          stroke={hairTone.shade}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* face */}
        <ellipse cx="92.5" cy="78" rx="2.6" ry="3.3" fill="#3D2A25" />
        <ellipse cx="107.5" cy="78" rx="2.6" ry="3.3" fill="#3D2A25" />
        <circle cx="86.5" cy="86" r="4.6" fill={accent.soft} opacity="0.9" />
        <circle cx="113.5" cy="86" r="4.6" fill={accent.soft} opacity="0.9" />
        <path d="M 94 87 Q 100 92.5 106 87" stroke="#513B35" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </g>

      {/* soft light on top of the figure */}
      <ellipse cx="84" cy="44" rx="22" ry="10" fill="#FFFFFF" opacity="0.18" />
      <circle cx="100" cy="132" r="99" fill="none" stroke={info.color} strokeOpacity="0.12" />
    </svg>
  );
}
