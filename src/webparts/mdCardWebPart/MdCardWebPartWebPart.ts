import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { spfi, SPFI, SPFx } from '@pnp/sp';

import MdCardWebPart from './components/MdCardWebPart';

interface IMdCardWebPartProperties {
  fileUrl: string;
}

export default class MdCardWebPartWebPart extends BaseClientSideWebPart<IMdCardWebPartProperties> {

  private _sp!: SPFI;

  protected onInit(): Promise<void> {
    this._sp = spfi().using(SPFx(this.context));
    return super.onInit();
  }

  public render(): void {
    ReactDom.render(
      React.createElement(MdCardWebPart, {
        sp: this._sp,
        fileUrl: this.properties.fileUrl ?? '',
      }),
      this.domElement
    );
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: 'Paste the full SharePoint URL to a .md file, or a server-relative path.',
          },
          groups: [
            {
              groupName: 'Markdown source',
              groupFields: [
                PropertyPaneTextField('fileUrl', {
                  label: 'SharePoint file URL',
                  description: 'e.g. https://tenant.sharepoint.com/sites/MySite/Shared Documents/cards/card.md',
                  multiline: true,
                  rows: 3,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
