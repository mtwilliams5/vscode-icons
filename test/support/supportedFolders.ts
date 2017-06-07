// tslint:disable max-line-length
import { FileFormat, IFolderCollection } from '../../src/models';
import { Map as map } from '../../src/models';

export const extensions: IFolderCollection = {
  default: {
    folder: { icon: 'folder', format: FileFormat.svg },
  },
  supported: [
    { icon: 'aurelia', extensions: ['aurelia'], map: [map.none], format: FileFormat.svg },
    { icon: 'aws', extensions: ['aws', '.aws'], map: [map.dotted], format: FileFormat.svg },
    { icon: 'js', extensions: ['js'], map: [map.leadingUnderscore], format: FileFormat.svg },
    { icon: 'spec', extensions: ['spec'], map: [map.leadingUnderscoreAndDotted], format: FileFormat.svg },
    { icon: 'test', extensions: ['test', '_test_'], map: [map.fullyUnderscored], format: FileFormat.svg },
    { icon: 'ts', extensions: ['ts'], map: [map.trailingUnderscore], format: FileFormat.svg },
    { icon: 'webpack', extensions: ['webpack'], map: [map.all], format: FileFormat.svg },
 ],
};
