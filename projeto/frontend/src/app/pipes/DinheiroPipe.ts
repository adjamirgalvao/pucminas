import { Pipe, PipeTransform } from '@angular/core';

// https://stackoverflow.com/questions/62894283/javascript-input-mask-currency
// https://angular.io/guide/pipes-custom-data-trans
// só adaptei a primeira parte cuja entrada era string, mas já vem um number
@Pipe({name: 'dinheiroPipe'})
export class DinheiroPipe implements PipeTransform {
  transform(value: number): string {
    const result = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(value)
  
    return 'R$ ' + result
  }
}