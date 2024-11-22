import {EventEnvelope, Router} from 'esp-js';
import {eventTransformFor, InputEvent, InputEventStream, OutputEvent, OutputEventStream} from 'esp-js-polimer';
import {map, switchAll} from 'rxjs/operators';
import {NEVER, of} from 'rxjs';
import * as uuid from 'uuid';
import {DynamicProductEvents} from '../../../events';
import {DynamicProductTileModel} from '../../dynamicProductTileModel';
import {ProductModelConfiguration, ProductType} from '../product';
import {SwapProductStateHandler} from '../product/swap';
import {OptionProductEventTransforms, OptionProductStateHandler} from '../product/option';

/**
 * An event transform that acts on side-effecting changes regarding the 'addProduct' state.
 *
 * The event transforms in this class expand and contract the model by adding new state handlers and event transforms
 */
export class AddProductFactoryEventTransforms {
    constructor(private _modelId: string, private _router: Router) {
    }

    /**
     * _bootstrap:
     * When the view is loaded, we check if there were any persisted products.
     * If so, we wire up state handlers / event transforms for them.
     */
    @eventTransformFor(DynamicProductEvents.Bootstrapping.bootstrap)
    _bootstrap(inputEventStream: InputEventStream<DynamicProductTileModel, DynamicProductEvents.Bootstrapping.BootstrapEvent>): OutputEventStream<DynamicProductEvents.AddProduct.ProductsBootstrappedFromStateEvent> {
        return inputEventStream
            .pipe(
                map(({event}: InputEvent<DynamicProductTileModel, DynamicProductEvents.Bootstrapping.BootstrapEvent>) => {
                    if (event.persistedProductStates?.length > 0) {
                        let bootstrappedProducts = event.persistedProductStates.map(productPersistedState => (
                            {
                                productPersistedState: productPersistedState,
                                productModelConfiguration: this._configureProduct(productPersistedState.productType)
                            }
                        ));
                        let addProductConfiguredEvent: OutputEvent<DynamicProductEvents.AddProduct.ProductsBootstrappedFromStateEvent> = {
                            eventType: DynamicProductEvents.AddProduct.productsBootstrappedFromState,
                            address: { modelId: this._modelId },
                            event: { bootstrappedProducts }
                        };
                        return of(addProductConfiguredEvent);
                    } else {
                        return NEVER;
                    }
                }),
                switchAll(),
            );
    }

    /**
     * _addProduct:
     * If a new product was added via the UI, we add new state handlers / event transforms for it.
     */
    @eventTransformFor(DynamicProductEvents.AddProduct.addProduct_requested)
    _addProduct(inputEventStream: InputEventStream<DynamicProductTileModel, {}>): OutputEventStream<DynamicProductEvents.AddProduct.AddProductConfiguredEvent> {
        return inputEventStream
            .pipe(
                map(({model}: InputEvent<DynamicProductTileModel, {}>) => {
                    let productType: ProductType = model.addProduct.productTypeSelectorSelectedValue;
                    let productModelConfiguration: ProductModelConfiguration = this._configureProduct(productType);
                    let addProductConfiguredEvent: OutputEvent<DynamicProductEvents.AddProduct.AddProductConfiguredEvent> = {
                        eventType: DynamicProductEvents.AddProduct.addProduct_configured,
                        // FYI: it's not necessary to set the address.
                        // If you don't, polimer will assume it's for the current model.
                        // address: { modelId: this._modelId },
                        event: {
                            // Send the config to the model for storing, we may later want to remove the handlers/eventTransforms stored on the config.
                            // Technically, we could store them in an instance level map on this class,
                            // however, to be true to 'no side effects pattern' we'll put them on the model.
                            // Both approaches would work.
                            productModelConfiguration: productModelConfiguration
                        }
                    };
                    return of(addProductConfiguredEvent);
                }),
                switchAll()
            );
    }

    /**
     * Handles removing a product from the UI.
     * Removes any handlers for it which were registered against the Router
     */
    @eventTransformFor(DynamicProductEvents.AddProduct.removeProduct_requested)
    _removeProduct(inputEventStream: InputEventStream<DynamicProductTileModel, DynamicProductEvents.AddProduct.RemoveProductEvent>): OutputEventStream<DynamicProductEvents.AddProduct.RemoveProductEvent> {
        return inputEventStream
            .pipe(
                map((inputEvent: InputEvent<DynamicProductTileModel, DynamicProductEvents.AddProduct.RemoveProductEvent>) => {
                    let entityKey = inputEvent.event.entityKey;
                    let product = inputEvent.model.products.get(entityKey);
                    this._router
                        .modelUpdater<DynamicProductTileModel>(this._modelId)
                        .removeStateHandlers(...product.productModelConfiguration.stateHandlers)
                        .removeEventTransforms(...product.productModelConfiguration.eventTransforms)
                        .updateRegistrationsWithRouter();
                    let outputEvent: OutputEvent<DynamicProductEvents.AddProduct.RemoveProductEvent> = {
                        eventType: DynamicProductEvents.AddProduct.removeProduct_removed,
                        // Omitting "address: {}" as polimer will default it to the current model
                        event: {
                            entityKey: entityKey,
                        }
                    };
                    return of(outputEvent);
                }),
                switchAll()
            );
    }

    private _configureProduct = (productType: ProductType) => {
        let entityKey = uuid.v4();
        let stateHandlers = this._getProductStateHandlers(productType);
        let eventTransforms = this._getProductEventTransforms(productType);
        // We only want our handlers to be invoked for our specific entityKey,
        // we do this by using the overloads which take an EventEnvelopePredicate.
        this._router
            .modelUpdater<DynamicProductTileModel>(this._modelId)
            .withStateHandlers(
                'products',
                // we add a registration filter which limits these handler instances to this specific entityKey
                (e: EventEnvelope<unknown, DynamicProductTileModel>) => e.context.entityKey === entityKey,
                ...stateHandlers
            )
            .withEventTransforms(
                // we add a registration filter which limits these handler instances to this specific entityKey
                (e: EventEnvelope<unknown, DynamicProductTileModel>) => e.context.entityKey === entityKey,
                ...eventTransforms
            )
            .updateRegistrationsWithRouter();
        return {
            entityKey: entityKey,
            productType: productType,
            // Send the handler configurations to the model for storing, we do this to allow for later removal.
            // Technically, we could store them in an instance level map on this class,
            // however, to be true to 'no side effects pattern' we'll put them on the model.
            // Both approaches would work.
            stateHandlers: stateHandlers,
            eventTransforms: eventTransforms
        } as ProductModelConfiguration;
    };

    private _getProductStateHandlers(productType: ProductType) {
        const handlers: object[] = [];
        // You could add common handlers here, or (assuming they are not product-specific) at the place the original model was configured (the view factory).
        switch (productType) {
            case ProductType.swap:
                handlers.push(new SwapProductStateHandler());
                break;
            case ProductType.option:
                handlers.push(new OptionProductStateHandler());
                break;
            default:
                throw new Error(`Unsupported productType type: ${productType}`);
        }
        return handlers;
    }

    private _getProductEventTransforms(productType: ProductType) {
        const eventTransforms: object[] = [];
        switch (productType) {
            case ProductType.option:
                eventTransforms.push(new OptionProductEventTransforms());
                break;
            case ProductType.swap:
            default:
                break;
        }
        return eventTransforms;
    }
}