import { SPFI } from '@pnp/sp';

export interface IMdCardWebPartProps {
  sp: SPFI;
  /**
   * Full SharePoint URL or server-relative path to the .md file.
   * Examples:
   *   https://tenant.sharepoint.com/sites/MySite/Shared Documents/cards/card.md
   *   /sites/MySite/Shared Documents/cards/card.md
   */
  fileUrl: string;
}
