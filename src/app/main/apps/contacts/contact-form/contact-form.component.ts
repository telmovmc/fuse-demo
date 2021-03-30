import { ContactsService } from 'app/main/apps/contacts/contacts.service';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service'


import { Contact } from 'app/main/apps/contacts/contact.model';

@Component({
    selector     : 'contacts-contact-form-dialog',
    templateUrl  : './contact-form.component.html',
    styleUrls    : ['./contact-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ContactsContactFormDialogComponent
{
    action: string;
    contact: Contact;
    contactForm: FormGroup;
    dialogTitle: string;

    selectedSkills: string[];
    fruitsForm = new FormControl();

    skillsList: string[];
    fruitsList: string[];

    /**
     * Constructor
     *
     * @param {MatDialogRef<ContactsContactFormDialogComponent>} matDialogRef
     * @param _data
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        public matDialogRef: MatDialogRef<ContactsContactFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder,
        private _cookieService: CookieService,
        private contactsService: ContactsService,
    )
    {
        // Set the defaults
        this.action = _data.action;

        if ( this.action === 'edit' )
        {
            this.dialogTitle = 'Edit Contact';
            this.contact = _data.contact;
        }
        else
        {
            this.dialogTitle = 'New Contact';
            this.contact = new Contact({});
        }

        this.contactForm = this.createContactForm();

        this.skillsList = ["Swimming", "Running", "Jumping"];

        //
        // Cookies
        //

        console.log(this._cookieService.get('Fruits_' + this.contact.id))
        if(this._cookieService.get('Fruits_' + this.contact.id))
            this.fruitsForm.setValue(JSON.parse(this._cookieService.get('Fruits_' + this.contact.id)));

        this.contactsService.getFruitsList()
            .subscribe((fruitList) => this.fruitsList = fruitList)

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create contact form
     *
     * @returns {FormGroup}
     */
    createContactForm(): FormGroup
    {
        return this._formBuilder.group({
            id      : [this.contact.id],
            name    : [this.contact.name],
            lastName: [this.contact.lastName],
            avatar  : [this.contact.avatar],
            nickname: [this.contact.nickname],
            company : [this.contact.company],
            jobTitle: [this.contact.jobTitle],
            email   : [this.contact.email],
            phone   : [this.contact.phone],
            address : [this.contact.address],
            birthday: [this.contact.birthday],
            notes   : [this.contact.notes],
            skills  : [this.selectedSkills],
        });
    }

    public updateFruitList(fruits: string[]): void {
        this.fruitsForm.setValue(fruits);
        this._cookieService.set('Fruits_' + this.contact.id, JSON.stringify(fruits), 365, '/');

    }

    show(response: any): void 
    {
        console.log(response);
    }
}
