import {ChangeDetectorRef, Component} from '@angular/core';
import * as Tone from "tone";

@Component({
  selector: 'ins-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private pTracks: any[] = [];
  private loop?: Tone.Loop;
  public activeStepNumber: number = 0;
  public tempo: string = '8n';
  public bpm: number = 120;
  public playing: boolean = false;
  public synths: Tone.Synth[] = [];

  get tracks(): any[] {
    return this.pTracks;
  }

  addTrack(track: any): void {
    this.synths.push(new Tone.Synth({'oscillator': track.oscillator}).toDestination());
    for(let i = 0; i < 16; i++) {
      track.steps[i] = {duration: '8n', enabled: false};
    }
    this.tracks.push(track);
  }

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    if(!this.load()) {
      this.resetTracks();
    }
  }

  play(): void {
    Tone.start();
    let index = 0;
    this.loop = new Tone.Loop(time => {
      let trackIndex = 0;
      this.tracks.forEach(track => {
        const step = track.steps[index];
        if (step.enabled && !track.mute) {
          this.synths[trackIndex].triggerAttackRelease(track.frequency, step.duration, time);
        }
        trackIndex++;
      });
      Tone.Draw.schedule(() => {
        this.activeStepNumber = index;
        this.changeDetectorRef.detectChanges();
        index = (index + 1) % 16;
      }, time);
    }, this.tempo).start(0);
    this.playing = true;
    Tone.Transport.bpm.value = this.bpm;
    Tone.Transport.start();
  }

  stop(): void {
    this.loop?.stop();
    Tone.Transport.stop();
    Tone.Transport.loopStart = 0;
    this.playing = false;
    this.activeStepNumber = 0;
    this.changeDetectorRef.detectChanges();
  }

  trackSoloed(solo: boolean): void {
    if(solo) {
      if (this.tracks.filter(track => track.solo).length === this.tracks.length) {
        this.tracks.forEach(track => {
          track.mute = false;
          track.solo = false;
        });
      } else {
        this.tracks.forEach(track => {
          if (!track.solo) {
            track.mute = true;
          }
        });
      }
    } else {
      if(this.tracks.filter(track => track.solo).length === 0) {
        this.tracks.forEach(track => {
          track.mute = false;
        });
      } else {
        this.tracks.forEach(track => {
          if(!track.solo) {
            track.mute = true;
          }
        });
      }
    }
  }

  save(): void {
    localStorage.setItem('tracks', JSON.stringify(this.pTracks));
  }

  load(): boolean {
    const tracks = localStorage.getItem('tracks');
    if(tracks) {
      this.pTracks = JSON.parse(tracks);
    }
    if(this.synths.length === 0) {
      this.pTracks.forEach((track: any) => {
        this.synths.push(new Tone.Synth({'oscillator': track.oscillator}).toDestination());
      });
    }
    return this.pTracks.length > 0;
  }

  randomize(): void {
    this.tracks.forEach(track => {
      track.steps.forEach((step: any) => {
        step.enabled = Math.random() > 0.5;
      });
    });
  }

  resetTracks(): void {
    this.synths = [];
    this.pTracks = [];
    [
      {id: 'track1', pos: 0, name: 'Kick', colorScheme: 'orange', frequency: 'C2', type: 'triangle', mute: false, solo: false},
      {id: 'track2', pos: 1, name: 'Snare', colorScheme: 'yellow', frequency: 'D#2', type: 'square', mute: false, solo: false},
      {id: 'track3', pos: 2, name: 'HiHat', colorScheme: 'yellow-green', frequency: 'F2', type: 'sawtooth', mute: false, solo: false},
      {id: 'track4', pos: 3, name: 'LowTom', colorScheme: 'green', frequency: 'G2', type: 'sine', mute: false, solo: false},
      {id: 'track5', pos: 4, name: 'MidTom', colorScheme: 'green-blue', frequency: 'A#2', type: 'triangle', mute: false, solo: false},
      {id: 'track6', pos: 5, name: 'MidTom2', colorScheme: 'teal', frequency: 'C3', type: 'square', mute: false, solo: false},
      {id: 'track7', pos: 6, name: 'HighTom', colorScheme: 'blue', frequency: 'D#3', type: 'sawtooth', mute: false, solo: false},
      {id: 'track8', pos: 7, name: 'Clap', colorScheme: 'dark-blue', frequency: 'F3', type: 'sine', mute: false, solo: false},
      {id: 'track9', pos: 8, name: 'Rim', colorScheme: 'violett', frequency: 'G3', type: 'triangle', mute: false, solo: false},
      {id: 'track10', pos: 9, name: 'Cowbell', colorScheme: 'magenta', frequency: 'A#3', type: 'square', mute: false, solo: false},
    ].forEach(track => {
      this.addTrack({
        id: track.id,
        pos: track.pos,
        name: track.name,
        colorScheme: track.colorScheme,
        duration: '8n',
        frequency: track.frequency,
        mute: track.mute,
        solo: track.solo,
        oscillator: {
          type: track.type || 'triangle',
          volume: -6,
          detune: 0,
          phase: 0,
          envelope: {
            attack: 0.01,
            decay: 0.01,
            sustain: 0.5,
            release: 0.01,
          }
        },
        steps: []
      });
    });
  }
}
