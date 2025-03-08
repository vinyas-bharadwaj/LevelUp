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
  const rows = 20;  // Adjust for larger diamonds
  const cols = 30;  // Adjust for larger diamonds
  
  // Gray shade options from lightest to darkest
  const grayShades = [
    'bg-white',
    'bg-gray-100',
    'bg-gray-200',
    
  ];
  
  // Generate all grid cells for the diamond pattern
  const gridCells: GridCell[] = [];
  
  for (let row = -2; row < rows + 2; row++) {  // Add extra rows for better edge coverage
    for (let col = -2; col < cols + 2; col++) { // Add extra columns for better edge coverage
      // Create a deterministic but interesting pattern
      // We'll use a combination of row and column to determine the shade
      
      // Pattern 1: Diagonal stripes
      const diagonalValue = (row + col) % grayShades.length;
      
      // Pattern 2: Concentric diamonds
      const centerRow = rows / 2;
      const centerCol = cols / 2;
      const distanceFromCenter = Math.max(
        Math.abs(row - centerRow),
        Math.abs(col - centerCol)
      );
      const ringValue = distanceFromCenter % grayShades.length;
      
      // Pattern 3: Checkerboard
      const checkerValue = ((row % 2) + (col % 2)) % 2 === 0 ? 0 : 2;
      
      // Combine patterns for more visual interest
      // With a higher weight on the diagonal pattern
      const combinedValue = (diagonalValue * 2 + ringValue + checkerValue) % grayShades.length;
      
      gridCells.push({
        id: (row + 2) * (cols + 4) + (col + 2),
        row,
        col,
        shade: grayShades[combinedValue]
      });
    }
  }

  return (
    <html lang="en">
      <body className={`${inter.className} relative overflow-x-hidden`}>
        {/* Diamond grid background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 -m-10" style={{ 
            transform: 'scale(1.2)', 
            transformOrigin: 'center center'
          }}>
            {gridCells.map((cell) => (
              <div
                key={cell.id}
                className={`absolute border border-gray-300 ${cell.shade}`}
                style={{
                  width: '10vmin',  // Larger diamonds
                  height: '10vmin', // Larger diamonds
                  top: `calc(${cell.row * 7}vmin)`,
                  left: `calc(${cell.col * 7}vmin)`,
                  transform: 'rotate(45deg)', // Rotate to create diamond shape
                }}
              />
            ))}
          </div>
        </div>
        <AuthProvider>
          <Navbar />
          <main className="px-6 py-12 relative">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}