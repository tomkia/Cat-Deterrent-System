export enum MqttStatus {
  Connecting = 'Connecting',
  Connected = 'Connected',
  Disconnected = 'Disconnected',
  Error = 'Error',
}

export interface ScriptConfig {
  confidence: number;
  cooldown: number;
}

export interface Point {
  x: number;
  y: number;
}

export type Zone = Point[];

export interface CropRegion {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ZoneConfig {
    activation_areas: Zone[];
    crop_region: CropRegion | null;
}