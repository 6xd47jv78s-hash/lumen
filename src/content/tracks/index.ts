import type { Track } from "@/lib/content/types";
import { charts } from "./charts";
import { foundations } from "./foundations";
import { risk } from "./risk";
import { strategy } from "./strategy";

export const TRACKS: Track[] = [foundations, charts, strategy, risk];
