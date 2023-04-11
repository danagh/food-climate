import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { Observable, startWith, map } from 'rxjs';
import { ClimateData } from './types';
import { ClimateService } from './climate.service';

import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Klimatdata för livsmedel';

  climateDataForm: FormGroup = this.fb.group({
    servings: this.fb.control(1, [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]),
    ingredients: this.fb.array([this.getNewIngredient()])
  });

  initialValues = this.climateDataForm.value;

  filteredOptions: Observable<ClimateData[]>[] = [];

  constructor(private fb: FormBuilder, private climateService: ClimateService) {
    
  }

  ngOnInit() {
    this.ManageNameControl(0);
  }

  get ingredients(): FormArray<any> {
    return this.climateDataForm.get('ingredients') as FormArray
  }

  ManageNameControl(index: number) {
    this.ingredients.at(index).get('name')?.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      ).subscribe(values => {
        this.filteredOptions[index] = values;
      })
  }

  addIngredient() {
    this.ingredients.push(this.getNewIngredient())
    this.ManageNameControl(this.ingredients.length - 1);
  }

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
    this.filteredOptions.splice(index, 1);
  }

  isInvalid(ingredient: AbstractControl<any, any>, name: string) {
    return this.getIngredientField(ingredient, name)?.invalid;
  }

  getErrorMessage(ingredient: AbstractControl<any, any>, name: string): string {
    const control = this.getIngredientField(ingredient, name);
    if (control?.hasError('required')) {
      return 'Fältet är obligatoriskt';
    }

    if (control?.hasError('min')) {
      return 'Fältet måste vara större än noll';
    }

    return 'Okänt fel';
  }

  getServingsErrorMessage(): string {
    const control = this.climateDataForm.controls['servings'];
    if (control?.hasError('required')) {
      return 'Fältet är obligatoriskt';
    }

    if (control?.hasError('min')) {
      return 'Fältet måste vara större än noll';
    }

    if (control?.hasError('pattern')) {
      return 'Fältet får bara innehålla heltal';
    }

    return 'Okänt fel';
  }

  onSelectionChange(event: MatAutocompleteSelectedEvent, index: number) {
    const climateData: ClimateData = event.option.value;
    this.ingredients.at(index).get('footprint')?.patchValue(climateData.climateFootprint);
    this.ingredients.at(index).get('info')?.patchValue(climateData.info);
  }

  displayFn(climateData?: ClimateData): string {
    return climateData ? `${climateData.food} (${climateData.origin})` : '';
  }

  calculateFootprint(index: number): number {
    const ingredient = this.ingredients.at(index);
    const amount = parseFloat(ingredient.get('amount')?.value);
    const unit = ingredient.get('unit')?.value
    const unitValue = unit === "G" ? 0.001 : 1;
    const footprint = parseFloat(ingredient.get('footprint')?.value);
    if (isNaN(amount) || isNaN(unitValue) || isNaN(footprint)) {
      return 0;
    }

    return +(footprint * amount * unitValue).toFixed(2);
  }

  calculateServingsFootprint(): number {
    const servings = parseInt(this.climateDataForm.get('servings')?.value);
    
    if (isNaN(servings) || servings < 1) return 0;

    return +(this.calculateTotalFootprint() / servings).toFixed(2);
  }

  calculateTotalFootprint(): number {
    let footprint = 0;
    for (let i = 0; i < this.ingredients.length; i++) {
      footprint += this.calculateFootprint(i);
    }

    return footprint;
  }

  onSubmit(event: any) {
    event.preventDefault();
  }

  resetForm() {
    window.location.reload();
  }

  private getNewIngredient() {
    return this.fb.group({
      name: this.fb.control('', [Validators.required]),
      amount: this.fb.control(1, [Validators.required, Validators.min(1)]),
      unit: this.fb.control('Kg', [Validators.required]),
      footprint: this.fb.control<number | null>(null),
      info: this.fb.control('')
    });
  }

  private getIngredientField(ingredient: AbstractControl<any, any>, name: string): AbstractControl<any, any> | null {
    const ingredientGroup = ingredient as FormGroup;
    return ingredientGroup.get(name);
  }

  private _filter(value: string): Observable<ClimateData[]> {
    return this.climateService.search(value);
  }
}
