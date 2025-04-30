'use client'

import type React from "react";
import Navbar from "@/app/components/navbar";
import { AuthProvider } from "@/app/context/AuthContext";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// Grid cell configuration
interface GridCell {
  id: number;
  row: number;
  col: number;
  shade: string;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Create a diamond grid pattern with varying shades of gray
  const rows = 20;  // Keep current row count
  const cols = 60;  // Keep current column count
  
  const grayShades = [
    'bg-white',
    'bg-gray-100',
    'bg-gray-200',
  ];
  
  // Generate all grid cells for the diamond pattern
  const gridCells: GridCell[] = [];
  
  // Using a repeatable pattern approach rather than relative position
  for (let row = -2; row < rows + 2; row++) { 
    for (let col = -2; col < cols + 2; col++) {
      
      // Simplified pattern generation - more consistent repeating pattern
      // Use modulo to create a repeating pattern regardless of position
      const patternSize = 4; // Size of the repeating pattern
      const normalizedRow = Math.abs(row % patternSize);
      const normalizedCol = Math.abs(col % patternSize);
      
      // Create simple diagonal pattern
      const patternValue = (normalizedRow + normalizedCol) % grayShades.length;
      
      gridCells.push({
        id: (row + 2) * (cols + 4) + (col + 2),
        row,
        col,
        shade: grayShades[patternValue]
      });
    }
  }

  return (
    <html lang="en">
      <body className={`${inter.className} relative overflow-x-hidden`}>
        {/* Diamond grid background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute" style={{ 
            top: 0,
            left: "-50px", // Start pattern to the left of viewport
            right: 0,
            bottom: 0,
            width: "calc(100% + 100px)", // Extend width beyond viewport
            height: "100%"
          }}>
            {gridCells.map((cell) => (
              <div
                key={cell.id}
                className={`absolute border border-gray-300 ${cell.shade}`}
                style={{
                  width: '50px',
                  height: '50px',
                  top: `${cell.row * 35}px`,
                  left: `${cell.col * 35}px`,
                  transform: 'rotate(45deg)',
                }}
              />
            ))}
          </div>
        </div>
        
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}