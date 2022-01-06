import {PreferenceConsts, PreferencesEntity} from '../../../../common';
import {AppShell} from '../../../appShell';
import {Logger, ModelBase, observeEvent, Router, DisposableUtil} from 'esp-js';
import {IdFactory, Region, RegionItem} from 'esp-js-ui';
import {viewBinding} from 'esp-js-react';
import {AppPreferencesView} from '../views';
import {ShellEvents} from '../../../events';

const _log = Logger.create('AppPreferencesModel');

@viewBinding(AppPreferencesView)
export class AppPreferencesModel extends ModelBase {
    private _preferencesEntities: PreferencesEntity[] = [];
    private _regionItem: RegionItem;

    constructor(private _shell: AppShell, router: Router, private _modalRegion: Region) {
        super(IdFactory.createId('preferenceModelId'), router);
        this._regionItem = RegionItem.create(this.modelId);
    }

    public get preferencesEntities() {
        return this._preferencesEntities;
    }

    public observeEvents() {
        super.observeEvents();

        _log.info(`Showing Preference Screen`);

        // This class, AppPreferencesModel, is owned by the shell, it's registered in the main application Container.
        // Each module has its own container.
        // We can use the modules containers to resolve any PreferenceConsts.preferenceEntity registered for those modules.
        // Once we have these, we can let the view take care of display via @viewBinding decorators which should have decorated any PreferenceEntity objects registered.
        this._preferencesEntities = this._shell.modules
            .map(m => m.container)
            .filter(c => c.isRegistered(PreferenceConsts.preferenceEntity))
            // we resolve the entities here, we pass the modelId and router in case they need it
            .map(c => c.resolve<PreferencesEntity>(PreferenceConsts.preferenceEntity, this.modelId, this.router));

        this._preferencesEntities.forEach(e => {
            this.addDisposable(this._router.observeEventsOn(this.modelId, e));
            if (DisposableUtil.isDisposable(e)) {
                this.addDisposable(e);
            }
        });

        this._modalRegion.addToRegion(this._regionItem);
    }

    @observeEvent(ShellEvents.closePreferences)
    private _showPreferences() {
        this._modalRegion.removeFromRegion(this._regionItem);

        // Get all the preference state

        let preferenceStates = this._preferencesEntities.reduce(
            (state, entity) => {
                state[entity.name] = entity.getPreferenceState();
                return state;
            },
            {}
        );

        // In a real world scenario we'd save that, for this app we just lot it.
        _log.info(`Preference state is \r\n${JSON.stringify(preferenceStates, null, 2)}`);

        this.dispose();
    }
}