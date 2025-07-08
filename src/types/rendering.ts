/**
 * Options for rendering strip visualization images
 */
export interface StripRenderOptions {
  /** Camera strip analysis results to visualize */
  analysis: {
    /** Array of detected strips */
    strips: Array<{
      /** Position of the strip in the frame */
      position: number;
      /** Distance from the previous strip */
      distance?: number;
      /** Whether this strip is highlighted */
      isHighlighted?: boolean;
    }>;
    /** Frame dimensions */
    frameWidth: number;
    frameHeight: number;
  };
  /** Whether to render with transparent background */
  transparentBackground?: boolean;
  /** Output file path for the generated image */
  outputPath?: string;
}

/**
 * Represents a single strip visualization element
 */
export interface StripVisualization {
  /** Horizontal position of the strip (0-1 normalized) */
  position: number;
  /** Distance from previous strip in pixels */
  distance: number;
  /** Whether this strip should be highlighted */
  isHighlighted: boolean;
}

/**
 * Configuration for rendering text overlays
 */
export interface TextOverlayConfig {
  /** Text content to render */
  text: string;
  /** X position for text placement */
  x: number;
  /** Y position for text placement */
  y: number;
  /** Font size in pixels */
  fontSize?: number;
  /** Text color (hex or rgba) */
  color?: string;
  /** Outline color for better visibility */
  outlineColor?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}

/**
 * Options for image composition
 */
export interface ImageCompositionOptions {
  /** Base width of the output image */
  width: number;
  /** Base height of the output image */
  height: number;
  /** Background color or transparency */
  background?: string | { r: number; g: number; b: number; alpha: number };
  /** Layers to composite */
  layers: Array<{
    /** Layer type */
    type: 'strip' | 'text' | 'highlight';
    /** Layer-specific data */
    data: unknown;
  }>;
}

/**
 * Strip rendering style configuration
 */
export interface StripStyle {
  /** Line thickness in pixels */
  thickness: number;
  /** Color for opaque strips */
  opaqueColor: string;
  /** Color for transparent strips */
  transparentColor: string;
  /** Color for highlighted strips */
  highlightColor: string;
  /** Opacity level (0-1) */
  opacity?: number;
}

/**
 * Result of strip visualization rendering
 */
export interface StripRenderResult {
  /** Path to the generated image */
  outputPath: string;
  /** Image dimensions */
  dimensions: {
    width: number;
    height: number;
  };
  /** Number of strips rendered */
  stripCount: number;
  /** Rendering metadata */
  metadata: {
    renderTime: number;
    fileSize: number;
    format: string;
  };
}
