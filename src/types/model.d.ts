declare interface ModelInfo {
  source: string;
  texture?: string;
  rotate?: { x?: number; y?: number; z?: number };
  isTrackballControlls?: boolean;
  /** 初始位置偏移倍率，以模型默认大小为基准 */
  offsetPower?: { x?: number; y?: number; z?: number };
  zoom?: number;
  orbitAngle?: {
    minPolarAngle?: number;
    maxPolarAngle?: number;
    minAzimuthAngle?: number;
    maxAzimuthAngle?: number;
  };
  cameraPosition?: { x?: number; y?: number; z?: number };
  playAni?: boolean;
  deltaRatio?: number;
  exposure?: number | null;
  toneMappingExposure?: number;
  colorSpace?: THREE.ColorSpace;
  ambientLightIntensity?: number;
}
