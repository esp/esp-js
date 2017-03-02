import * as Rx from 'rx';
import Logger from '../../../src/core/logger';
import { AnyDtoMapper, ConnectionStatus, Connection, ServiceInstanceDetails, WellKnownDestinations } from '../../../src/messaging';
import StubRabbitMqConnectionProxy from './stubRabbitMqConnectionProxy';
import * as dtos from "../../../src/messaging/lib/dtos/service-common-contracts_pb";
import * as testDtos from "./testProtos/test-message_pb";
import { Message } from 'google-protobuf';

var _testLogger = Logger.create('Connection Tests');

describe('Connection: ', () => {

    let _rabbitMq:StubRabbitMqConnectionProxy,
        _connection:Connection,
        _receivedStatusUpdates:Array<ConnectionStatus>,
        _scheduler:Rx.HistoricalScheduler,
        _stream,
        _streamDisposable,
        _waitForConnection,
        _request:testDtos.LoginRequestDto,
        _responses,
        _errors,
        _onCompletedCount,
        _sessionId,
        _operationsRequireAuth;

    beforeEach(() => {
        _scheduler = new Rx.HistoricalScheduler(0, null);
        var stubSchedulerService = {
            async: _scheduler,
            immediate: null
        };
        _rabbitMq = new StubRabbitMqConnectionProxy();
        _connection = new Connection(stubSchedulerService, () => _rabbitMq);
        _connection.initialise();
        _receivedStatusUpdates = [];
        _connection.connectionStatusStream.subscribe(connectionStatus => {
            _receivedStatusUpdates.push(connectionStatus);
        });
        _waitForConnection = true;
        _responses = [];
        _errors = [];
        _onCompletedCount = 0;
        _request = new testDtos.LoginRequestDto();
        _request.setUsername('keith');
        _sessionId = 'theSessionId';
        _operationsRequireAuth = false;

        AnyDtoMapper.addMetaDataToProtoContracts();
    });

    describe('.connect() ', () => {

        it('subscribes to rabbit open on connect()', () => {
            _connection.connect();
            expect(_rabbitMq.onConnectCallbacks.length).toEqual(1);
        });

        it('subscribes to rabbit onError on connect()', () => {
            _connection.connect();
            expect(_rabbitMq.onErrorCallbacks.length).toEqual(1);
        });

        it('only opens underlying once when you call .connect()', () => {
            _connection.connect();
            _connection.connect();
            _connection.connect();
            expect(_rabbitMq.onConnectCallbacks.length).toEqual(1);
        });

        it('re-opens connection after disconnectd then connect call', () => {
            connect();
            expect(_connection.isConnected).toEqual(true);
            _connection.disconnect();
            expect(_connection.isConnected).toEqual(false);
            _connection.connect();
            _rabbitMq.setIsConnected(true);
            expect(_connection.isConnected).toEqual(true);
            expect(_receivedStatusUpdates).toEqual([
                ConnectionStatus.idle,
                ConnectionStatus.connected,
                ConnectionStatus.idle,
                ConnectionStatus.connected
            ]);
        });
    });

    describe('.connectionStatus ', () => {

        it('pumps connection status of idle on initial connect before open', () => {
            expect(_receivedStatusUpdates.length).toEqual(1);
            expect(_receivedStatusUpdates).toEqual([ConnectionStatus.idle]);
        });

        it('pumps connection status of connected when connection comes up', () => {
            connect();
            expect(_receivedStatusUpdates.length).toEqual(2);
            expect(_receivedStatusUpdates).toEqual([
                ConnectionStatus.idle,
                ConnectionStatus.connected
            ]);
        });

        it('pumps connection status of disconnected when connection goes down', () => {
            connect();
            _rabbitMq.setIsConnected(false);
            expect(_receivedStatusUpdates.length).toEqual(3);
            expect(_receivedStatusUpdates).toEqual([
                ConnectionStatus.idle,
                ConnectionStatus.connected,
                ConnectionStatus.disconnected
            ]);
        });
    });

    describe('sticky services ', () => {

        let _receivedServiceStatusUpdates = [],
            _service1Disposable;

        beforeEach(() => {
            _receivedServiceStatusUpdates = [];
            _service1Disposable = _connection
                .serviceStatusStream('fxService')
                .subscribe(status => _receivedServiceStatusUpdates.push(status));
        });

        it('service status yields disconnected before connection connected', () => {
            expect(_receivedServiceStatusUpdates.length).toEqual(1);
            expect(_receivedServiceStatusUpdates[0]).toEqual(ConnectionStatus.disconnected);
        });

        it('service status becomes connected when service heartbeat received', () => {
            connect();
            sendServiceStatusUpdate();
            expect(_receivedServiceStatusUpdates).toEqual([
                ConnectionStatus.disconnected,
                ConnectionStatus.connected
            ]);
        });

        // this on is pretty much an integration test
        it('service requests go to same service instance then fail over when it goes offline ', () => {
            connectServices();
            setSessionId();
            sendRequestStreamRequest();

            // precondition, check the request goes to fxService1
            let responseDestination = getResponseDestination('fxService', 'Pricing', 'fxService1');
            var subscription = _rabbitMq.subscribes[responseDestination];
            expect(subscription).toBeDefined();
            expect(subscription.destination).toEqual(responseDestination);
            delete _rabbitMq.subscribes[responseDestination];

            // pump another service instance
            sendServiceStatusUpdate('fxService', 'fxService2');
            // and now another request
            sendRequestStreamRequest();

            // make sure we're still going to the fxService1
            subscription = _rabbitMq.subscribes[responseDestination];
            expect(subscription).toBeDefined();

            // now disconnect fxService1
            // move half way between the timeout period
            _scheduler.advanceBy(ServiceInstanceDetails.SERVICE_HEARTBEAT_TIMEOUT_MS / 2);
            // resend an update for fxService1 which will keep it alive
            sendServiceStatusUpdate('fxService', 'fxService2');
            // move the rest of the way, timing out 'sessionService1'
            _scheduler.advanceBy(ServiceInstanceDetails.SERVICE_HEARTBEAT_TIMEOUT_MS / 2);

            // service should have timed out
            expect(_receivedServiceStatusUpdates).toEqual([
                ConnectionStatus.disconnected,
                ConnectionStatus.connected,
                ConnectionStatus.disconnected
            ]);

            // our 2 previous request should have errored
            expect(_errors.length).toEqual(2);

            // now send a new request, it should goto 'fxService2'
            sendRequestStreamRequest();

            responseDestination = getResponseDestination('fxService', 'Pricing', 'fxService2');
            subscription = _rabbitMq.subscribes[responseDestination];
            expect(subscription).toBeDefined();
            expect(subscription.destination).toEqual(responseDestination);

        });
    });

    describe('rpc : ', () => {

        it('sends request message on transport with correct configuration', () => {
            connectServices();
            sendRpcRequest();
            expect(_rabbitMq.sentMessages.length).toEqual(1);
            let sentArguments = _rabbitMq.sentMessages[0];
            expect(sentArguments.destination).toBeDefined();
            expect(sentArguments.headers).toBeDefined();
            expect(sentArguments.headers['reply-to']).toBeDefined();
            expect(sentArguments.dto).toBeDefined();
            let loginRequestDto = unwrapPayload<testDtos.LoginRequestDto>(sentArguments.dto);
            expect(loginRequestDto.getUsername()).toEqual('keith');
        });

        it('pumps results to observer', () => {
            connectServices();
            sendRpcRequest();
            sendRpcResponse(
                createTestResponsePayload('someData'),
                null,
                true
            );
            expect(_responses.length).toEqual(1);
        });

        it('pumps errors to observer', () => {
            connectServices();
            sendRpcRequest();
            sendRpcResponse(
                null,
                'BOOM',
                true
            );
            expect(_errors.length).toEqual(1);
            expect(_errors[0]).toEqual(new Error('BOOM'));
        });

        it('completes the observer when server denotes completion', () => {
            connectServices();
            sendRpcRequest();
            sendRpcResponse(
                createTestResponsePayload('someData'),
                null,
                false
            );
            sendRpcResponse(
                createTestResponsePayload('someData'),
                null,
                true
            );
            expect(_responses.length).toEqual(2);
            expect(_onCompletedCount).toEqual(1);
        });

        describe('when disconnected', () => {

            it('does not send request for previously errored request observer when disconnected', () => {
                _waitForConnection = false;
                connect();
                sendRpcRequest();
                disconnected();
                connect();
                sendServiceStatusUpdate();
                expect(_rabbitMq.sentMessages.length).toEqual(0);
            });

            it('errors an rpc observer waiting for response when underlying connection goes down', () => {
                _waitForConnection = true;
                connect();
                sendServiceStatusUpdate();
                sendRpcRequest();
                disconnected();
                expect(_errors[0]).toEqual(new Error('Connection disconnect'));
            });

            it('errors an rpc observer waiting for response when requests services goes down', () => {
                connect();
                sendServiceStatusUpdate();
                sendRpcRequest();
                statusHeartbeatElapsed()
                expect(_errors[0]).toEqual(new Error('Service disconnect'));
            });

            it('errors an rpc when waitForConnection is false and the connection is down', () => {
                _waitForConnection = false;
                sendRpcRequest();
                expect(_errors[0]).toEqual(new Error('Connection disconnect'));
            });

            it('errors an rpc when waitForConnection is false and the service connection is down', () => {
                _waitForConnection = false;
                connect();
                sendRpcRequest();
                expect(_errors[0]).toEqual(new Error('Connected but service isn\'t and not waiting'));
            });

            it('waits for connection when waitForConnection is true and underlying connection goes up and down', () => {
                _waitForConnection = true;
                connect();
                sendRpcRequest();
                disconnected();
                expect(_errors.length).toEqual(0);
            });
        });
    });

    describe('request->stream : ', () => {

        it('sends request message on transport with correct configuration', () => {
            connectServices();
            setSessionId();
            sendRequestStreamRequest();
            expect(_rabbitMq.sentMessages.length).toEqual(1);
            let sentArguments = _rabbitMq.sentMessages[0];
            expect(sentArguments.destination).toBeDefined();
            expect(sentArguments.headers).toBeUndefined();
            expect(sentArguments.dto).toBeDefined();
            let loginRequestDto = unwrapPayload<testDtos.LoginRequestDto>(sentArguments.dto);
            expect(loginRequestDto.getUsername()).toEqual('keith');
            expect(sentArguments.dto.getSessionId()).toEqual(_sessionId);
            let responseDestination = getResponseDestination('fxService', 'Pricing', 'fxService1');
            var subscription = _rabbitMq.subscribes[responseDestination];
            expect(subscription).toBeDefined();
            expect(subscription.destination).toEqual(responseDestination);
        });

        it('pumps results to observer', () => {
            connectServices();
            setSessionId();
            sendRequestStreamRequest();
            sendRequestStreamResponse(
                createTestResponsePayload('someData'),
                null,
                true
            );
            expect(_responses.length).toEqual(1);
        });

        it('pumps errors to observer', () => {
            connectServices();
            setSessionId();
            sendRequestStreamRequest();
            sendRequestStreamResponse(
                null,
                'BOOM',
                true
            );
            expect(_errors.length).toEqual(1);
            expect(_errors[0]).toEqual(new Error('BOOM'));
        });

        it('completes the observer when server denotes completion', () => {
            connectServices();
            setSessionId();
            sendRequestStreamRequest();
            sendRequestStreamResponse(
                createTestResponsePayload('someData'),
                null,
                false
            );
            sendRequestStreamResponse(
                createTestResponsePayload('someData'),
                null,
                true
            );
            expect(_responses.length).toEqual(2);
            expect(_onCompletedCount).toEqual(1);
        });

        describe('when disconnected', () => {

            it('does not send request for previously errored request observer', () => {
                _waitForConnection = false;
                connect();
                sendRequestStreamRequest();
                disconnected();
                connect();
                sendServiceStatusUpdate();
                expect(_rabbitMq.sentMessages.length).toEqual(0);
            });

            it('errors an observer waiting for response when underlying connection goes down', () => {
                _waitForConnection = true;
                connect();
                setSessionId();
                sendServiceStatusUpdate();
                sendRequestStreamRequest();
                disconnected();
                expect(_errors[0]).toEqual(new Error('Connection disconnect'));
            });

            it('errors an observer waiting for response when requests services goes down', () => {
                connect();
                setSessionId();
                sendServiceStatusUpdate();
                sendRequestStreamRequest();
                statusHeartbeatElapsed();
                expect(_errors[0]).toEqual(new Error('Service disconnect'));
            });

            it('errors when waitForConnection is false and the connection is down', () => {
                _waitForConnection = false;
                sendRequestStreamRequest();
                expect(_errors[0]).toEqual(new Error('Connection disconnect'));
            });

            it('errors when waitForConnection is false and the service connection is down', () => {
                _waitForConnection = false;
                connect();
                sendRequestStreamRequest();
                expect(_errors[0]).toEqual(new Error('Connected but service isn\'t and not waiting'));
            });

            it('waits for connection when waitForConnection is true and underlying connection goes up and down', () => {
                _waitForConnection = true;
                connect();
                sendRequestStreamRequest();
                disconnected();
                expect(_errors.length).toEqual(0);
            });

            it('waits for connection when waitForConnection is true and underlying service has gone offline', () => {
                _waitForConnection = true;
                connect();
                setSessionId();
                sendServiceStatusUpdate();
                statusHeartbeatElapsed()
                sendRequestStreamRequest();
                // there will be config for the service that has gone offline, it should not be used
                expect(_rabbitMq.sentMessages.length).toEqual(0);
                sendServiceStatusUpdate();
                expect(_rabbitMq.sentMessages.length).toEqual(1);
            });
        });

        describe('when requests disposed : ', () => {

            beforeEach(() => {
                connect();
                sendServiceStatusUpdate();
                setSessionId();
            });

            describe('request -> stream', () => {
                it('on dispose unsubscribes from underlying connection', () => {
                    sendRequestStreamRequest();
                    sendRequestStreamResponse(
                        createTestResponsePayload('someData'),
                        null,
                        false
                    );
                    expect(_responses.length).toEqual(1);
                    let responseDestination = getResponseDestination('fxService', 'Pricing', 'fxService1');
                    var subscription = _rabbitMq.subscribes[responseDestination];
                    expect(subscription).toBeDefined();
                    expect(subscription.unsubscribeCallCount).toEqual(0);
                    _streamDisposable.dispose();
                    expect(subscription.unsubscribeCallCount).toEqual(1);
                });

                it('on dispose sends termination message', () => {
                    sendRequestStreamRequest();
                    expect(_rabbitMq.sentMessages.length).toEqual(1);
                    _streamDisposable.dispose();
                    expect(_rabbitMq.sentMessages.length).toEqual(2);

                    let sentArguments = _rabbitMq.sentMessages[1];
                    expect(sentArguments.destination).toBeDefined();
                    expect(sentArguments.headers).toEqual(null);
                    expect(sentArguments.dto.getOperationName()).toEqual('Pricing');
                    expect(sentArguments.dto.getHasCompleted()).toEqual(true);
                    expect(sentArguments.dto.getPayload()).not.toBeDefined();
                    expect(sentArguments.dto.getSessionId()).toEqual(_sessionId);
                });
            });

            describe('rpc', () => {
                it('on dispose sends termination message', () => {

                });
            });

            describe('stream', () => {
                it('on dispose does not send termination message', () => {

                });
            });
        });
    });

    describe('stream : ', () => {

        it('subscribes to correct destination but does not send request', () => {
            connectServices();
            setSessionId();
            sendStreamRequest();
            expect(_rabbitMq.sentMessages.length).toEqual(0);

            let responseDestination = getResponseDestination('fxService', 'Blotter', 'fxService1');
            var subscription = _rabbitMq.subscribes[responseDestination];
            expect(subscription).toBeDefined();
            expect(subscription.destination).toEqual(responseDestination);
        });

        describe('when disconnected :', () => {


        });
    });

    describe('authenticated scenarios :', () => {

        beforeEach(() => {
            _operationsRequireAuth = true;
            connect();
            sendServiceStatusUpdate();
            setSessionId();
        });

        describe('request -> stream', () => {
            it('waits for authentication when waitForConnection is true and model isn\t authenticated', () => {
                _waitForConnection = true;
                sendRequestStreamRequest();
                expect(_errors.length).toEqual(0);
                expect(_rabbitMq.sentMessages.length).toEqual(0);
                expect(_errors.length).toEqual(0);
                setAuthenticated(true);
            });
        });
    });

    function connect() {
        _connection.connect();
        _rabbitMq.setIsConnected(true);
    }

    function disconnected() {
        _rabbitMq.setIsConnected(false);
    }

    function statusHeartbeatElapsed() {
        var serviceheartbeatimeoutms = ServiceInstanceDetails.SERVICE_HEARTBEAT_TIMEOUT_MS;
        _testLogger.debug(`statusHeartbeatElapsed, moving time by ${serviceheartbeatimeoutms}ms. Schedule now is ${_scheduler.now()}`);
        _scheduler.advanceBy(serviceheartbeatimeoutms);
        _testLogger.debug(`Schedule now is ${_scheduler.now()}`);
    }

    function connectServices() {
        connect();
        sendServiceStatusUpdate();
    }

    function setSessionId() {
        _connection.setSessionId(_sessionId);
    }

    function sendServiceStatusUpdate(serviceType = 'fxService', serviceId = 'fxService1', ...operationConfigDtos:dtos.OperationConfigDto[]) {
        
        let rpcOperationConfigDto  = new dtos.OperationConfigDto();
        rpcOperationConfigDto.setOperationType(dtos.OperationTypeDto.RPC);
        rpcOperationConfigDto.setRequestExchangeName(`request.exchange`);
        rpcOperationConfigDto.setRequestRoutingKey(`${serviceType}.Login-request.${serviceId}`);
        rpcOperationConfigDto.setServiceId(`${serviceId}`);
        rpcOperationConfigDto.setServiceType(`${serviceType}`);
        rpcOperationConfigDto.setOperationName(`Login`);
        rpcOperationConfigDto.setRequiresAuthentication(_operationsRequireAuth);
        rpcOperationConfigDto.setIsAvailable(true);
        
        let requestStreamOperationConfigDto = new dtos.OperationConfigDto();
        requestStreamOperationConfigDto.setOperationType(dtos.OperationTypeDto.REQUEST_STREAM);
        requestStreamOperationConfigDto.setRequestExchangeName(`request.exchange`);
        requestStreamOperationConfigDto.setRequestRoutingKey(`${serviceType}.Pricing-request.${serviceId}`);
        requestStreamOperationConfigDto.setResponseExchangeName(`response.exchange`);
        requestStreamOperationConfigDto.setResponseRoutingKey(`${serviceType}.Pricing-response.${serviceId}`);
        requestStreamOperationConfigDto.setServiceId(`${serviceId}`);
        requestStreamOperationConfigDto.setServiceType(`${serviceType}`);
        requestStreamOperationConfigDto.setOperationName(`Pricing`);
        requestStreamOperationConfigDto.setRequiresAuthentication(_operationsRequireAuth);
        requestStreamOperationConfigDto.setIsAvailable(true);

        let streamOperationConfigDto = new dtos.OperationConfigDto();
        streamOperationConfigDto.setOperationType(dtos.OperationTypeDto.STREAM);
        streamOperationConfigDto.setResponseExchangeName(`response.exchange`);
        streamOperationConfigDto.setResponseRoutingKey(`${serviceType}.Blotter-response.${serviceId}`);
        streamOperationConfigDto.setServiceId(`${serviceId}`);
        streamOperationConfigDto.setServiceType(`${serviceType}`);
        streamOperationConfigDto.setOperationName(`Blotter`);
        streamOperationConfigDto.setRequiresAuthentication(_operationsRequireAuth);
        streamOperationConfigDto.setIsAvailable(true);
        
        let statusUpdateDto = new dtos.MessageEnvelopeDto(); 
        statusUpdateDto.setHasCompleted(null);
        statusUpdateDto.setError(null);
        statusUpdateDto.setTimestamp(mapSecondsToTimeStampDto(1452674705019));
        statusUpdateDto.setOperationName('heartbeat');
        let heartbeatDto = new dtos.HeartbeatDto();
        heartbeatDto.setServiceLoad(0);
        heartbeatDto.setOperationConfigDtosList(operationConfigDtos.length > 0
            ? operationConfigDtos
            : [rpcOperationConfigDto, requestStreamOperationConfigDto, streamOperationConfigDto]),
        heartbeatDto.setTimestamp(mapSecondsToTimeStampDto(1452674705018));
        heartbeatDto.setServiceId(serviceId);
        heartbeatDto.setServiceType(serviceType);
        statusUpdateDto.setPayload(AnyDtoMapper.mapToAnyDto(heartbeatDto));

        var subscription = _rabbitMq.subscribes[WellKnownDestinations.heartbeat];
        subscription.onResults(statusUpdateDto);
    }

    function mapSecondsToTimeStampDto(secondsSinceEpoch:number) : dtos.TimestampDto {
        let timestampDto = new dtos.TimestampDto();
        timestampDto.setSeconds(secondsSinceEpoch);
        return timestampDto;
    }

    function setRequestStreamStream(request : Message, serviceType = 'fxService', operationName = 'Pricing') {
        _stream = _connection.requestStream(
            serviceType,
            operationName,
            request,
            _waitForConnection
        );
    }

    function setRpcStream(request : Message, serviceType = 'fxService', operationName = 'Login') {
        _stream = _connection.requestStream(
            serviceType,
            operationName,
            request,
            _waitForConnection
        );
    }

    function setStream(serviceType = 'fxService', operationName = 'Blotter') {
        _stream = _connection.stream(
            serviceType,
            operationName,
            _waitForConnection
        );
    }

    function subscribeToRpcStream() {
        _streamDisposable = _stream.subscribe(
            response => {
                _responses.push(response);
            },
            err => {
                _errors.push(err);
            },
            () => {
                _onCompletedCount++;
            }
        );
    }

    function subscribeToRequestStreamStream() {
        _streamDisposable = _stream.subscribe(
            response => {
                _responses.push(response);
            },
            err => {
                _errors.push(err);
            },
            () => {
                _onCompletedCount++;
            }
        );
    }

    function subscribeToStreamStream() {
        _streamDisposable = _stream.subscribe(
            response => {
                _responses.push(response);
            },
            err => {
                _errors.push(err);
            },
            () => {
                _onCompletedCount++;
            }
        );
    }

    function sendRpcRequest() {
        setRpcStream(_request);
        subscribeToRpcStream();
    }

    function sendRequestStreamRequest() {
        setRequestStreamStream(_request);
        subscribeToRequestStreamStream();
    }

    function sendStreamRequest() {
        setStream();
        subscribeToStreamStream();
    }

    function sendRpcResponse(payload:dtos.AnyDto, error, hasCompleted) {
        let sentArguments = _rabbitMq.sentMessages[0];
        let messageEnvelopeDto = new dtos.MessageEnvelopeDto();
        messageEnvelopeDto.setOperationName(sentArguments.dto.getOperationName());
        messageEnvelopeDto.setCorrelationId(sentArguments.dto.getCorrelationId());
        var timestampDto = new dtos.TimestampDto();
        timestampDto.setSeconds(1452692191244);
        messageEnvelopeDto.setTimestamp(timestampDto);
        messageEnvelopeDto.setPayload(payload);
        messageEnvelopeDto.setHasCompleted(hasCompleted);
        messageEnvelopeDto.setError(error);
        _rabbitMq.onReceiveCallbacks[0](messageEnvelopeDto);
    }

    function sendRequestStreamResponse(payload:dtos.AnyDto, error, hasCompleted) {
        let sentArguments = _rabbitMq.sentMessages[0];
        let responseDestination = getResponseDestination('fxService', 'Pricing', 'fxService1');
        let subscription = _rabbitMq.subscribes[responseDestination];
        let messageEnvelopeDto = new dtos.MessageEnvelopeDto();
        messageEnvelopeDto.setOperationName(sentArguments.dto.getOperationName());
        messageEnvelopeDto.setCorrelationId(sentArguments.dto.getCorrelationId());
        var timestampDto = new dtos.TimestampDto();
        timestampDto.setSeconds(1452692191244);
        messageEnvelopeDto.setTimestamp(timestampDto);
        messageEnvelopeDto.setPayload(payload);
        messageEnvelopeDto.setHasCompleted(hasCompleted);
        messageEnvelopeDto.setError(error);
        subscription.onResults(messageEnvelopeDto);
    }

    function setAuthenticated(isAuthenticated) {
        _connection.setIsAuthenticated(isAuthenticated);
    }

    function getResponseDestination(serviceType:String, operationName:String, serviceId:String) {
        return `/exchange/response.exchange/${serviceType}.${operationName}-response.${serviceId}.${_sessionId}`;
    }

    function unwrapPayload<T extends Message>(messageEnvelopeDto:dtos.MessageEnvelopeDto) {
        return <T>AnyDtoMapper.mapFromAnyDto(messageEnvelopeDto.getPayload());
    }

    function createTestResponsePayload(responseData:string) : dtos.AnyDto {
        let dto = new testDtos.SomeResponseDto();
        dto.setResponseData(responseData);
        return AnyDtoMapper.mapToAnyDto(dto);
    }
});
