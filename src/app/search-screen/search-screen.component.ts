import { Component } from '@angular/core';
import { DocumentoService } from '../services/documento.service';
import { Documento } from '../types/types.module';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-search-screen',
  templateUrl: './search-screen.component.html',
  styleUrls: ['./search-screen.component.css']
})
export class SearchScreenComponent {

  documentos: Documento[] = [];
  pitId!: string;
  documentoForm;
  filterByDate: boolean;
  typeofLimit: string;
  afterSearch: boolean;
  searchString: string;
  emptyResponse: boolean;
  noMoreResults: boolean;
  hasLessRelevant = false;
  possibleOption: string;
  possibleOptionFound: boolean;
  toDateDefaultValue = new Date().toISOString().slice(0, 10);
  fromDateDefaultValue = this.decreaseOneYear(new Date()).toISOString().slice(0, 10);
  highestScore = 0;
  path = '';
  columnsToDisplay = ['cnpj', 'data', 'termos', 'score', 'local'];

  constructor(private documentoService: DocumentoService, private formBuilder: FormBuilder) {

    this.afterSearch = false;
    this.emptyResponse = false;
    this.noMoreResults = false;
    this.filterByDate = false;
    this.searchString = "";
    this.possibleOption = "";
    this.possibleOptionFound = false;
    this.typeofLimit = "De/Até";

    
    this.documentoForm = formBuilder.group({
      searchStringInput: ['', Validators.required],
      fromDateInput: [, Validators.required],
      toDateInput: [, Validators.required]
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
          this.didYouMean(this.searchString);
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
          this.didYouMean(this.searchString);
          this.emptyResponse = true;
        } else {
          this.highestScore = documentos[0].score;
          this.documentos = documentos;
          this.emptyResponse = false;
        }
      });
    }
  }

  searchAfter() {
    let values = this.documentoForm.value;
    let lastDoc = this.documentos[this.documentos.length - 1];
    if (this.filterByDate === true) {
      // this.documentoService.searchDateRangeSmartAfter(this.searchString, values.fromDateInput!, values.toDateInput!, 'Or', this.typeofLimit, lastDoc.pitId, lastDoc.sortValues).subscribe(nextDocs => {
      //   if (nextDocs === null) {
      //     this.noMoreResults = true;
      //   } else {
      //     this.documentos.push(...nextDocs);
      //   }
      // });
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
    this.typeofLimit = e.target.value;
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
    this.noMoreResults = false;
    this.documentos = [];
    this.emptyResponse = false;
    this.hasLessRelevant = false;
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
    if(proximity<85) {
      this.hasLessRelevant = true;
    }
    return proximity;
    // let color;
    // let result;
    // switch(true) {
    //   case proximity>=85:
    //     color = "color: green;";
    //     result = 'Próximo';
    //     break;
    //     case proximity>=49:
    //     color = "color: yellow;";
    //     result = 'Similar';
    //     break;
    //     case proximity<49:
    //     color = "color: orange;";
    //     result = 'Distante';
    //     break;
    // }
    // return [color,result];
  }
  // generatePit = () => {
  //   this.documentoService.generatePitId().subscribe(id => {
  //     this.pitId = id;
  //   });
  // }
}
