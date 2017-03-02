 export declare class MessageEnvelopeDto extends __protobuf.Message {
    constructor();

    getOperationName():string;
    setOperationName(value:string):void;

    getTimestamp():TimestampDto;
    setTimestamp(value:TimestampDto):void;

    getPayload():AnyDto;
    setPayload(value:AnyDto):void;

    getHasCompleted():boolean;
    setHasCompleted(value:boolean):void;

    getError():string;
    setError(value:string):void;

    getCorrelationId():string;
    setCorrelationId(value:string):void;

    getSessionId():string;
    setSessionId(value:string):void;

    getSenderId():string;
    setSenderId(value:string):void;
}

 export declare enum OperationTypeDto {
    RPC = 0,
    REQUEST_STREAM = 1,
    STREAM = 2
}

 export declare class OperationConfigDto extends __protobuf.Message {
    getServiceType():string;
    setServiceType(value:string) : void;

    getOperationName():string;
    setOperationName(value:string) : void;

    getServiceId():string;
    setServiceId(value:string) : void;

    getRequiresAuthentication():boolean;
    setRequiresAuthentication(value:boolean) : void;

    getRequestExchangeName():string;
    setRequestExchangeName(value:string) : void;

    getRequestRoutingKey():string;
    setRequestRoutingKey(value:string) : void;

    getResponseExchangeName():string;
    setResponseExchangeName(value:string) : void;

    getResponseRoutingKey():string;
    setResponseRoutingKey(value:string) : void;

    getOperationType():OperationTypeDto;
    setOperationType(value:OperationTypeDto) : void;

    getIsAvailable():boolean;
    setIsAvailable(value:boolean) : void;
}

 export declare class HeartbeatDto extends __protobuf.Message {
    getServiceId():string;
    setServiceId(value:string):void;

    getServiceType():string;
    setServiceType(value:string):void;

    getOperationConfigDtosList():OperationConfigDto[];
    setOperationConfigDtosList(value:OperationConfigDto[]):void;

    getTimestamp():TimestampDto;
    setTimestamp(value:TimestampDto):void;

    getServiceLoad():number;
    setServiceLoad(value:number):void;
}

 export declare class AnyDto extends __protobuf.Message {
    constructor();

    getCanonicalName():string;
    setCanonicalName(value:string):void;

    getValue():Uint8Array;
    setValue(value:Uint8Array):void;
}

 export declare class TimestampDto extends __protobuf.Message {
    constructor();

    getSeconds():number;
    setSeconds(value:number):void;

    getNanos():number;
    setNanos(value:number):void;
}

 export declare class DecimalDto extends __protobuf.Message {
    constructor();

    getUnscaledValue():number;
    setUnscaledValue(value:number):void;

    getScale():number;
    setScale(value:number):void;
}