import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SuperheroesService } from '../../services/superheroes.service';
import { SuperheroStatus } from '../../interfaces';
import { ImagePipe } from 'src/app/shared/pipes/image.pipe';

@Component({
  selector: 'app-superheroe-edit',
  standalone: true,
  imports: [
    CommonModule,
    ImagePipe,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
  templateUrl: './superheroe-edit.component.html',
  styleUrls: ['./superheroe-edit.component.scss']
})
export class SuperheroeEditComponent {

  private fb = inject(FormBuilder);
  private superheroesSvc = inject(SuperheroesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackbar = inject(MatSnackBar);
  
  superheroForm: FormGroup = this.fb.group({
    id: ['',[]],
    name: ['', [Validators.required]],
    power: ['', [Validators.required]],
    identity: ['', [Validators.required]],
    city: ['', [Validators.required]],
    status: [SuperheroStatus.active, [Validators.required]],
    imgUrl: [''],
  });

  readonly superheroStatus = [
    { val: SuperheroStatus.active }, 
    { val: SuperheroStatus.retired }
  ]

  isEdit = signal(false);

  ngOnInit() {
    if ( !this.router.url.includes('edit') ) return;
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit.set(true);
    if ( !id ) {
      this.router.navigate(['/superheroes/list']);
    } else {
      this.getSuperheroById( id );
    }   
  }

  getSuperheroById( id: string ) {
    this.superheroesSvc.getSuperheroById( id ).subscribe({
      next: (superhero) => {
        if ( !superhero ) {
          this.router.navigate(['/superheroes/list']);
        } else {
          this.superheroForm.reset( superhero );
        }
      },
      error: () => {
        this.showrSnackbarError('Se ha producido un error al intentar obtener le superhéroe');
        this.router.navigate(['/superheroes/list']);
      }
    });
  }

  onSubmit():void {

    this.superheroForm.markAllAsTouched();
    if ( this.superheroForm.invalid ) return;

    if ( this.isEdit() ) {
      this.superheroesSvc.updateSuperhero( this.superheroForm.value )
      .subscribe({
        next: (superhero) => {
        this.showSnackbarSuccess(`${ superhero.name } actualizado!`);
        this.router.navigate(['/superheroes/list']);
        },
        error: () => {
          this.showrSnackbarError('Error al intentar actualizar superhéroe');
        }
      });
    } else {
      this.superheroesSvc.createSuperhero( this.superheroForm.value )
        .subscribe({
          next: (superhero) => {
            this.showSnackbarSuccess(`${ superhero.name } creado!`);
            this.router.navigate(['/superheroes/list']);
          },
          error: () => {
            this.showrSnackbarError('Error al intentar crear superhéroe');
          }
        });
    }

  }

  showSnackbarSuccess( message: string ):void {
    this.snackbar.open( message, 'OK', {
      duration: 2500,
      panelClass: ['success-snackbar']
    })
  }

  showrSnackbarError( message: string ):void {
    this.snackbar.open( message, 'OK', {
      duration: 2500,
      panelClass: ['error-snackbar']
    })
  }

}
