import {Component, EventEmitter, Input, Output} from '@angular/core';
import * as Tone from "tone";

@Component({
  selector: 'ins-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent {

  @Input() config: any;
  @Input() synth: Tone.Synth = new Tone.Synth();
  @Input() activeStepNumber: any;
  @Input() playing: boolean = false;
  @Output() soloed: EventEmitter<boolean> = new EventEmitter<boolean>();

  public notes: string[] = [];
  public nameEditable: boolean = false;

  constructor() {
    for(let i:number = 0; i < 6; i++) {
      ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].forEach((note: string) => {
        this.notes.push(note + i);
      });
    }
  }

  enableNameEdit() {
    this.nameEditable = true;
  }

  disableNameEdit() {
    this.nameEditable = false;
  }

  muteTrack() {
    if(this.config.solo) this.config.solo = false;
  }

  soloTrack() {
    if(this.config.mute) this.config.mute = false;
    this.soloed.emit(this.config.solo);
  }
}
