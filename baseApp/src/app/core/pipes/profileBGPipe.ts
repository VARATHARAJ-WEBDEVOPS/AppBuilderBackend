import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bgColor'
})
export class BgColorPipe implements PipeTransform {
  transform(value: string): string {
    const colors: { [key: string]: string } = {
      'A': '#B22222', // Firebrick
      'B': '#556B2F', // Dark Olive Green
      'C': '#2B4F81', // Dark Steel Blue
      'D': '#FF4500', // Orange Red
      'E': '#4B0082', // Indigo
      'F': '#006400', // Dark Green
      'G': '#8B4513', // Saddle Brown (unchanged)
      'H': '#CD5C5C', // Indian Red
      'I': '#1E90FF', // Dodger Blue
      'J': '#8B0000', // Dark Red
      'K': '#C71585', // Medium Violet Red
      'L': '#B8860B', // Dark Goldenrod
      'M': '#228B22', // Forest Green
      'N': '#A9A9A9', // Dark Gray
      'O': '#8B0000', // Dark Red
      'P': '#9932CC', // Dark Orchid
      'Q': '#6B8E23', // Olive Drab
      'R': '#C71585', // Medium Violet Red (unchanged)
      'S': '#4682B4', // Steel Blue (unchanged)
      'T': '#DB7093', // Pale Violet Red
      'U': '#800080', // Purple
      'V': '#556B2F', // Dark Olive Green (unchanged)
      'W': '#483D8B', // Dark Slate Blue
      'X': '#A52A2A', // Brown
      'Y': '#8B4513', // Saddle Brown (unchanged)
      'Z': '#800080'  // Purple (unchanged)
    };
    
    

    const letter = value.toUpperCase()[0];
    return colors[letter] || '#000'; // Default color if not found
  }
}
