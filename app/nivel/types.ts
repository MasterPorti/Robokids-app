export type AnimationType = "yoyo" | "once" | "restart";

export interface Ball {
  path: { x: number; y: number }[];
  color: string;
  delay: number;
  animationType: AnimationType;
  duration: number;
}

export type TextSegment =
  | { type: "text"; content: string }
  | { type: "dots"; correctAnswer: string };
