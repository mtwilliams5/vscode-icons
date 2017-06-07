import { IExtension } from './extension';
import { Map } from './map';

export interface IFolderExtension extends IExtension {
  map?: Map[]; // collection of mappings associated to the icon.
}
