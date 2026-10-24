import React from 'react';
import logoPng from '../assets/logo.png';
import logoWhitePng from '../assets/logo-white.png';

/**
 * Modern SmileCraft Brand Tooth Icon with sparkling swoosh
 * Uses the official brand logo graphics with multi-variant and tint support.
 */
export const ToothSmileIcon = ({
  size = 40,
  toothColor = '#0EA5A0',
  swoopColor = '#0EA5A0',
  sparkleColor = '#0EA5A0',
  fillTooth = 'none',
  className = '',
  style = {},
}) => {
  const isWhite =
    toothColor?.toLowerCase() === '#ffffff' ||
    toothColor?.toLowerCase() === 'white' ||
    toothColor === 'rgba(255,255,255,0.85)';

  const isTeal =
    toothColor === '#0EA5A0' ||
    toothColor === '#7DD3C7' ||
    toothColor === '#10ACA3' ||
    !toothColor;

  if (isWhite) {
    return (
      <img
        src={logoWhitePng}
        alt="SmileCraft Logo"
        width={size}
        height={size}
        className={className}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          flexShrink: 0,
          display: 'inline-block',
          verticalAlign: 'middle',
          ...style,
        }}
      />
    );
  }

  if (isTeal) {
    return (
      <img
        src={logoPng}
        alt="SmileCraft Logo"
        width={size}
        height={size}
        className={className}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          flexShrink: 0,
          display: 'inline-block',
          verticalAlign: 'middle',
          ...style,
        }}
      />
    );
  }

  return (
    <span
      className={className}
      role="img"
      aria-label="SmileCraft Logo"
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        flexShrink: 0,
        backgroundColor: toothColor,
        WebkitMaskImage: `url(${logoPng})`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskImage: `url(${logoPng})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        verticalAlign: 'middle',
        ...style,
      }}
    />
  );
};

const Logo = ({
  variant = 'horizontal', // 'horizontal' | 'vertical' | 'monochrome' | 'dark' | 'icon'
  size = 'md',            // 'sm' | 'md' | 'lg'
  showTagline = false,
  className = '',
}) => {
  const iconSizes = { sm: 32, md: 44, lg: 64 };
  const iconSize = iconSizes[size] || 44;

  const textSizes = {
    sm: { brand: '1.15rem', sub: '0.62rem', tag: '0.58rem' },
    md: { brand: '1.45rem', sub: '0.74rem', tag: '0.65rem' },
    lg: { brand: '2.1rem', sub: '0.98rem', tag: '0.82rem' },
  };
  const ts = textSizes[size] || textSizes.md;

  const isDark = variant === 'dark';
  const isMonochrome = variant === 'monochrome';
  const isVertical = variant === 'vertical';

  const toothColor = isMonochrome ? '#0F172A' : isDark ? '#FFFFFF' : '#0EA5A0';
  const swoopColor = isMonochrome ? '#0F172A' : isDark ? '#7DD3C7' : '#0EA5A0';
  const sparkleColor = isMonochrome ? '#0F172A' : isDark ? '#7DD3C7' : '#0EA5A0';
  const brandTextColor = isMonochrome ? '#0F172A' : isDark ? '#FFFFFF' : '#1E293B';
  const craftColor = isMonochrome ? '#0F172A' : isDark ? '#7DD3C7' : '#0EA5A0';
  const subTextColor = isMonochrome ? '#0F172A' : isDark ? 'rgba(255,255,255,0.85)' : '#475569';
  const tagColor = isMonochrome ? '#0F172A' : isDark ? '#7DD3C7' : '#0EA5A0';
  const lineRuleColor = isMonochrome ? '#0F172A' : isDark ? '#7DD3C7' : '#0EA5A0';

  if (variant === 'icon') {
    return (
      <ToothSmileIcon
        size={iconSize}
        toothColor={toothColor}
        swoopColor={swoopColor}
        sparkleColor={sparkleColor}
        className={className}
      />
    );
  }

  return (
    <div
      className={`logo-container logo-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isVertical ? '0.5rem' : '0.85rem',
        flexDirection: isVertical ? 'column' : 'row',
        textAlign: isVertical ? 'center' : 'left',
        userSelect: 'none',
      }}
    >
      <ToothSmileIcon
        size={iconSize}
        toothColor={toothColor}
        swoopColor={swoopColor}
        sparkleColor={sparkleColor}
      />

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, alignItems: isVertical ? 'center' : 'flex-start' }}>
        <div style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: ts.brand,
          letterSpacing: '-0.02em',
          display: 'flex',
          alignItems: 'baseline',
        }}>
          <span style={{ color: brandTextColor }}>Smile</span>
          <span style={{ color: craftColor }}>Craft</span>
        </div>

        <div style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 500,
          fontSize: ts.sub,
          color: subTextColor,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          marginTop: '2px',
        }}>
          Dental Clinic
        </div>

        {showTagline && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '6px',
            fontSize: ts.tag,
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 500,
            color: tagColor,
            whiteSpace: 'nowrap',
          }}>
            <span style={{ height: '1.5px', width: '22px', backgroundColor: lineRuleColor, display: 'inline-block' }} />
            <span>Healthy Smiles Brighter Lives</span>
            <span style={{ height: '1.5px', width: '22px', backgroundColor: lineRuleColor, display: 'inline-block' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export const LogoWhite = (props) => <Logo {...props} variant="dark" />;
export const LogoMonochrome = (props) => <Logo {...props} variant="monochrome" />;
export const LogoVertical = (props) => <Logo {...props} variant="vertical" />;

export default Logo;
