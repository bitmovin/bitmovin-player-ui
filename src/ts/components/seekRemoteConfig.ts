import { Component, ComponentConfig } from './component';
import {SeekBar} from './seekbar';

export interface TieredSeekingConfig {
    /**
     * Number of milliseconds between Tier jumps
     */
    millisBetweenTiers: number;

    /**
     * Range of number of seconds to use for seeking
     */
    seekDistances: number[];
}

export interface SeekRemoteConfiguration extends ComponentConfig {
    /**
     * Button/Key used for seeking backwards. Defaults to ArrowLeft
     */
    backButton: string;

    /**
     * Button/Key used for seeking forward. Defaults to ArrowRight
     */
    forwardButton: string;

    /**
     * How far seek events go to. Can be number of seconds OR tiered approach
     */
    seekDistance?: number | TieredSeekingConfig;

    /**
     * prevents keydown events from firing too rapidly
     */
    millisecondsBetweenHoldEvents?: number;

    /**
     * Can be used to prevent automatically seeking and instead require a provided key to be pressed to finish the seek
     */
    restrictSeekToKey?: string | undefined;

}

export class TieredSeek {
    private tiers: TieredSeekingConfig;
    private ranges: {startTime: number, endTime: number, distance: number}[] = [];

    constructor(tiers: TieredSeekingConfig) {
        this.tiers = tiers;
        for (let i = 0; i < tiers.seekDistances.length; i++) {
            let seekDistance = tiers.seekDistances[i];
            if (i === 0) {
                this.ranges.push({startTime: 0, endTime: (this.tiers.millisBetweenTiers * (i + 1)), distance: seekDistance});
            } else if (i === tiers.seekDistances.length - 1) {
                this.ranges.push({startTime: this.tiers.millisBetweenTiers * (i), endTime: Number.MAX_SAFE_INTEGER, distance: seekDistance});
            } else {
                this.ranges.push({startTime: this.tiers.millisBetweenTiers * (i), endTime: (this.tiers.millisBetweenTiers * (i + 1)), distance: seekDistance});
            }
        }
    }

    public getSeekDistanceForHoldTime(holdTime: number): number {
        // let closest = this.ranges[this.ranges.length - 1];
        let closest: {startTime: number, endTime: number, distance: number};

        for (let range of this.ranges) {
            if (holdTime >= range.startTime && holdTime < range.endTime) {
                closest = range;
                break;
            }
        }
        return closest.distance;
    }
}

export class SeekRemoteConfig extends Component<SeekRemoteConfiguration> {
    private seekRemoteConfig: SeekRemoteConfiguration;
    private seekPos: number = undefined;
    private position: number = undefined;
    private lastMove: number = 0;
    private seekHoldStart: Date;
    private hasStartedListeners = false;
    private seeking = false;
    private seekBar: SeekBar;
    private millisBetweenHoldEvents: number = 0;
    private seekDistance: number | TieredSeek;

    constructor(seekBar: SeekBar,
                config: SeekRemoteConfiguration = {
                backButton: 'ArrowLeft',
                forwardButton: 'ArrowRight',
                millisecondsBetweenHoldEvents: 125,
                restrictSeekToKey: undefined,
                seekDistance: {seekDistances: [10, 20, 30, 40, 50], millisBetweenTiers: 3000},
    }) {
        super(config);
        this.seekRemoteConfig = config;
        this.seekBar = seekBar;
        this.seekDistance = (typeof this.seekRemoteConfig.seekDistance === 'number') ? this.seekRemoteConfig.seekDistance as number : new TieredSeek(this.seekRemoteConfig.seekDistance as TieredSeekingConfig);


        seekBar.uimgr.onPreviewControlsHide.subscribe((uiContainer, args) => {
            if (this.lastMove > 0) args.cancel = true;
        });

        seekBar.uimgr.onControlsShow.subscribe((uiContainer, args) => {
            if (!this.hasStartedListeners) {
                this.startListeners();
                this.hasStartedListeners = true;
            }
        });

        seekBar.uimgr.onControlsHide.subscribe((uiContainer, args) => {
            this.removeListeners();
            this.hasStartedListeners = false;
        });
    }

    protected startListeners = () => {
        document.addEventListener('keydown', this.keyDownHandler);
    };

