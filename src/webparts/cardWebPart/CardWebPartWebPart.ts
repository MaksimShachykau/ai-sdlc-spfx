import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { spfi, SPFI, SPFx } from '@pnp/sp';

import CardWebPart from './components/CardWebPart';

interface ICardWebPartProperties {
  role: string;
  phase: string;
  level: 'ai-enabled' | 'ai-first' | 'ai-native';
}

export default class CardWebPartWebPart extends BaseClientSideWebPart<ICardWebPartProperties> {

  private _sp!: SPFI;

  protected onInit(): Promise<void> {
    this._sp = spfi().using(SPFx(this.context));
    return super.onInit();
  }

  public render(): void {
    ReactDom.render(
      React.createElement(CardWebPart, {
        sp: this._sp,
        siteServerRelativeUrl: this.context.pageContext.site.serverRelativeUrl,
        role: this.properties.role ?? 'developer',
        phase: this.properties.phase ?? 'development',
        level: this.properties.level ?? 'ai-enabled',
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
            description: 'Configure which role–phase card this web part renders.',
          },
          groups: [
            {
              groupName: 'Card settings',
              groupFields: [
                PropertyPaneTextField('role', {
                  label: 'Role slug (e.g. developer, qa, devops)',
                  description: 'Must match a folder under Documents/ai-sdlc-matrix-data/',
                }),
                PropertyPaneTextField('phase', {
                  label: 'Phase slug (e.g. development, planning, testing)',
                  description: 'Must match a subfolder under Documents/ai-sdlc-matrix-data/{role}/',
                }),
                PropertyPaneDropdown('level', {
                  label: 'AI maturity level',
                  options: [
                    { key: 'ai-enabled', text: 'AI Enabled' },
                    { key: 'ai-first',   text: 'AI-First'   },
                    { key: 'ai-native',  text: 'AI Native'  },
                  ],
                  selectedKey: this.properties.level ?? 'ai-enabled',
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
