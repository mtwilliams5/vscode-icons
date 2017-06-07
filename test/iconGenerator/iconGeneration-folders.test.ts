// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { expect } from 'chai';
import { schema as defaultSchema, IconGenerator } from '../../src/icon-manifest';
import { extensions as folders } from '../../src/icon-manifest/supportedFolders';
import * as models from '../../src/models';
import { vscode } from '../../src/utils';
import { extensionSettings as settings } from '../../src/settings';
import { extensions as folderExtensions } from '../support/supportedFolders';

describe('IconGenerator: icon generation test', function () {

  context('ensures that', function () {

    let emptyFileCollection: models.IFileCollection;
    let emptyFolderCollection: models.IFolderCollection;

    beforeEach(() => {
      emptyFileCollection = { default: { file: { icon: 'file', format: 'svg' } }, supported: [] };
      emptyFolderCollection = { default: { folder: { icon: 'folder', format: 'svg' } }, supported: [] };
    });

    context('default', function () {

      let iconGenerator: IconGenerator;

      beforeEach(() => {
        iconGenerator = new IconGenerator(vscode, defaultSchema);
      });

      afterEach(() => {
        iconGenerator = null;
      });

      it('folder has an icon path',
        function () {
          const schema = iconGenerator.generateJson(emptyFileCollection, folders);
          expect(schema.iconDefinitions._folder.iconPath).not.to.be.empty;
        });

      it('folder has an open icon path',
        function () {
          const schema = iconGenerator.generateJson(emptyFileCollection, folders);
          expect(schema.iconDefinitions._folder_open.iconPath).not.to.be.equal('');
        });

      context('if a default \'light\' icon is NOT defined', function () {

        context('each supported', function () {

          const iconsFolderPath = path.join(__dirname, '../../../icons');

          context('folder', function () {

            it('has an associated icon file',
              function () {
                folders.supported
                  .forEach(folder => {
                    const filename =
                      `${settings.folderPrefix}${folder.icon}` +
                      `${settings.iconSuffix}.${models.FileFormat[folder.format]}`;
                    const iconFilePath = path.join(iconsFolderPath, filename);
                    expect(fs.existsSync(iconFilePath)).to.be.true;
                  });
              });

            it('has an associated opened icon file',
              function () {
                folders.supported
                  .forEach(folder => {
                    const filename =
                      `${settings.folderPrefix}${folder.icon}_opened` +
                      `${settings.iconSuffix}.${models.FileFormat[folder.format]}`;
                    const iconFilePath = path.join(iconsFolderPath, filename);
                    expect(fs.existsSync(iconFilePath)).to.be.true;
                  });
              });

            it('has a definition',
              function () {
                const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                folders.supported
                  .filter(folder => !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}`;
                    expect(schema.iconDefinitions[definition]).exist;
                  });
              });

            it('has an open definition',
              function () {
                const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                folders.supported
                  .filter(folder => !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}_open`;
                    expect(schema.iconDefinitions[definition]).exist;
                  });
              });

            it('has an icon path',
              function () {
                const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                folders.supported
                  .filter(folder => !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}`;
                    expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
                  });
              });

            it('has an open icon path',
              function () {
                const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                folders.supported
                  .filter(folder => !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}_open`;
                    expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
                  });
              });

            it('has a folder name expanded referencing its definition',
              function () {
                const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                folders.supported
                  .filter(folder => !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}_open`;
                    folder.extensions.forEach(extension => {
                      expect(schema.folderNamesExpanded[extension]).equal(definition);
                    });
                  });
              });

            it('has a folder name referencing its definition',
              function () {
                const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                folders.supported
                  .filter(folder => !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}`;
                    folder.extensions.forEach(extension => {
                      expect(schema.folderNames[extension]).equals(definition);
                    });
                  });
              });

            context('that has a light theme version', function () {

              it('has an associated icon file',
                function () {
                  folders.supported
                    .filter(folder => folder.light)
                    .forEach(folder => {
                      const filename =
                        `${settings.folderLightPrefix}${folder.icon}` +
                        `${settings.iconSuffix}.${models.FileFormat[folder.format]}`;
                      const iconFilePath = path.join(iconsFolderPath, filename);
                      expect(fs.existsSync(iconFilePath)).to.be.true;
                    });
                });

              it('has an associated opened icon file',
                function () {
                  folders.supported
                    .filter(folder => folder.light)
                    .forEach(folder => {
                      const filename =
                        `${settings.folderLightPrefix}${folder.icon}` +
                        `_opened${settings.iconSuffix}.${models.FileFormat[folder.format]}`;
                      const iconFilePath = path.join(iconsFolderPath, filename);
                      expect(fs.existsSync(iconFilePath)).to.be.true;
                    });
                });

              it('has a \'light\' definition',
                function () {
                  const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}`;
                      expect(schema.iconDefinitions[definition]).exist;
                    });
                });

              it('has a open \'light\' definition',
                function () {
                  const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}_open`;
                      expect(schema.iconDefinitions[definition]).exist;
                    });
                });

              it('has an icon path',
                function () {
                  const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}`;
                      expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
                    });
                });

              it('has an open icon path',
                function () {
                  const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}_open`;
                      expect(schema.iconDefinitions[definition].iconPath).not.to.be.equal('');
                    });
                });

              it('has a folder name referencing its \'light\' definition',
                function () {
                  const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}`;
                      folder.extensions.forEach(extension => {
                        expect(schema.light.folderNames[extension]).equal(definition);
                      });
                    });
                });

              it('has a folder name expanded referencing its open \'light\' definition',
                function () {
                  const schema = iconGenerator.generateJson(emptyFileCollection, folders);
                  folders.supported
                    .filter(folder => folder.light && !folder.disabled)
                    .forEach(folder => {
                      const definition = `${settings.manifestFolderLightPrefix}${folder.icon}_open`;
                      folder.extensions.forEach(extension => {
                        expect(schema.light.folderNamesExpanded[extension]).equal(definition);
                      });
                    });
                });

            });

          });

        });

      });

    });

    context('if a default \'light\' icon is defined', function () {

      context('each supported', function () {

        context('folder that has not a light theme version', function () {

          let schema: models.IIconSchema;

          beforeEach(() => {
            const dSchema: models.IIconSchema = { ...defaultSchema };
            dSchema.iconDefinitions._folder_light.iconPath = 'light_icon';
            schema = new IconGenerator(vscode, dSchema).generateJson(emptyFileCollection, folders);
          });

          afterEach(() => {
            schema = null;
          });

          context('if a default folder icon for light theme is specified', function () {

            it('has a \'light\' definition',
              function () {
                folders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderLightPrefix}${folder.icon}`;
                    expect(schema.iconDefinitions[definition]).exist;
                  });
              });

            it('has a folder name referencing its inherited definition',
              function () {
                folders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}`;
                    folder.extensions.forEach(extension => {
                      expect(schema.light.folderNames[extension]).equals(definition);
                    });
                  });
              });

          });

          context('if a default folder open icon for light theme is specified', function () {

            it('has an open \'light\' definition',
              function () {
                folders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderLightPrefix}${folder.icon}_open`;
                    expect(schema.iconDefinitions[definition]).exist;
                  });
              });

            it('has a folder name expanded referencing its inherited definition',
              function () {
                folders.supported
                  .filter(folder => !folder.light && !folder.disabled)
                  .forEach(folder => {
                    const definition = `${settings.manifestFolderPrefix}${folder.icon}_open`;
                    folder.extensions.forEach(extension => {
                      expect(schema.light.folderNamesExpanded[extension]).equals(definition);
                    });
                  });
              });

          });

        });

      });

    });

    context('if has defined mappings', function () {

      it('that is not implemented, throws an Error',
        function () {
          const clonedFolderExtensions = _.cloneDeep(folderExtensions);
          clonedFolderExtensions.supported.push({
            icon: 'vscode', extensions: ['vscode'], map: [-1], format: models.FileFormat.svg,
          });
          const iconGenerator = new IconGenerator(vscode, defaultSchema);
          const generateJson =
            iconGenerator.generateJson.bind(iconGenerator, emptyFileCollection, clonedFolderExtensions);
          expect(generateJson).to.throw(Error, /Not Implemented/);
        });

      let schema: models.IIconSchema;

      beforeEach(() => {
        schema = new IconGenerator(vscode, defaultSchema).generateJson(emptyFileCollection, folderExtensions);
      });

      afterEach(() => {
        schema = null;
      });

      it('of \'none\', doesn\'t add any mapped extensions',
        function () {
          folderExtensions.supported
            .filter(folder => !folder.disabled &&
              folder.map &&
              folder.map.some(map => map === models.Map.none))
            .forEach(folder => {
              folder.extensions
                .forEach(extension => {
                  expect(schema.folderNames).to.include.keys(extension);
                });
            });
        });

      it('of \'dotted\', adds also a dotted prefixed extension',
        function () {
          folderExtensions.supported
            .filter(folder => !folder.disabled &&
              folder.map &&
              folder.map.some(map => map === models.Map.dotted))
            .forEach(folder => {
              folder.extensions
                .forEach(extension => {
                  expect(schema.folderNames).to.include.keys(`.${extension}`);
                  // Reflect.ownKeys(schema.folderNames).forEach(key => {
                  //   expect(key).to.not.match(new RegExp(`^\.{2,}${extension}`));
                  // });
                });
           });
        });

      it('of \'leadingUnderscore\', adds also an underscored prefixed extension',
        function () {
          folderExtensions.supported
            .filter(folder => !folder.disabled &&
              folder.map &&
              folder.map.some(map => map === models.Map.leadingUnderscore))
            .forEach(folder => {
              folder.extensions
                .forEach(extension => {
                  expect(schema.folderNames).to.include.keys(`_${extension}`);
                });
            });
        });

      it('of \'trailingUnderscore\', adds also an underscored suffixed extension',
        function () {
          folderExtensions.supported
            .filter(folder => !folder.disabled &&
              folder.map &&
              folder.map.some(map => map === models.Map.trailingUnderscore))
            .forEach(folder => {
              folder.extensions
                .forEach(extension => {
                  expect(schema.folderNames).to.include.keys(`${extension}_`);
                });
            });
        });

      it('of \'fullyUnderscored\', adds also an underscored prefixed and suffixed extension',
        function () {
          folderExtensions.supported
            .filter(folder => !folder.disabled &&
              folder.map &&
              folder.map.some(map => map === models.Map.fullyUnderscored))
            .forEach(folder => {
              folder.extensions
                .forEach(extension => {
                  expect(schema.folderNames).to.include.keys(`_${extension}_`);
                });
            });
        });

      it('of \'leadingUnderscoreAndDotted\', adds also an underscored and a dotted prefixed extension',
        function () {
          folderExtensions.supported
            .filter(folder => !folder.disabled &&
              folder.map &&
              folder.map.some(map => map === models.Map.leadingUnderscoreAndDotted))
            .forEach(folder => {
              folder.extensions
                .forEach(extension => {
                  expect(schema.folderNames).to.include.keys(`.${extension}`);
                  expect(schema.folderNames).to.include.keys(`_${extension}`);
                });
            });
        });

      it('of \'all\', adds all supported prefixed and suffixed extensions',
        function () {
          folderExtensions.supported
            .filter(folder => !folder.disabled &&
              folder.map &&
              folder.map.some(map => map === models.Map.all))
            .forEach(folder => {
              folder.extensions
                .forEach(extension => {
                  expect(schema.folderNames).to.include.keys(`.${extension}`);
                  expect(schema.folderNames).to.include.keys(`_${extension}`);
                  expect(schema.folderNames).to.include.keys(`${extension}_`);
                  expect(schema.folderNames).to.include.keys(`_${extension}_`);
                });
            });
        });

    });

  });

});
