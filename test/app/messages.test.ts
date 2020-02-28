/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import * as sinon from 'sinon';
import { ExtensionManager } from '../../src/app/extensionManager';
import { ErrorHandler } from '../../src/common/errorHandler';
import { ConfigManager } from '../../src/configuration/configManager';
import { constants } from '../../src/constants';
import { IconsGenerator } from '../../src/iconsManifest';
import { IntegrityManager } from '../../src/integrity/integrityManager';
import * as models from '../../src/models';
import { NotificationManager } from '../../src/notification/notificationManager';
import { ProjectAutoDetectionManager } from '../../src/pad/projectAutoDetectionManager';
import { SettingsManager } from '../../src/settings/settingsManager';
import { UIManager } from '../../src/ui/uiManager';
import { Utils } from '../../src/utils';
import { VSCodeManager } from '../../src/vscode/vscodeManager';
import { vsicons } from '../fixtures/vsicons';

describe('ExtensionManager: messages tests', function () {
  context('ensures that', function () {
    let sandbox: sinon.SinonSandbox;
    let vscodeManagerStub: sinon.SinonStubbedInstance<models.IVSCodeManager>;
    let configManagerStub: sinon.SinonStubbedInstance<models.IConfigManager>;
    let settingsManagerStub: sinon.SinonStubbedInstance<models.ISettingsManager>;
    let notifyManagerStub: sinon.SinonStubbedInstance<models.INotificationManager>;
    let iconsGeneratorStub: sinon.SinonStubbedInstance<models.IIconsGenerator>;
    let padMngStub: sinon.SinonStubbedInstance<models.IProjectAutoDetectionManager>;
    let integrityManagerStub: sinon.SinonStubbedInstance<models.IIntegrityManager>;
    let uiManagerStub: sinon.SinonStubbedInstance<models.IUIManager>;
    let isNewVersionStub: sinon.SinonStub;
    let logErrorStub: sinon.SinonStub;

    let extensionManager: models.IExtensionManager;
    let vsiconsClone: models.IVSIcons;
    let state: models.IState;

    beforeEach(function () {
      sandbox = sinon.createSandbox();

      vscodeManagerStub = sandbox.createStubInstance<models.IVSCodeManager>(
        VSCodeManager,
      );
      sandbox.stub(vscodeManagerStub, 'context').get(() => ({
        subscriptions: [],
      }));
      sandbox.stub(vscodeManagerStub, 'workspace').get(() => ({
        onDidChangeConfiguration: sandbox.stub(),
      }));

      configManagerStub = sandbox.createStubInstance<models.IConfigManager>(
        ConfigManager,
      );
      vsiconsClone = cloneDeep(vsicons);
      sandbox.stub(configManagerStub, 'vsicons').get(() => vsiconsClone);

      settingsManagerStub = sandbox.createStubInstance<models.ISettingsManager>(
        SettingsManager,
      );
      isNewVersionStub = sandbox
        .stub(settingsManagerStub, 'isNewVersion')
        .get(() => false);

      notifyManagerStub = sandbox.createStubInstance<
        models.INotificationManager
      >(NotificationManager);

      iconsGeneratorStub = sandbox.createStubInstance<models.IIconsGenerator>(
        IconsGenerator,
      );

      padMngStub = sandbox.createStubInstance<
        models.IProjectAutoDetectionManager
      >(ProjectAutoDetectionManager);

      integrityManagerStub = sandbox.createStubInstance<
        models.IIntegrityManager
      >(IntegrityManager);

      uiManagerStub = sandbox.createStubInstance<models.IUIManager>(UIManager);

      extensionManager = new ExtensionManager(
        vscodeManagerStub,
        configManagerStub,
        settingsManagerStub,
        notifyManagerStub,
        iconsGeneratorStub,
        padMngStub,
        integrityManagerStub,
        uiManagerStub,
      );

      logErrorStub = sandbox.stub(ErrorHandler, 'logError');

      state = SettingsManager.defaultState;
    });

    afterEach(function () {
      sandbox.restore();
    });

    context(`managing the intro message`, function () {
      let showWelcomeMessageStub: sinon.SinonStub;
      let showNewVersionMessageStub: sinon.SinonStub;

      beforeEach(function () {
        showWelcomeMessageStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'showWelcomeMessage',
        );
        showNewVersionMessageStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'showNewVersionMessage',
        );
      });

      context(`the welcome message gets`, function () {
        context(`shown`, function () {
          beforeEach(function () {
            state.welcomeShown = false;
            settingsManagerStub.getState.returns(state);
            configManagerStub.getIconTheme.returns(undefined);
          });

          it(`when the 'welcomeShown' setting is 'false'`, async function () {
            // @ts-ignore
            await extensionManager.manageIntroMessage();

            expect(showWelcomeMessageStub.calledOnceWithExactly()).to.be.true;
            expect(showNewVersionMessageStub.called).to.be.false;
          });

          it(`when the icon theme is NOT set to this extension`, async function () {
            // @ts-ignore
            await extensionManager.manageIntroMessage();

            expect(showWelcomeMessageStub.calledOnceWithExactly()).to.be.true;
            expect(showNewVersionMessageStub.called).to.be.false;
          });
        });

        context(`NOT shown`, function () {
          beforeEach(function () {
            state.welcomeShown = true;
            settingsManagerStub.getState.returns(state);
            configManagerStub.getIconTheme.returns(constants.extension.name);
          });

          it(`when the 'welcomeShown' setting is 'true'`, async function () {
            // @ts-ignore
            await extensionManager.manageIntroMessage();

            expect(showWelcomeMessageStub.called).to.be.false;
            expect(showNewVersionMessageStub.called).to.be.false;
          });

          it(`when the icon theme is set to this extension`, async function () {
            // @ts-ignore
            await extensionManager.manageIntroMessage();

            expect(showWelcomeMessageStub.called).to.be.false;
            expect(showNewVersionMessageStub.called).to.be.false;
          });
        });
      });

      context(`the new version message gets`, function () {
        beforeEach(function () {
          state.welcomeShown = true;
          settingsManagerStub.getState.returns(state);
          configManagerStub.getIconTheme.returns(constants.extension.name);
        });

        context(`shown`, function () {
          beforeEach(function () {
            isNewVersionStub.value(true);
            configManagerStub.vsicons.dontShowNewVersionMessage = false;
          });

          it(`when the 'isNewVersion' setting is 'true'`, async function () {
            // @ts-ignore
            await extensionManager.manageIntroMessage();

            expect(settingsManagerStub.isNewVersion).to.be.true;
            expect(showWelcomeMessageStub.called).to.be.false;
            expect(
              showNewVersionMessageStub.calledOnceWithExactly(),
            ).to.be.true;
          });

          it(`when the 'dontShowNewVersionMessage' setting is 'false'`, async function () {
            // @ts-ignore
            await extensionManager.manageIntroMessage();

            expect(settingsManagerStub.isNewVersion).to.be.true;
            expect(showWelcomeMessageStub.called).to.be.false;
            expect(
              showNewVersionMessageStub.calledOnceWithExactly(),
            ).to.be.true;
          });
        });

        context(`NOT shown`, function () {
          beforeEach(function () {
            isNewVersionStub.value(false);
            configManagerStub.vsicons.dontShowNewVersionMessage = true;
          });

          it(`when the 'isNewVersion' setting is 'false'`, async function () {
            // @ts-ignore
            await extensionManager.manageIntroMessage();

            expect(settingsManagerStub.isNewVersion).to.be.false;
            expect(showWelcomeMessageStub.called).to.be.false;
            expect(showNewVersionMessageStub.called).to.be.false;
          });

          it(`when the 'dontShowNewVersionMessage' setting is 'true'`, async function () {
            // @ts-ignore
            await extensionManager.manageIntroMessage();

            expect(settingsManagerStub.isNewVersion).to.be.false;
            expect(showWelcomeMessageStub.called).to.be.false;
            expect(showNewVersionMessageStub.called).to.be.false;
          });
        });
      });
    });

    context(`managing the customizations`, function () {
      let applyCustomizationCommandStub: sinon.SinonStub;

      beforeEach(function () {
        // @ts-ignore
        sandbox.stub(Utils, 'unflattenProperties').returns({ vsicons });
        applyCustomizationCommandStub = sandbox.stub(
          extensionManager,
          // @ts-ignore
          'applyCustomizationCommand',
        );
      });

      context(`applies the customizations`, function () {
        context(`when there is a new version`, function () {
          it(`and the 'preset' or 'associations' configurations are different`, async function () {
            isNewVersionStub.value(true);
            configManagerStub.hasConfigChanged.returns(true);

            // @ts-ignore
            await extensionManager.manageCustomizations();

            expect(settingsManagerStub.isNewVersion).to.be.true;
            expect(
              applyCustomizationCommandStub.calledOnceWithExactly(),
            ).to.be.true;
          });
        });
      });

      context(`does NOT apply the customizations`, function () {
        context(`when there is a new version`, function () {
          it(`and the 'preset' or 'associatιons' configurations are NOT different`, async function () {
            isNewVersionStub.value(true);
            configManagerStub.hasConfigChanged.returns(false);

            // @ts-ignore
            await extensionManager.manageCustomizations();

            expect(settingsManagerStub.isNewVersion).to.be.true;
            expect(applyCustomizationCommandStub.called).to.be.false;
          });
        });

        context(`when there is NOT a new version`, function () {
          beforeEach(function () {
            isNewVersionStub.value(false);
          });

          context(
            `and the 'preset' or 'associatιons' configurations are`,
            function () {
              it(`different`, async function () {
                configManagerStub.hasConfigChanged.returns(true);

                // @ts-ignore
                await extensionManager.manageCustomizations();

                expect(settingsManagerStub.isNewVersion).to.be.false;
                expect(applyCustomizationCommandStub.called).to.be.false;
              });

              it(`NOT different`, async function () {
                configManagerStub.hasConfigChanged.returns(false);

                // @ts-ignore
                await extensionManager.manageCustomizations();

                expect(settingsManagerStub.isNewVersion).to.be.false;
                expect(applyCustomizationCommandStub.called).to.be.false;
              });
            },
          );
        });
      });
    });

    context(`showing the welcome message`, function () {
      it(`logs an Error, when displaying the message fails`, async function () {
        const error = new Error();
        notifyManagerStub.notifyInfo.rejects(error);

        // @ts-ignore
        await extensionManager.showWelcomeMessage();

        expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
      });

      context(`selecting`, function () {
        let activationCommandStub: sinon.SinonStub;
        let openStub: sinon.SinonStub;

        beforeEach(function () {
          activationCommandStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'activationCommand',
          );
          openStub = sandbox.stub(Utils, 'open');
        });

        context(`an unsupported option`, function () {
          it(`does nothing`, async function () {
            notifyManagerStub.notifyInfo.resolves();

            // @ts-ignore
            await extensionManager.showWelcomeMessage();

            expect(
              notifyManagerStub.notifyInfo.calledOnceWithExactly(
                models.LangResourceKeys.welcome,
                models.LangResourceKeys.activate,
                models.LangResourceKeys.aboutOfficialApi,
                models.LangResourceKeys.seeReadme,
              ),
            ).to.be.true;
            expect(activationCommandStub.called).to.be.false;
            expect(openStub.called).to.be.false;
          });
        });

        context(`to activate the extension`, function () {
          it(`calls the activation command`, async function () {
            notifyManagerStub.notifyInfo.resolves(
              models.LangResourceKeys.activate,
            );

            // @ts-ignore
            await extensionManager.showWelcomeMessage();

            expect(
              notifyManagerStub.notifyInfo.calledOnceWithExactly(
                models.LangResourceKeys.welcome,
                models.LangResourceKeys.activate,
                models.LangResourceKeys.aboutOfficialApi,
                models.LangResourceKeys.seeReadme,
              ),
            ).to.be.true;
            expect(activationCommandStub.calledOnceWithExactly()).to.be.true;
          });
        });

        context(`to read about the official API`, function () {
          it(`opens the official API url and re-displays the message`, async function () {
            notifyManagerStub.notifyInfo
              .onFirstCall()
              .resolves(models.LangResourceKeys.aboutOfficialApi)
              .resolves();

            // @ts-ignore
            await extensionManager.showWelcomeMessage();
            expect(
              notifyManagerStub.notifyInfo.calledWithExactly(
                models.LangResourceKeys.welcome,
                models.LangResourceKeys.activate,
                models.LangResourceKeys.aboutOfficialApi,
                models.LangResourceKeys.seeReadme,
              ),
            ).to.be.true;
            expect(notifyManagerStub.notifyInfo.calledTwice).to.be.true;
            expect(
              openStub.calledOnceWithExactly(constants.urlOfficialApi),
            ).to.be.true;
          });
        });

        context(`to read about the extension`, function () {
          it(`opens the readme url and re-displays the message`, async function () {
            notifyManagerStub.notifyInfo
              .onFirstCall()
              .resolves(models.LangResourceKeys.seeReadme)
              .resolves();

            // @ts-ignore
            await extensionManager.showWelcomeMessage();

            expect(
              notifyManagerStub.notifyInfo.calledWithExactly(
                models.LangResourceKeys.welcome,
                models.LangResourceKeys.activate,
                models.LangResourceKeys.aboutOfficialApi,
                models.LangResourceKeys.seeReadme,
              ),
            ).to.be.true;
            expect(notifyManagerStub.notifyInfo.calledTwice).to.be.true;
            expect(
              openStub.calledOnceWithExactly(constants.urlReadme),
            ).to.be.true;
          });
        });
      });
    });

    context(`showing the new version message`, function () {
      it(`logs an Error, when displaying the message fails`, async function () {
        const error = new Error();
        notifyManagerStub.notifyInfo.rejects(error);

        // @ts-ignore
        await extensionManager.showNewVersionMessage();

        expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
      });

      context(`selecting`, function () {
        let openStub: sinon.SinonStub;

        beforeEach(function () {
          openStub = sandbox.stub(Utils, 'open');
        });

        context(`an unsupported option`, function () {
          it(`does nothing`, async function () {
            notifyManagerStub.notifyInfo.resolves();

            // @ts-ignore
            await extensionManager.showNewVersionMessage();

            expect(
              notifyManagerStub.notifyInfo.calledOnceWithExactly(
                `%s v${constants.extension.version}`,
                models.LangResourceKeys.newVersion,
                models.LangResourceKeys.seeReleaseNotes,
                models.LangResourceKeys.dontShowThis,
              ),
            ).to.be.true;
            expect(openStub.called).to.be.false;
            expect(
              configManagerStub.updateDontShowNewVersionMessage.called,
            ).to.be.false;
          });
        });

        context(`to read the release notes`, function () {
          it(`opens the release notes url`, async function () {
            notifyManagerStub.notifyInfo
              .onFirstCall()
              .resolves(models.LangResourceKeys.seeReleaseNotes);

            // @ts-ignore
            await extensionManager.showNewVersionMessage();

            expect(
              notifyManagerStub.notifyInfo.calledOnceWithExactly(
                `%s v${constants.extension.version}`,
                models.LangResourceKeys.newVersion,
                models.LangResourceKeys.seeReleaseNotes,
                models.LangResourceKeys.dontShowThis,
              ),
            ).to.be.true;
            expect(
              openStub.calledOnceWithExactly(constants.urlReleaseNote),
            ).to.be.true;
          });
        });

        context(`to NOT show this message again`, function () {
          it(`updates the configuration`, async function () {
            notifyManagerStub.notifyInfo.resolves(
              models.LangResourceKeys.dontShowThis,
            );

            // @ts-ignore
            await extensionManager.showNewVersionMessage();

            expect(
              notifyManagerStub.notifyInfo.calledOnceWithExactly(
                `%s v${constants.extension.version}`,
                models.LangResourceKeys.newVersion,
                models.LangResourceKeys.seeReleaseNotes,
                models.LangResourceKeys.dontShowThis,
              ),
            ).to.be.true;
            expect(
              configManagerStub.updateDontShowNewVersionMessage.calledOnceWithExactly(
                true,
              ),
            ).to.be.true;
          });
        });
      });
    });

    context(`showing the customization message`, function () {
      let supportsThemesReloadStub: sinon.SinonStub;
      beforeEach(function () {
        supportsThemesReloadStub = sandbox.stub(
          vscodeManagerStub,
          'supportsThemesReload',
        );
      });

      context(`when editor theme reload is NOT supported`, function () {
        it(`calls the action handler`, async function () {
          const message = 'test';
          const items = ['item'];
          const cb = sinon.fake();
          const cbArgs = [];
          const handleActionStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'handleAction',
          );
          supportsThemesReloadStub.get(() => false);
          notifyManagerStub.notifyInfo.resolves('btn');

          // @ts-ignore
          await extensionManager.showCustomizationMessage(
            message,
            items,
            cb,
            cbArgs,
          );

          expect(
            notifyManagerStub.notifyInfo.calledOnceWithExactly(
              message,
              ...items,
            ),
          ).to.be.true;
          expect(
            handleActionStub.calledOnceWithExactly('btn', cb, cbArgs),
          ).to.be.true;
        });
      });

      context(`when editor theme reload is supported`, function () {
        it(`calls the action handler`, async function () {
          const message = 'test';
          const items = [models.LangResourceKeys.reload];
          const cb = sinon.fake();
          const cbArgs = [];
          const handleActionStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'handleAction',
          );
          supportsThemesReloadStub.get(() => true);

          // @ts-ignore
          await extensionManager.showCustomizationMessage(
            message,
            items,
            cb,
            cbArgs,
          );

          expect(notifyManagerStub.notifyInfo.called).to.be.false;
          expect(
            handleActionStub.calledOnceWithExactly(
              models.LangResourceKeys.reload,
              cb,
              cbArgs,
            ),
          ).to.be.true;
        });
      });

      context(`logs an Error`, function () {
        let handleActionStub: sinon.SinonStub;
        beforeEach(function () {
          handleActionStub = sandbox.stub(
            extensionManager,
            // @ts-ignore
            'handleAction',
          );
        });

        it(`when displaying the message fails`, async function () {
          const message = 'test';
          const items = ['item'];
          const error = new Error();
          notifyManagerStub.notifyInfo.rejects(error);
          supportsThemesReloadStub.get(() => false);

          // @ts-ignore
          await extensionManager.showCustomizationMessage(message, items);

          expect(
            notifyManagerStub.notifyInfo.calledOnceWithExactly(
              message,
              ...items,
            ),
          ).to.be.true;
          expect(handleActionStub.called).to.be.false;
          expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
        });

        it(`when the handling action fails`, async function () {
          const message = 'test';
          const items = [models.LangResourceKeys.reload];
          const error = new Error();
          handleActionStub.throws(error);
          supportsThemesReloadStub.get(() => true);

          // @ts-ignore
          await extensionManager.showCustomizationMessage(message, items);

          expect(notifyManagerStub.notifyInfo.called).to.be.false;
          expect(
            handleActionStub.calledOnceWithExactly(
              models.LangResourceKeys.reload,
              undefined,
              undefined,
            ),
          ).to.be.true;
          expect(logErrorStub.calledOnceWithExactly(error)).to.be.true;
        });
      });
    });
  });
});
