import { FormControl, FormGroup, NgForm, FormGroupDirective } from '@angular/forms';
import * as dayjs from 'dayjs';

export class DateValidator {
  static validDate(formGroup: FormGroup) {

    let startDate;
    let endDate;
    if(/\d\d\d\d\-\d\d\-\d\d/.test(formGroup.controls['startDate'].value)) {
    startDate = dayjs(formGroup.controls['startDate'].value).subtract(1, 'd');
    } else {
    startDate = dayjs(formGroup.controls['startDate'].value);
    }
    if(/\d\d\d\d\-\d\d\-\d\d/.test(formGroup.controls['endDate'].value)) {
    endDate = dayjs(formGroup.controls['endDate'].value).subtract(1, 'd');
    } else {
    endDate = dayjs(formGroup.controls['endDate'].value);
    }
    let startDateTime = startDate.add(formGroup.controls['startTime'].value?.substring(0, 2) || 0, 'h').add(formGroup.controls['startTime'].value?.substring(3, 5) || 0, 'm')
    let endDateTime = endDate.add(formGroup.controls['endTime'].value?.substring(0, 2) || 0, 'h').add(formGroup.controls['endTime'].value?.substring(3, 5) || 0, 'm')

    if(!(startDate.isBefore(endDate) || startDate.isSame(endDate))) {
        // formGroup.controls['endDate'].errors = []
        return {endDate: true}
    }
    if(!(startDateTime.add(1, 'h').isBefore(endDateTime) || startDateTime.add(1, 'h').isSame(endDateTime))) {
        return {endTime: true}
    }
    return null
  }
  static endDateValidator(formControl: FormControl) {
    console.log(formControl)
    // let startDate;
    // let endDate;
    // let formGroup: FormGroup = formControl.parent as FormGroup
    // if(/\d\d\d\d\-\d\d\-\d\d/.test(formGroup.controls['startDate'].value)) {
    // startDate = dayjs(formGroup.controls['startDate'].value).subtract(1, 'd');
    // } else {
    // startDate = dayjs(formGroup.controls['startDate'].value);
    // }
    // if(/\d\d\d\d\-\d\d\-\d\d/.test(formControl.value)) {
    // endDate = dayjs(formControl.value).subtract(1, 'd');
    // } else {
    // endDate = dayjs(formControl.value);
    // }

    // if(!(startDate.isBefore(endDate) || startDate.isSame(endDate))) {
    //     return {endDate: true}
    // }
    return null
  }
  static endTimeValidator(formControl: FormControl) {
    console.log(formControl.parent)

    let startDate;
    let endDate;
    let formGroup: FormGroup = formControl.parent as FormGroup
    // console.log(formGroup.get('endDate'))
    // if(/\d\d\d\d\-\d\d\-\d\d/.test(formGroup.controls['startDate'].value)) {
    // startDate = dayjs(formGroup.controls['startDate'].value).subtract(1, 'd');
    // } else {
    // startDate = dayjs(formGroup.controls['startDate'].value);
    // }
    // if(/\d\d\d\d\-\d\d\-\d\d/.test(formGroup.controls['endDate'].value)) {
    // endDate = dayjs(formGroup.controls['endDate'].value).subtract(1, 'd');
    // } else {
    // endDate = dayjs(formGroup.controls['endDate'].value);
    // }
    // let startDateTime = startDate.add(formGroup.controls['startTime'].value?.substring(0, 2) || 0, 'h').add(formGroup.controls['startTime'].value?.substring(3, 5) || 0, 'm')
    // let endDateTime = endDate.add(formControl.value?.substring(0, 2) || 0, 'h').add(formControl.value?.substring(3, 5) || 0, 'm')

    // if(!(startDateTime.add(1, 'h').isBefore(endDateTime) || startDateTime.add(1, 'h').isSame(endDateTime))) {
        // return {endTime: true}
    // }
    return null
  }
}