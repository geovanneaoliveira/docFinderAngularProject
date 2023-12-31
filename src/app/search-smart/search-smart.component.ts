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
  pitId: string = '';
  documentoForm;
  afterSearch: boolean = false;
  searchString: string = '';
  emptyResponse: boolean = false;
  noMoreResults: boolean = false;
  possibleOption: string = "";
  hasLessRelevant = false;
  possibleOptionFound: boolean = false;
  highestScore = 0;
  filterByDate = true;
  dateRange: DateRange = {
    from: '01/1/1900',
    to: 'now+1d/d'
  };
  path = '';
  regexMatch: RegExpMatchArray = [''];
  basicFilterRegex = new RegExp('(hoje|ontem|semana passada|m[êe]s passado|ano passado|es[st]a semana|es[ts]e m[êe]s|este ano)(?=\\W|$)', 'i');
  dateRangeRegex = new RegExp(`( de| at[ée]| a| à| em|-| ?) (${this.matchAnyPattern(MONTH_DICTIONARY)} de (19|20)\\d{2}|((0?[1-9]|[12][0-9]|3[01])[- /.])?(0?[1-9]|1[012])[- /.](19|20)\\d\\d)`, 'gi');

  constructor(private documentoService: DocumentoService, private formBuilder: FormBuilder) {
    this.documentoForm = formBuilder.group({
      searchStringInput: ['', Validators.required],
    })
  }

  search() {
    this.resetParams();
    this.afterSearch = true;
    this.searchString = this.documentoForm.value.searchStringInput as string;
    this.searchString = this.searchString.replace(/\s{2,}/g, ' ');
    this.hasTimeFilters(this.searchString);
    if (this.filterByDate) {
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
    console.log(this.filterByDate)
    let lastDoc = this.documentos[this.documentos.length - 1];
    console.log(lastDoc)
    if (this.filterByDate) {
      this.documentoService.searchDateRangeSmartAfter(this.searchString, 'Or', this.dateRange.from, this.dateRange.to, lastDoc.pitId, lastDoc.sortValues).subscribe(nextDocs => {
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

  get f() {
    return this.documentoForm.controls;
  }

  hasTimeFilters(searchString: string) {
    if (this.basicFilterRegex.test(searchString)) {
      this.setBasicTimeFilter(searchString);
    } else if (this.dateRangeRegex.test(searchString)) {
      this.setDateRangeFilter(searchString);
    } else {
      this.filterByDate = false;
    }
    console.log(this.dateRange);
  }

  setBasicTimeFilter(searchString: string) {
    this.regexMatch = searchString.match(this.basicFilterRegex)!;
    switch (this.regexMatch[0]) {
      case "hoje":
        this.dateRange.from = 'now/d';
        this.dateRange.to = 'now+1d/d';
        break;
      case "ontem":
        this.dateRange.from = 'now-1d/d';
        this.dateRange.to = 'now/d';
        break;
      case "semana passada":
        this.dateRange.from = 'now-1w/w';
        this.dateRange.to = 'now/w';
        break;
      case "mes passado":
      case "mês passado":
        this.dateRange.from = 'now-1M/M';
        this.dateRange.to = 'now/M';
        break;
      case "ano passado":
        this.dateRange.from = 'now-1y/y';
        this.dateRange.to = 'now/y';
        break;
      case "esta semana":
        this.dateRange.from = 'now/w';
        this.dateRange.to = 'now+1w/w';
        break;
      case "este mes":
      case "este mês":
      case "esse mes":
      case "esse mês":
        this.dateRange.from = 'now/M';
        this.dateRange.to = 'now+1M/M';
        break;
      case "este ano":
        this.dateRange.from = 'now/y';
        this.dateRange.to = 'now+1y/y';
        break;
      default:
        break;
    }
  }

  setDateRangeFilter(searchString: string) {
    searchString.match(this.dateRangeRegex)!.forEach(m => {
      console.log(m)
      let separated = m.split(" ").filter(v => v);
      switch (separated.length) {
        case 4:
          if (separated[0].toLowerCase() === "em") {
            this.dateRange.from = '01' + '/' + MONTH_DICTIONARY[separated[1]] + '/' + separated[3];
            this.dateRange.to = '01' + '/' + MONTH_DICTIONARY[separated[1]] + '/' + separated[3] + '||+1M/d';
          } else if (separated[0].toLowerCase() === "de") {
            this.dateRange.from = '01' + '/' + MONTH_DICTIONARY[separated[1]] + '/' + separated[3];
          } else {
            this.dateRange.to = '01' + '/' + MONTH_DICTIONARY[separated[1]] + '/' + separated[3] + '||+1M/d';
          }
          break;
        case 3:
          this.dateRange.from = '01' + '/' + MONTH_DICTIONARY[separated[0]] + '/' + separated[2];
          this.dateRange.to = '01' + '/' + MONTH_DICTIONARY[separated[0]] + '/' + separated[2] + '||+1M/d';
          break;
        case 2:
          if(separated[1].length<=7){
            separated[1] = '01/'+ separated[1];
          }
          if (separated[0].toLowerCase() === "de") {
            this.dateRange.from = separated[1];
          } else if (separated[0].toLowerCase() === "em") {
            this.dateRange.from = separated[1];
            this.dateRange.to = separated[1] + '||+1d/d';
          } else {
            this.dateRange.to = separated[1] + '||+1d/d';
          }
          break;
        case 1:
          if(separated[0].length<=7){
            separated[0] = '01/'+ separated[0];
          }
          this.dateRange.from = separated[0];
          this.dateRange.to = separated[0] + '||+1d/d';
          break;
        default:
          break;
      }
      console.log(separated);
    });

  }

  didYouMean(searchString: string) {
    this.documentoService.didYouMean(searchString).subscribe(possibleOption => {
      if (possibleOption != null) {
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
    this.dateRange.from = '01/1/1900';
    this.dateRange.to = 'now+1d/d';
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
