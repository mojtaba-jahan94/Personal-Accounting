import React from 'react';

interface LiquidGlassContainerProps {
  children: React.ReactNode;
  className?: string;
  defaultConfig?: any;
  enabled?: boolean;
}

/**
 * Clean CSS glass container (zero WebGL, zero timers, zero rAF)
 */
export const LiquidGlassContainer: React.FC<LiquidGlassContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
};

export default LiquidGlassContainer;
