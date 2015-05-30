"use strict";

class EventStage {
    static get preview() { return  'preview'; }
    static get normal() { return  'normal'; }
    static get committed() { return  'committed'; }
}

export default EventStage;
