import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'loanStatus'
})
export class LoanStatusPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
