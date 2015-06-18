/*
 * Copyright 2015 Keith Woods
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import esp from '../../';


describe('.beginWork', () => {
    var _router;

    beforeEach(() =>{
        _router = new esp.Router();
        _router.registerModel('modelId1', { });
    });

    it('should yield results when async operation complete', done => {
        var receivedEvent1, testDone = false;
        _router.getEventObservable('modelId1', 'Event1Type')
            .beginWork((model, event, ec, onResultsReceived) => {
                receivedEvent1 = event;
                // simulate async work by posting an action on the next frame
                setTimeout(() => {
                    // async work done, notify with the results and a bool indicating if this was the last result
                    onResultsReceived(receivedEvent1 + 1, true);
                },0);
            })
            .observe((model, event, ec) => {
                // finally the results of the async operation arrive
                expect(receivedEvent1).toEqual(1);
                expect(event.results).toEqual(2);
                testDone = true;
                done();
            });
        _router.publishEvent('modelId1', 'Event1Type', 1 );
        expect(testDone).toEqual(false);
    });

    it('should not post results from async operation if the stream was disposed', function() {
        var receivedEvent = false;
        var disposable = _router.getEventObservable('modelId1', 'Event1Type')
            .beginWork((model, event, ec, onResultsReceived) => {
                disposable.dispose();
                onResultsReceived(1, true);
            })
            .observe(() => {
                receivedEvent = true;
            });
        _router.publishEvent('modelId1', 'Event1Type', 1 );
        expect(receivedEvent).toEqual(false);
    });

    it('should create different underlying async operations for each source stream yield', function(done) {
        var receivedEventAt1 = [], receivedEventAt2 = [];
        _router.getEventObservable('modelId1', 'Event1Type')
            .beginWork((model, event, ec, onResultsReceived) => {
                receivedEventAt1.push(event);
                setTimeout(() => {
                    onResultsReceived({ fullName: event.name + ".bazz" }, true);
                },0);
            })
            .observe((model, event) => {
                receivedEventAt2.push(event.results);
                if(receivedEventAt2.length === 2) {
                    expect(receivedEventAt2[0].fullName).toEqual("foo.bazz");
                    expect(receivedEventAt2[1].fullName).toEqual("bar.bazz");
                    done();
                }
            });
        _router.publishEvent('modelId1', 'Event1Type', { name: "foo" } );
        _router.publishEvent('modelId1', 'Event1Type', { name: "bar" } );
    });

    it('should dispose of underlying async operations independently', function(done) {
        var receivedEvent = [];
        _router.getEventObservable('modelId1', 'Event1Type')
            .beginWork((model, event, ec, onResultsReceived) => {
                setTimeout(() => {
                    if(event.id === 2) {
                        // finish the stream for event with id 2 immediately
                        onResultsReceived({id: event.id}, true);
                        setTimeout(() => {
                            // this should never be processed as we've finish (internally that's dispose) the stream for id 2 already
                            onResultsReceived({id: event.id}, true);
                        }, 0);
                    } else {
                        // post an initial result for event with id 1
                        onResultsReceived({id: event.id}, false);
                        // then fake up 3 async results and finish (internally that's dispose) on the last result
                        for (var i = 0; i < 3; i++) {
                            setTimeout(() => {
                                onResultsReceived({id: event.id}, i === 2);
                            }, 0);
                        }
                    }
                },0);
            })
            .observe((model, event) => {
                receivedEvent.push(event.results);
                if(receivedEvent.length === 5) {
                    expect(receivedEvent[0].id).toEqual(1);
                    expect(receivedEvent[1].id).toEqual(2);
                    expect(receivedEvent[2].id).toEqual(1);
                    expect(receivedEvent[3].id).toEqual(1);
                    expect(receivedEvent[4].id).toEqual(1);
                    done();
                }
            });
        _router.publishEvent('modelId1', 'Event1Type', { id: 1 } );
        _router.publishEvent('modelId1', 'Event1Type', { id: 2 } );
    });

    // TODO there should be some unhappy path error tests here
});