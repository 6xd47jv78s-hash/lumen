import type { Track } from "@/lib/content/types";
import { charts } from "./charts";
import { foundations } from "./foundations";
import { macro } from "./macro";
import { path } from "./path";
import { risk } from "./risk";
import { strategy } from "./strategy";

export const TRACKS: Track[] = [foundations, charts, strategy, risk, macro, path];
