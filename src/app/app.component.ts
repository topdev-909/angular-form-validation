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
import * as dayjs from 'dayjs';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

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

  constructor(public dialog: MatDialog) { }
  /* Reactive form */
  reactiveForm() {
    this.myForm = new FormGroup(
      {
        startDate: new FormControl(new Date(), [Validators.required]),
        endDate: new FormControl(new Date(), Validators.required),
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
      let convertedDate = new Date(s);
      let time = this.myForm.get('startTime')?.getRawValue();
      this.updateEndDateTime(convertedDate, time);
    });
    this.myForm.get('startTime')?.valueChanges.subscribe((s) => {
      this.updateEndDateTime(this.myForm.get('startDate')?.getRawValue(), s);
    });
  }

  onlyDate(date: any | null = null, toDate: boolean = false) {
    let d
    if (!date) {
      d = dayjs();
    } else {
      d = dayjs(date);
    }
    d = d.hour(0).minute(0).second(0).millisecond(0)
    if (!toDate) {
      return d
    }
    return d.toDate()
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
      return [this.onlyDate(null, true), dayjs().format('HH:mm')];
    } else {
      return [this.onlyDate(date, true), dayjs(date).format('HH:mm')];
    }
  }

  getFormatedTime(time: string) {
    let h = this.splitHM(time).hour;
    let m = Math.floor(this.splitHM(time).minute / 15) * 15;
    return `${h < 10 ? '0' + h : h}:${m < 10 ? '00' : m}`;
  }

  updateEndDateTime(d: Date, t: string) {
    let dt = this.mergeDateAndTime(this.onlyDate(d), t)
    let [ed, et] = this.getConvertedDateTime(dt.add(1, 'h').toDate());
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
    let startDate = this.onlyDate(dayjs(startDateFormC.value)) as dayjs.Dayjs
    let endDate = this.onlyDate(dayjs(endDateFormC.value)) as dayjs.Dayjs;
    if (!(startDate.isBefore(endDate) || startDate.isSame(endDate))) {
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

  mergeDateAndTime(date: Date | dayjs.Dayjs, time: string) {
    return (this.onlyDate(dayjs(date)) as dayjs.Dayjs)
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
