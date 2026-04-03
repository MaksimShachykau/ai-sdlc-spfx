import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { spfi, SPFI, SPFx } from '@pnp/sp';

import MatrixWebPart from './components/MatrixWebPart';
export default class MatrixWebPartWebPart extends BaseClientSideWebPart<object> {

  private _sp!: SPFI;

  protected onInit(): Promise<void> {
    this._sp = spfi().using(SPFx(this.context));
    return super.onInit();
  }

  public render(): void {
    ReactDom.render(
      React.createElement(MatrixWebPart, { sp: this._sp }),
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
    return { pages: [] };
  }
}
