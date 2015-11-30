angular.module('panelServices', [])
    .service('panelService', function(){
        this.channelSelected = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        this.colors = [
            "#4c82a5",
            "#FF00E8",
            "#a5794c",
            "#FF0000",
            "#9932CC",
            "#7FFF00",
            "#708090",
            "#f041c4",
            "#0000FF",
            "#2d7757",
            "#cbaf4b",
            "#81253f",
            "#29d8bb",
            "#d83474"
        ];
        this.finalFilters = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        this.finalFiltersName = ["","","","","","","","","","","","","","",""];
        this.textBox1 = ["","","","","","","","","","","","","","",""];
        this.textBox2 = ["","","","","","","","","","","","","","",""];
        this.portDefined = 0;
        this.adjustGraph = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        this.adjustGraphPrev = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        this.adjustGraphFlag = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        return this;
    });