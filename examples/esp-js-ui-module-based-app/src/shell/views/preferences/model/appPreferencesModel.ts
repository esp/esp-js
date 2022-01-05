import {PreferenceConsts, PreferencesEntity} from '../../../../common';
import {AppShell} from '../../../appShell';
import {Logger, ModelBase, observeEvent, Router} from 'esp-js';
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

        this._preferencesEntities = this._shell.modules
            .map(m => m.container)
            .filter(c => c.isRegistered(PreferenceConsts.preferenceEntity))
            .map(c => c.resolve<PreferencesEntity>(PreferenceConsts.preferenceEntity, this.modelId, this.router));

        this._preferencesEntities.forEach(e => {
            this.addDisposable(this._router.observeEventsOn(this.modelId, e));
        });

        this._modalRegion.addToRegion(this._regionItem);
    }

    @observeEvent(ShellEvents.closePreferences)
    private _showPreferences() {
        this._modalRegion.removeFromRegion(this._regionItem);

        let preferenceStates = this._preferencesEntities.reduce(
            (state, entity) => {
                state[entity.name] = entity.getPreferenceState();
                return state;
            },
            {}
        );

        _log.info(`Saving Preference as\r\n${JSON.stringify(preferenceStates, null, 2)}`);

        this.dispose();
    }
}