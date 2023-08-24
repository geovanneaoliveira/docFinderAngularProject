import { Component } from '@angular/core';
import { DateRange, DictionaryLike, Documento, } from '../types/types.module';
import { DocumentoService } from '../services/documento.service';
import { FormBuilder, Validators } from '@angular/forms';
import { MONTH_DICTIONARY } from '../constants';

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
  dateRange: DateRange;
  basicTimeFilters:string[];
  path = '';

  constructor(private documentoService: DocumentoService, private formBuilder: FormBuilder) {

    this.afterSearch = false;
    this.dateRange = {
      from: '1900-01-01',
      to: 'now'
    };
    this.basicTimeFilters = [];
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
    this.basicTimeFilters = this.hasTimeFilters(this.searchString);
    this.hasDateRange(this.searchString);
    if (true) {
      console.log('aq')
      this.documentoService.searchDateRangeSmart(this.searchString, 'Or', this.dateRange.from, this.dateRange.to).subscribe(documentos => {
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
    this.hasDateRange(searchString);
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
        return ['now/y', 'now+1y/y'];
      default:
        return [];
    }
  }

  hasDateRange(searchString: string) {
    const regex = new RegExp(`(de|até|a|à) ${this.matchAnyPattern(MONTH_DICTIONARY)} de (19|20)\\d{2}`, 'gi');
    let match = searchString.match(regex);
    if (match?.length! > 0) {
      match?.forEach(m => {
        let separated = m.split(" ")!;
        if (separated[0].toLowerCase() === "de") {
          this.dateRange.from = separated[3]+'-'+MONTH_DICTIONARY[separated[1]]+'-'+'01';
          // this.dateRange.from = new Date(separated[3] as unknown as number, MONTH_DICTIONARY[separated[1]], 1);
        } else {
          this.dateRange.to = separated[3]+'-'+MONTH_DICTIONARY[separated[1]]+'-'+'01';
        }
      });
    }
    console.log(this.dateRange);
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
    this.basicTimeFilters = [];
    this.dateRange.from = '1900-01-01';
    this.dateRange.to = 'now';
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

  extractTerms(dictionary: DictionaryLike): string[] {
    let keys: string[];
    if (dictionary instanceof Array) {
      keys = [...dictionary];
    } else if (dictionary instanceof Map) {
      keys = Array.from((dictionary as Map<string, unknown>).keys());
    } else {
      keys = Object.keys(dictionary);
    }

    return keys;
  }

  matchAnyPattern(dictionary: DictionaryLike): string {
    // TODO: More efficient regex pattern by considering duplicated prefix

    const joinedTerms = this.extractTerms(dictionary)
      .sort((a, b) => b.length - a.length)
      .join("|")
      .replace(/\./g, "\\.");

    return `(${joinedTerms})`;
  }
}
