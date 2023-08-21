import { Component } from '@angular/core';
import { Documento } from '../types/types.module';
import { DocumentoService } from '../services/documento.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-search-smart',
  templateUrl: './search-smart.component.html',
  styleUrls: ['./search-smart.component.css']
})
export class SearchSmartComponent {
  documentos: Documento[] = [];
  pitId = '';
  documentoForm;
  afterSearch: boolean;
  searchString: string;
  emptyResponse: boolean;
  noMoreResults: boolean;
  possibleOption: string;
  hasLessRelevant = false;
  possibleOptionFound: boolean;
  highestScore = 0;
  filterByDate = true;
  path = '';

  constructor(private documentoService: DocumentoService, private formBuilder: FormBuilder) {

    this.afterSearch = false;
    this.emptyResponse = false;
    this.noMoreResults = false;
    this.searchString = "";
    this.possibleOption = "";
    this.possibleOptionFound = false;
    this.documentoForm = formBuilder.group({
      searchStringInput: ['', Validators.required],
    })
  }

  search() {
    this.resetParams();
    this.afterSearch = true;
    this.searchString = this.documentoForm.value.searchStringInput as string;
    let timeFilters = this.hasTimeFilters(this.searchString)!;
    if(this.filterByDate) {
      this.documentoService.searchDateRangeSmart(this.searchString, 'Or', timeFilters[0],timeFilters[1]).subscribe(documentos => {
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
    let lastDoc = this.documentos[this.documentos.length - 1];
    this.documentoService.searchAfter(this.searchString, 'Or', lastDoc.pitId, lastDoc.sortValues).subscribe(nextDocs => {
      if (nextDocs === null) {
        this.noMoreResults = true;
      } else {
        this.documentos.push(...nextDocs);
      }
    });
  }

  get f() {
    return this.documentoForm.controls;
  }

  hasTimeFilters(searchString: string) {
    const regex = /(hoje|ontem|semana passada|m[êe]s passado|ano passado|esta semana|este m[êe]s|este ano)(?=\W|$)/i;
    switch (searchString.match(regex)?.[0]) {
      case "hoje":
        return ['now/d', 'now+1d/d'];
      case "ontem":
        return ['now-1d/d', 'now/d'];
      case "semana passada":
        return ['now-1w/w', 'now/w'];
      case "mes passado":
      case "mês passado":
        return ['now-1M/M', 'now/M'];
      case "ano passado":
        return ['now-1y/y', 'now/y'];
      case "esta semana":
        return ['now/w', 'now+1w/w'];;
      case "este mes":
      case "este mês":
        return ['now/M', 'now+1M/M'];
      case "este ano":
        return ['now/y','now+1y/y'];
      default:
        this.filterByDate = false;
        return null;
    }
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
    this.filterByDate = true;
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

  decreaseOneYear(date: Date) {
    date.setFullYear(date.getFullYear() - 1);
    return date;
  }

  scoreProximiy(score: number) {
    let proximity = (score / this.highestScore) * 100;
    if (proximity < 85) {
      this.hasLessRelevant = true;
    }
    return proximity;
  }

  ngOnDestroy() {
    this.documentoService.deletePitId(this.pitId);
  }
}
