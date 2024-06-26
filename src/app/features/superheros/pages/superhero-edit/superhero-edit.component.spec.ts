import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperheroEditComponent } from './superhero-edit.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { SuperherosService } from '../../services/superheros.service';
import { Superhero } from '../../interfaces';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { MatSnackBarMock, SuperherosServiceMock, superheroMock } from '../../testing/mocks';


describe('SuperheroEditComponent', () => {
  let component: SuperheroEditComponent;
  let fixture: ComponentFixture<SuperheroEditComponent>;
  let router: Router;
  let route: ActivatedRoute;
  let superherosSvcMock: SuperherosService;
  let snackbarMock: MatSnackBar;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
      imports: [SuperheroEditComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        { provide: SuperherosService, useClass: SuperherosServiceMock},
        { provide: MatSnackBar, useClass: MatSnackBarMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SuperheroEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
    superherosSvcMock = TestBed.inject(SuperherosService);
    snackbarMock = TestBed.inject(MatSnackBar);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should set isEdit to true and call getSuperheroById with "123" when URL contains "superheros/edit/:id"', () => {
    const id = '123'
    spyOnProperty(router, 'url').and.returnValue(`/superheros/edit/${id}`);
    const routeSpy = spyOn(route.snapshot.paramMap, 'get').and.returnValue(id);
    const getSuperheroByIdSpy = spyOn(component, 'getSuperheroById');
    
    component.ngOnInit();

    expect( routeSpy ).toHaveBeenCalledWith('id');
    expect( component.isEdit() ).toBeTrue();
    expect( getSuperheroByIdSpy ).toHaveBeenCalledWith(id);
  });

  it('ngOnInit should set isEdit to true and navigate to "/superheros/list" when URL is "superheros/edit"', () => {
    spyOnProperty(router, 'url').and.returnValue(`/superheros/edit`);
    const routerSpy = spyOn(router, 'navigate');
    const routeSpy = spyOn(route.snapshot.paramMap, 'get').and.returnValue(null);
    
    component.ngOnInit();

    expect( routeSpy ).toHaveBeenCalledWith('id');
    expect( component.isEdit() ).toBeTrue();
    expect( routerSpy ).toHaveBeenCalledWith(['/superheros/list']);
  });

  it('ngOnInit should return early and not execute further logic when URL does not contain "edit"', () => {
    spyOnProperty(router, 'url').and.returnValue(`/superheros/new`);
    const routerSpy = spyOn(router, 'navigate');
    const routeSpy = spyOn(route.snapshot.paramMap, 'get');
    const getSuperheroByIdSpy = spyOn(component, 'getSuperheroById');
    
    component.ngOnInit();

    expect( component.isEdit() ).toBeFalse();
    expect( routerSpy ).not.toHaveBeenCalled();
    expect( routeSpy ).not.toHaveBeenCalled();
    expect( getSuperheroByIdSpy ).not.toHaveBeenCalled();
  });

  it('getSuperheroById should navigate to list if superhero is not found', () => {
    const superherosSvcSpy = spyOn(superherosSvcMock, 'getSuperheroById').and.returnValue(of(null as any));
    const routerSpy = spyOn(router, 'navigate');

    const id = '1';

    component.getSuperheroById(id);

    expect( superherosSvcSpy ).toHaveBeenCalledWith(id);
    expect( routerSpy ).toHaveBeenCalledWith(['/superheros/list']);
  });

  it('getSuperheroById should reset superheroForm if superhero is not null', () => {
    const superherosSvcSpy = spyOn(superherosSvcMock, 'getSuperheroById').and.returnValue(of(superheroMock));

    const id = '1'

    component.getSuperheroById('1');

    expect( superherosSvcSpy ).toHaveBeenCalledWith(id);
    expect(component.superheroForm.value).toEqual(superheroMock);
  });

  it('getSuperheroById should navigate to /superheros/list if an error occurs while fetching superhero', () => {
    const superherosSvcSpy = spyOn(superherosSvcMock, 'getSuperheroById').and.returnValue(throwError(() => new Error('Error')));
    const routerSpy = spyOn(router, 'navigate');
    const showrSnackbarErrorSpy = spyOn(component, 'showrSnackbarError');

    const id = '1';

    component.getSuperheroById(id);

    expect( superherosSvcSpy ).toHaveBeenCalledWith(id);
    expect( routerSpy ).toHaveBeenCalledWith(['/superheros/list']);
    expect( showrSnackbarErrorSpy ).toHaveBeenCalledWith('Se ha producido un error al intentar obtener le superhéroe');
  });

  it('onSubmit should call onSubmit() when the button is clicked', () => {
    const onSubmitSpy = spyOn(component, 'onSubmit');
    const buttonDe = fixture.debugElement.query(By.css('button'));
    const buttonEl = buttonDe.nativeElement;

    buttonEl.click();

    expect(onSubmitSpy).toHaveBeenCalled();
  });

  it('onSubmit should submit form and call updateSuperhero when isEdit is true and form is valid', () => {
    const superheroVaild = {...superheroMock};
    spyOn(router, 'navigate');
    const superherosSvcSpy = spyOn(superherosSvcMock, 'updateSuperhero').and.returnValue(of(superheroVaild));
    component.superheroForm.setValue(superheroVaild);
    component.isEdit.set(true);

    component.onSubmit();

    expect(superherosSvcSpy).toHaveBeenCalledWith(superheroVaild);
  });

  it('onSubmit should submit form and call createSuperhero when isEdit is false and form is valid', () => {
    const superheroVaild = {...superheroMock};
    spyOn(router, 'navigate');
    const superherosSvcSpy = spyOn(superherosSvcMock, 'createSuperhero').and.returnValue(of(superheroVaild));
    component.superheroForm.setValue(superheroVaild);
    component.isEdit.set(false);

    component.onSubmit();

    expect(component.superheroForm.valid).toBeTruthy();
    expect(superherosSvcSpy).toHaveBeenCalledWith(superheroVaild);
  });

  it('should return early if superheroForm is invalid', () => {
    const superheroInValid = {...superheroMock};
    superheroInValid.name = '';
    spyOn(router, 'navigate');
    const superherosSvcUpdateSpy = spyOn(superherosSvcMock, 'updateSuperhero').and.returnValue(of(superheroInValid));
    const superherosSvcCreateSpy = spyOn(superherosSvcMock, 'createSuperhero').and.returnValue(of(superheroInValid));
    const showrSnackbarErrorSpy = spyOn(component, 'showrSnackbarError');
    component.superheroForm.setValue(superheroInValid);

    component.onSubmit();

    expect(component.superheroForm.valid).toBeFalsy();
    expect(superherosSvcUpdateSpy).not.toHaveBeenCalled();
    expect(superherosSvcCreateSpy).not.toHaveBeenCalled();
    expect( showrSnackbarErrorSpy ).toHaveBeenCalledWith('Formulario inválido', 1000);
  });

  it('should display "Crear Superhéroe" when not in edit mode', () => {
    component.isEdit.set(false);
    fixture.detectChanges();

    const headerDe = fixture.debugElement.query(By.css('h1'));
    const headerEl = headerDe.nativeElement;

    expect(headerEl.textContent).toContain('Crear Superhéroe');
  });

  it('should display "Editar Superhéroe" when in edit mode', () => {
    component.isEdit.set(true);
    fixture.detectChanges();

    const headerDe = fixture.debugElement.query(By.css('h1'));
    const headerEl = headerDe.nativeElement;

    expect(headerEl.textContent).toContain('Editar Superhéroe');
  });


});
