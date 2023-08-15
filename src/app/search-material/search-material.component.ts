import { Component } from '@angular/core';
import { Documento } from '../types/types.module';
import { DocumentoService } from '../services/documento.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-search-material',
  templateUrl: './search-material.component.html',
  styleUrls: ['./search-material.component.css']
})
export class SearchMaterialComponent {

  documentos: Documento[] = [];
  pitId = '';
  documentoForm;
  filterByDate: boolean;
  typeofLimit = "De/Até";
  afterSearch: boolean;
  searchString: string;
  emptyResponse: boolean;
  noMoreResults: boolean;
  possibleOption: string;
  hasLessRelevant = false;
  possibleOptionFound: boolean;
  toDateDefaultValue = new Date().toISOString().slice(0, 10);
  fromDateDefaultValue = this.decreaseOneYear(new Date()).toISOString().slice(0, 10);
  highestScore = 0;
  path = '';
  selected = "De/Até";
  columnsToDisplay = ['cnpj', 'data', 'termos', 'score', 'local'];

  constructor(private documentoService: DocumentoService, private formBuilder: FormBuilder) {

    this.afterSearch = false;
    this.emptyResponse = false;
    this.noMoreResults = false;
    this.filterByDate = false;
    this.searchString = "";
    this.possibleOption = "";
    this.possibleOptionFound = false;
    console.log(this.fromDateDefaultValue)
    this.documentoForm = formBuilder.group({
      searchStringInput: ['', Validators.required],
      fromDateInput: [,],
      toDateInput: [,]
    })
  }

  search() {
    this.resetParams();
    let values = this.documentoForm.value;
    this.searchString = values.searchStringInput!;
    this.afterSearch = true;
    if (this.filterByDate) {
      this.documentoService.searchDateRange(this.searchString, 'Or', values.fromDateInput!, values.toDateInput!, this.typeofLimit).subscribe(documentos => {
        if (documentos === null) {
          this.emptyResponse = true;
        } else {
          this.highestScore = documentos[0].score;
          this.documentos = documentos;
          this.emptyResponse = false;
        }
      });
    } else {
      this.documentoService.search(this.searchString, 'Or').subscribe(documentos => {
        if (documentos === null) {
          this.emptyResponse = true;
        } else {
          this.highestScore = documentos[0].score;
          this.documentos = documentos;
          this.emptyResponse = false;
        }
      });
    }
    this.didYouMean(this.searchString);
  }

  searchAfter() {
    let values = this.documentoForm.value;
    let lastDoc = this.documentos[this.documentos.length - 1];
    if (this.filterByDate === true) {
      this.documentoService.searchDateRangeAfter(this.searchString, values.fromDateInput!, values.toDateInput!, 'Or', this.typeofLimit, lastDoc.pitId, lastDoc.sortValues).subscribe(nextDocs => {
        if (nextDocs === null) {
          this.noMoreResults = true;
        } else {
          this.documentos.push(...nextDocs);
        }
      });
    } else {
      this.documentoService.searchAfter(this.searchString, 'Or', lastDoc.pitId, lastDoc.sortValues).subscribe(nextDocs => {
        if (nextDocs === null) {
          this.noMoreResults = true;
        } else {
          this.documentos.push(...nextDocs);
        }
      });
    }
  }

  enableFilterByDate(e: any) {
    if (e.target.checked) {
      this.filterByDate = true;
    } else {
      this.filterByDate = false;
    }
  }

  changeFilterOptions(e: any) {
    this.typeofLimit = e.value;
    switch (this.typeofLimit) {
      case 'De/Até':
        this.documentoForm.controls.fromDateInput.enable();
        this.documentoForm.controls.toDateInput.enable();
        break;
      case 'De':
        this.documentoForm.controls.fromDateInput.enable();
        this.documentoForm.controls.toDateInput.disable();
        break;
      case 'Até':
        this.documentoForm.controls.fromDateInput.disable();
        this.documentoForm.controls.toDateInput.enable();
        break;
    }
  }

  get f() {
    return this.documentoForm.controls;
  }

  didYouMean(searchString: string) {
    this.documentoService.didYouMean(searchString).subscribe(possibleOption => {
      if (possibleOption.record) {
        this.possibleOptionFound = true;
        this.possibleOption = possibleOption.record;
      }
    });
  }

  searchByDidYouMean() {
    this.documentoForm.get('searchStringInput')?.setValue(this.possibleOption);
    this.search();
  }

  resetParams() {
    this.possibleOptionFound = false;
    this.hasLessRelevant = false;
    this.noMoreResults = false;
    this.documentos = [];
    this.emptyResponse = false;
  }

  checkLink(local: string) {
    if (local.charAt(1) === ':') {
      this.path = local;
      window.open("file:///" + local, "_blank");
    } else {
      window.open("https://" + local, "_blank");
    }
  }

  decreaseOneYear(date:Date) {
    date.setFullYear(date.getFullYear() - 1);
    return date;
  }

  scoreProximiy(score: number) {
    let proximity = (score/this.highestScore)*100;
    if(proximity<85){
      this.hasLessRelevant = true;
    }
    return proximity;
  }

  ngOnDestroy() {
    this.documentoService.deletePitId(this.pitId);
  }
}
