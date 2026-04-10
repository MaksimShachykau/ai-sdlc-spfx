import { SPFI } from '@pnp/sp';

export interface ICardWebPartProps {
  sp: SPFI;
  /** Server-relative URL of the current SP site, e.g. /sites/AI-SDLCRoleMatrix */
  siteServerRelativeUrl: string;
  /** Fallback role — used when the page URL doesn't match the expected pattern */
  role: string;
  /** Fallback phase */
  phase: string;
  /** Fallback level */
  level: 'ai-enabled' | 'ai-first' | 'ai-native';
}
