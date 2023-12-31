import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMaterialComponent } from './search-material.component';

describe('SearchMaterialComponent', () => {
  let component: SearchMaterialComponent;
  let fixture: ComponentFixture<SearchMaterialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchMaterialComponent]
    });
    fixture = TestBed.createComponent(SearchMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
