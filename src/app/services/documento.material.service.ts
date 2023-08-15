import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Documento, GenericResponse } from '../types/types.module';
import { query } from '@angular/animations';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentoMaterialService {

  constructor(private http:HttpClient) { }

  search = (searchString:string, operator:string) => {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("searchString", searchString).append("operator", operator);
    return this.http.get<Documento[]>('/getDocumentosSearchArrayOperator', {params:queryParams});
  }

  searchAfter = (searchString:string, operator:string, pitId:string,fieldValues:string) => {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("searchString", searchString)
                            .append("operator", operator)
                            .append("pitId",pitId)
                            .append("fieldValues", fieldValues);
    return this.http.get<Documento[]>('/getDocumentosSearchArrayOperatorAfter', {params:queryParams});
  }

  searchDateRange = (searchString:string, operator:string, fromDate:Date, toDate:Date, typeOfLimit:string) => {
    let fromDateString;
    let toDateString;
    switch (typeOfLimit) {
      case 'De/Até':
        fromDateString = fromDate.toISOString().slice(0,10);
        toDateString = toDate.toISOString().slice(0,10);
        break;
      case 'De':
        fromDateString = fromDate.toISOString().slice(0,10);
        break;
      case 'Até':
        toDateString = toDate.toISOString().slice(0,10);
        break;
    }

    let queryParams = new HttpParams();
    queryParams = queryParams.append("searchString", searchString)
                              .append("operator", operator)
                              .append("typeOfLimit", typeOfLimit)
                              .append("fromDate", fromDateString as string)
                              .append("toDate", toDateString as string);
    return this.http.get<Documento[]>('/getDocumentosSearchArrayDateRange', {params:queryParams});
  }

  searchDateRangeAfter(searchString:string, fromDate:Date, toDate:Date, operator:string, typeOfLimit:string, pitId:string,fieldValues:string) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("searchString", searchString)
                              .append("fromDate", fromDate as unknown as string)
                              .append("toDate", toDate as unknown as string)
                              .append("operator", operator)
                              .append("typeOfLimit", typeOfLimit)
                              .append("pitId", pitId)
                              .append("fieldValues",fieldValues);
    return this.http.get<Documento[]>('/getDocumentosSearchArrayDateRangeAfter', {params:queryParams});
  }

  didYouMean(searchString:string) {
    let queryparams = new HttpParams();
    queryparams = queryparams.append("searchString", searchString);
    return this.http.get<GenericResponse<string>>('/didYouMean', {params:queryparams});
  }

  generatePitId() {
    // return this.http.post<String>("/pitId");
  }
  
}
