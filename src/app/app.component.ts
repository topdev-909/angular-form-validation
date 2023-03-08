import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  ValidatorFn,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ResultDialogComponent } from './result-dialog/result-dialog.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';

const APP_FORMATS = {
  parse: {
    dateInput: "DD/MM/YYYY"
  },
  display: {
    dateInput: "DD/MM/YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "DD/MM/YYYY",
    monthYearA11yLabel: "MMMM YYYY"
  }
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: APP_FORMATS
    },
    DatePipe
  ],
})
export class AppComponent {
  timeList: any = [];
  myForm!: FormGroup;
  diff: number = -3600000 // 1 hour 

  constructor(public dialog: MatDialog) { }
  /* Reactive form */
  reactiveForm() {
    this.myForm = new FormGroup(
      {
        startDate: new FormControl(moment(), [Validators.required]),
        endDate: new FormControl(moment(), Validators.required),
        startTime: new FormControl('00:00', [Validators.required]),
        endTime: new FormControl('00:00', Validators.required),
      },
      {
        validators: this.dateTimeValidator,
      }
    );
  }

  ngOnInit(): void {
    // Config form
    this.reactiveForm();
    // Set time list
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 4; j++) {
        this.timeList.push(
          `${i < 10 ? '0' + i : i}:${j === 0 ? '00' : 15 * j}`
        );
      }
    }
    // initialize form
    this.initialize();

    this.myForm.get('startDate')?.valueChanges.subscribe((s) => {
      let convertedDate = moment(s)
      let time = this.myForm.get('startTime')?.getRawValue();
      this.updateEndDateTime(convertedDate, time);
    });
    this.myForm.get('startTime')?.valueChanges.subscribe((s) => {
      this.updateEndDateTime(this.myForm.get('startDate')?.getRawValue(), s);
    });
    this.myForm.get('endDate')?.valueChanges.subscribe((s) => {
      let endT = this.myForm.get('endTime')?.getRawValue();
      this.setDiff(s, endT)
    });
    this.myForm.get('endTime')?.valueChanges.subscribe((s) => {
      let endD = this.myForm.get('endDate')?.getRawValue();
      this.setDiff(endD, s)
    });
  }

  setDiff(endD: moment.Moment, endT: string) {
    let startD = this.myForm.get('startDate')?.getRawValue();
    let startT = this.myForm.get('startTime')?.getRawValue();
    let startDT = this.mergeDateAndTime(this.onlyDate(startD), startT)
    let endDT = this.mergeDateAndTime(this.onlyDate(endD), endT)
    this.diff = startDT.diff(endDT)
  }

  onlyDate(date: any | null = null) {
    let d
    if (!date) {
      d = moment();
    } else {
      d = moment(date);
    }
    return d.hour(0).minute(0).second(0).millisecond(0)
  }

  initialize() {
    let [cd, ct]: any[] = this.getConvertedDateTime();
    this.myForm.get('startDate')!.setValue(cd, {
      onlyself: true,
    });
    ct = this.getFormatedTime(ct);
    this.myForm.get('startTime')!.setValue(ct, {
      onlyself: true,
    });
    this.updateEndDateTime(cd, ct);
  }

  getConvertedDateTime(date: any | string | null = null) {
    if (!date) {
      return [this.onlyDate(null), moment().format('HH:mm')];
    } else {
      return [this.onlyDate(date), moment(date).format('HH:mm')];
    }
  }

  getFormatedTime(time: string) {
    let h = this.splitHM(time).hour;
    let m = Math.floor(this.splitHM(time).minute / 15) * 15;
    return `${h < 10 ? '0' + h : h}:${m < 10 ? '00' : m}`;
  }

  updateEndDateTime(d: moment.Moment, t: string) {
    let dt = this.mergeDateAndTime(this.onlyDate(d), t)
    let [ed, et] = this.getConvertedDateTime(dt.subtract(this.diff));
    this.myForm.get('endDate')!.setValue(ed, {
      onlyself: true,
    });
    this.myForm.get('endTime')!.setValue(et, {
      onlyself: true,
    });
  }

  dateTimeValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    let startDateFormC = control.get('startDate');
    let endDateFormC = control.get('endDate');
    let startTimeFormC = control.get('startTime');
    let endTimeFormC = control.get('endTime');
    if (!startDateFormC || !startTimeFormC || !endDateFormC || !endTimeFormC)
      return null;
    let startDate = this.onlyDate(moment(startDateFormC.value)) as moment.Moment
    let endDate = this.onlyDate(moment(endDateFormC.value)) as moment.Moment
    if (!(startDate.isSameOrBefore(endDate))) {
      endDateFormC?.setErrors({ inValid: true });
      endTimeFormC?.setErrors(null);
      return { endDate: true };
    }
    let startDateTime = this.mergeDateAndTime(startDate, startTimeFormC.value)
    let endDateTime = this.mergeDateAndTime(endDate, endTimeFormC.value)
    if (
      !startDateTime.isBefore(endDateTime)
    ) {
      endDateFormC?.setErrors(null);
      endTimeFormC?.setErrors({ inValid: true });
      return { endTime: true };
    }
    endTimeFormC?.setErrors(null);
    endDateFormC?.setErrors(null);
    return null;
  };

  splitHM(hm: string) {
    return {
      hour: Number(hm.split(':')[0]),
      minute: Number(hm.split(':')[1]),
    }
  }

  mergeDateAndTime(date: Date | moment.Moment, time: string) {
    return (this.onlyDate(moment(date)) as moment.Moment)
      .add(this.splitHM(time).hour, 'h')
      .add(this.splitHM(time).minute, 'm')
  }

  submitForm() {
    let startDateTime = this.mergeDateAndTime(this.myForm.value['startDate'], this.myForm.value['startTime']);
    let endDateTime = this.mergeDateAndTime(this.myForm.value['endDate'], this.myForm.value['endTime']);
    this.dialog.open(ResultDialogComponent, {
      data: {
        start: startDateTime.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        end: endDateTime.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      },
      panelClass: 'result-dialog-container',
    });
  }
}
