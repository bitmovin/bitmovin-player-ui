import {UIManager} from "./uimanager";

declare var window: any;
declare var bitmovin: any;
var player = window.bitmovin.player('player');

var conf = {
    key: 'YOUR KEY HERE',
    source: {
        dash: 'http://bitdash-a.akamaihd.net/content/sintel/sintel.mpd'

        // dash: 'https://bitmovin-a.akamaihd.net/content/playhouse-vr/mpds/105560.mpd',
        // vr: {
        //     contentType: 'single'
        // }
    },
    style: {
        ux: false
    }
};

player.setup(conf).then(function() {
    // Add UI to loaded player
    UIManager.Factory.buildDefaultUI(player);
}, function() {
    // Error
});
