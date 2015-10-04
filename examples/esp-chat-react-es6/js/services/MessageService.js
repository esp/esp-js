/*global localStorage*/
import chatExampleData from './chatExampleData';

// !!! Please Note !!!
// We are using localStorage as an example, but in a real-world scenario, this
// would involve XMLHttpRequest, or perhaps a newer client-server protocol.
// The function signatures below might be similar to what you would build, but
// the contents of the functions are just trying to simulate client-server
// communication and server-side processing.

// poor mans rx api: don't want to pull in rx just to get a nice PUSH API,
// we'll just model the same observable API here for demo purposes.
export default class MessageService {
    constructor() {
        this._observers = [];
        // load some fake data into localstorage
        chatExampleData.populateLocalStorage();
    }
    getMessagesStream() {
        var messageService = this;
        return {
            subscribe(observer) {
                messageService._observers.push(observer)
                // simulate retrieving data from a database
                var rawMessages = JSON.parse(localStorage.getItem("messages"));
                // simulate success callback
                setTimeout(function () {
                    observer({rawMessages: rawMessages, isStateOfTheWorld:true});
                }, 0);
            }
        }
    }
    sendMessage(text, threadId, threadName) {
        var messageService = this;
        return {
            subscribe(observer) {
                // simulate writing to a database
                var rawMessages = JSON.parse(localStorage.getItem("messages"));
                var rawMessage = {
                    id: uuid.v4(),
                    threadId: threadId,
                    threadName: threadName,
                    authorName: "Bill", // hard coded for the example
                    text: text,
                    timestamp: Date.now()
                };
                rawMessages.push(rawMessage);
                localStorage.setItem("messages", JSON.stringify(rawMessages));
                // simulate success callback
                setTimeout(function () {
                    // simulate an ack to the caller
                    observer({success:true});
                    // simulate some results from the server
                    for (var i = 0, len = messageService._observers.length; i < len; i++) {
                        var observer1 = messageService._observers[i];
                        observer1({ rawMessages: [ rawMessage ], isStateOfTheWorld:false });
                    }
                }, 0);
            }
        }
    }
}