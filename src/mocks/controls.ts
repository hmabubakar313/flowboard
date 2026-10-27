import { resetDb } from "./db";
import { isFailureSimulated, setFailureSimulated } from "./mock-client";

/** Controls for the demo environment, surfaced on the Settings page. */
export { isFailureSimulated, setFailureSimulated, resetDb as resetMockData };
