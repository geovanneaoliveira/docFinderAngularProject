import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchScreenComponent } from './search-screen/search-screen.component';

const routes: Routes = [{
  path: '',
  component: SearchScreenComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
