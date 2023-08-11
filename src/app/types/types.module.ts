export interface FieldValue {
  _value:object
}

export interface Documento {
  id: string,
  cnpj: string,
  data: Date,
  termos: Array<string>,
  local: string,
  score: number,
  sortValues: string,
  pitId: string
}

export interface GenericResponse<T> {
  record: T
}