    protected removeListeners = () => {
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
    };

    private getPlaybackPositionPercentage(seekPos: number): number {
        if (this.seekBar.player.isLive()) {
            let difference = this.seekBar.player.getTimeShift() + seekPos;
            let percent = difference / this.seekBar.player.getMaxTimeShift();
            if (percent < 0) percent = 0;
            if (percent > 1) percent = 1;
            return 1 - percent;
        }

        return (this.seekBar.player.getCurrentTime() + seekPos) / this.seekBar.player.getDuration();
    }

    protected keyDownHandler = (e: KeyboardEvent) => {
        if (e.key  === this.seekRemoteConfig.backButton || e.key  === this.seekRemoteConfig.forwardButton) {
            if (Date.now() - this.lastMove > this.millisBetweenHoldEvents) {
                this.lastMove = Date.now();
                if (!this.seekHoldStart) this.seekHoldStart = new Date(); // start the key holding timer if not set

                e.preventDefault();

                // calculate the seek distance
                let seekDist = (this.seekDistance instanceof TieredSeek) ? this.seekDistance.getSeekDistanceForHoldTime(Math.abs(this.seekHoldStart.getTime() - Date.now())) : this.seekDistance as number;
                if (e.key === 'ArrowLeft') seekDist = seekDist * -1;
                // set the total seek distance (in case of press & hold seeking)
                this.seekPos = this.seekPos ? this.seekPos + seekDist : seekDist;

                // Calculate the seek position as a percentage of duration - This allows for working with current seekbar methods
                if (e.key === 'ArrowRight') {
                    this.position = this.getPlaybackPositionPercentage(this.seekPos);
                } else if (e.key === 'ArrowLeft') {
                    this.position = this.getPlaybackPositionPercentage(this.seekPos);
                }

                // convert decimal percentage to whole number percentage
                let percent = 100 * this.position;

                // Thumbnail preview if enabled
                this.seekBar.onSeekPreviewEvent(percent, false);

                if (this.seekBar.hasLabel() && this.seekBar.getLabel().isHidden()) {
                    this.seekBar.getLabel().show();
                }


            }
        }
        document.addEventListener('keyup', this.keyUpHandler);
    };

    public cancelDirectionalSeek = () => {
        this.seekBar.setSeekPosition(0);
        this.seekPos = undefined;
        this.position = undefined;
        if (this.seekBar.hasLabel()) {
            this.seekBar.getLabel().hide();
        }
        this.seekBar.setSeeking(false);
        this.lastMove = 0;
    }

    protected keyUpHandler = (e: KeyboardEvent) => {
        this.removeListeners();
        this.seekHoldStart = undefined;
        if (e.key  === this.seekRemoteConfig.restrictSeekToKey || e.key  === this.seekRemoteConfig.backButton || e.key  === this.seekRemoteConfig.forwardButton) {
            if (e.key  === this.seekRemoteConfig.restrictSeekToKey || (this.seekRemoteConfig.restrictSeekToKey === undefined && (e.key  === this.seekRemoteConfig.backButton || e.key  === this.seekRemoteConfig.forwardButton))) {

                e.preventDefault();

                this.seekBar.setSeeking(true);
                this.seeking = true;

                this.seekBar.onSeekEvent();

                let percent: number = this.position * 100;
                this.seekPos = undefined;
                this.position = undefined;
                let snappedChapter = this.seekBar.timelineMarkersHandler && this.seekBar.timelineMarkersHandler.getMarkerAtPosition(percent);

                this.seekBar.setSeekPosition(percent);
                this.seekBar.setPlaybackPosition(percent);
                this.seekBar.onSeekPreviewEvent(percent, false);
                this.lastMove = 0;

                this.seekBar.setSeeking(false);
                this.seeking = false;

                // Fire seeked event
                let pos = snappedChapter ? snappedChapter.position : percent;
                this.seekBar.onSeekedEvent(pos);

                if (this.seekBar.hasLabel()) {
                    this.seekBar.getLabel().hide();
                }
            } else {

            }
        } else { // Different key/button pressed so cancelling all seeking intentions
            e.preventDefault();

            this.cancelDirectionalSeek();
        }
        this.startListeners();
    };
}
