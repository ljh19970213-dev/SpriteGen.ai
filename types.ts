export enum AnimationType {
  WALK = 'WALK',
  JUMP = 'JUMP',
  IDLE = 'IDLE',
}

export interface GeneratedSprite {
  id: string;
  type: AnimationType;
  originalImage: string; // Base64
  spriteSheetImage: string; // Base64
  frameCount: number;
  timestamp: number;
}

export interface AnimationConfig {
  promptAddendum: string;
  frameCountGuess: number;
}