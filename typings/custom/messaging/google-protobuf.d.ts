// note there is a webpack alias that points this import to the right file on disk

declare namespace __protobuf {
    export class Message {
        static bytesAsB64(binaryPayload:number[]) : string;
        static deserializeBinary(b64String:any) : Message;
        serializeBinary() : Uint8Array;
        toObject() : any;
        static __proto_package_namespace:string;
    }   
}

declare module "google-protobuf" {
    export = __protobuf;
}
