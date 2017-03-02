import * as _ from 'lodash';

// HACK bring in all the dtos so we can ensure they exist on the global proto object 
import {Message} from 'google-protobuf';
import {AnyDto } from './lib/dtos/service-common-contracts_pb';
import { Logger } from '../core';

declare var proto:any; // the proto library exports types to a global var named proto

const _log:Logger = Logger.create('AnyDtoMapper');

/**
 AnyDtoMapper: maps to and from AnyDto. Also used to add proto metadata to globally exposed proto messages.

 Remarks:

 Why do we need AnyDto?

 Protobuf doesn't support polymorphism very well.
 For example if you try to serialise this class it doesn't know how to handle the different types of payloads.
  class {
     payload:object; // could be anything
  }

 In our app all messages that go over the wire get wrapped in an EnvelopeDto.
 That DTO needs to wrap differing objects in the same mannor as above.
 Given this we use a proto called AnyDto.
 The concept is simple: pack a proto message along with it's package name and unpack it at the other end.
 To do this we need both the protos package name (which we store on __proto_package_namespace) and a bases 64 encoded version of the proto.
 AnyDto is effectively using the same pattern as proto3's built in Any type, however it allows for use to unwrap in a better way as we additionally encode the __proto_package_namespace;

 The downside to this approach (and the building Any type in proto3) is:
 1) message contents are hidden from layers they pass through thus hindering debugging
 2) the JS protobuf library doesn't expose the proto package name for consumption in a dynamic manor, we have to hack to get them
 3) we have to have custom code on both ends of the wire and pack and unpack our AnyDto

 All in all this is really the only downside to using protobufs, there are many upsides including massive simplification of the server messaging code.
* */
export default class AnyDtoMapper {

    static addMetaDataToProtoContracts() {
        AnyDtoMapper._addMetaDataToProtoContracts(proto);
    }
    
    // The JS protobuf generated code doesn't have the proto package name in
    // an accessible place. I asked a question on how to reliably get it on the groups https://groups.google.com/forum/#!topic/protobuf/rUCnhlFAlbY
    // Until there is a better way this HACK adds the namespace to each proto message.
    static _addMetaDataToProtoContracts(container:any, namespaceString:string=null) {
        _.forOwn(container, (item:any, name:string) => {
            let itemsNamespace = namespaceString ? `${namespaceString}.${name}` : name;
            if(_.isFunction(item)) {
                _log.debug(`adding canonicalname for DTO ${itemsNamespace}`);
                item.__proto_package_namespace = itemsNamespace;
            }
            if(!_.isFunction(item)) {
                AnyDtoMapper._addMetaDataToProtoContracts(item, itemsNamespace);
            }
        });
    }

    static mapToAnyDto(messageDto:Message) : any {
        let anyDto = new AnyDto();
        let protoPackageNamespace = (<any>messageDto.constructor).__proto_package_namespace;
        anyDto.setCanonicalName(protoPackageNamespace); // we have to hard code this for now
        anyDto.setValue(messageDto.serializeBinary());
        // this isn't great, however it's currently the best place to log the contents 
        // of a message before it gets scrambled to a base 64 string (i.e. serializeBinary() return a b64 string).
        _log.debug(`serialised messageDto of type [${protoPackageNamespace}] to a AnyDto.`, messageDto.toObject());
        return anyDto;
    }
    
    static mapFromAnyDto(anyDto:AnyDto) : Message {
        // here we need to get a reference to the proto message so we can but if we don't know it we can get it using the getCanonicalname and
        // getting it off the global proto object which contracts_pb exports
        let dtoNamespaceParts = anyDto.getCanonicalName().split('.');
        let current = proto;
        for (let i = 0; i < dtoNamespaceParts.length; i++) {
            current = current[dtoNamespaceParts[i]];
        }
        return current.deserializeBinary(anyDto.getValue());
    }
}
