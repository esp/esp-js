import * as dtos from '../lib/dtos/service-common-contracts_pb';

export interface IRabbitMqConnectionProxy {
    connect():void;
    proxyId:string;
    isConnected:boolean;
    disconnect(callback:() => void):void;
    onConnect(callback:() => void):void;
    onReceive(callback:(message:dtos.MessageEnvelopeDto) => void);
    onError(callback:(errorMessage:string) => void);
    send(destination:string, headers:any, dto:dtos.MessageEnvelopeDto);
    subscribe(destination:string,
              onMessageCallback:(message:dtos.MessageEnvelopeDto) => void,
              description:string,
              headers?:Array<any>):any; //{ id:string, unsubscribe:() => void };
    dispose():void;
}
