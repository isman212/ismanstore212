import React, { useMemo } from 'react';

interface QrCodeMatrixProps {
  payload: string;
  size?: number;
}

export const QrCodeMatrix: React.FC<QrCodeMatrixProps> = ({ payload, size = 180 }) => {
  const modules = useMemo(() => {
    const grid = 25;
    const matrix: boolean[][] = Array.from({ length: grid }, () =>
      Array.from({ length: grid }, () => false)
    );

    const drawFinder = (r0: number, c0: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[r0 + r][c0 + c] = isBorder || isCenter;
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, grid - 7);
    drawFinder(grid - 7, 0);

    // Timing patterns
    for (let i = 8; i < grid - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }

    // Deterministic data fill from payload string
    let seed = 2166136261;
    for (let i = 0; i < payload.length; i++) {
      seed ^= payload.charCodeAt(i);
      seed = Math.imul(seed, 16777619);
    }

    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= grid - 8;
        const inBottomLeft = r >= grid - 8 && c < 8;
        const onTiming = r === 6 || c === 6;
        if (inTopLeft || inTopRight || inBottomLeft || onTiming) continue;

        seed ^= (r * 31 + c * 17) & 0xff;
        seed = Math.imul(seed, 16777619);
        matrix[r][c] = (seed >>> 0) % 100 < 48;
      }
    }

    return matrix;
  }, [payload]);

  const cellSize = size / 25;

  return (
    <div className="inline-flex flex-col items-center bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="QRIS Pembayaran Otomatis ismanstore212"
      >
        <rect width={size} height={size} fill="#FFFFFF" />
        {modules.map((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize + 0.15}
                height={cellSize + 0.15}
                fill="#090B10"
              />
            ) : null
          )
        )}
      </svg>
      <div className="mt-2 flex items-center justify-between w-full text-[11px] font-mono text-slate-700 px-1">
        <span className="font-semibold">QRIS · GPN</span>
        <span>ismanstore212</span>
      </div>
    </div>
  );
};
