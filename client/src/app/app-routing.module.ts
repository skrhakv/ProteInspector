import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { NavbarLayoutComponent } from './components/navbar-layout/navbar-layout.component';

const routes: Routes = [
    {
        path: '',
        component: NavbarLayoutComponent,
        children: [
            { path: '', component: HomeComponent },
        ] 
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
