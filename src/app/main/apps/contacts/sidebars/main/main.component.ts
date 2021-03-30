import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

import { Skill } from 'app/models/Skill';
import { ContactsService } from 'app/main/apps/contacts/contacts.service';

@Component({
    selector   : 'contacts-main-sidebar',
    templateUrl: './main.component.html',
    styleUrls  : ['./main.component.scss']
})
export class ContactsMainSidebarComponent implements OnInit, OnDestroy
{
    user: any;
    filterBy: string;

    skillForm = new FormControl();
    messageInfo: string;
    skillCreated: Skill;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ContactsService} _contactsService
     */
    constructor(
        private _contactsService: ContactsService
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.filterBy = this._contactsService.filterBy || 'all';

        this._contactsService.onUserDataChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(user => {
                this.user = user;
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Change the filter
     *
     * @param filter
     */
    changeFilter(filter): void
    {
        this.filterBy = filter;
        this._contactsService.onFilterChanged.next(this.filterBy);
    }

    addNewSkill(skill): void 
    {
        if(!skill || skill.trim() == '') return;
        
        this._contactsService.getAllSkills()
        .subscribe((skills) => {
            this.skillCreated = new Skill(skills.length + 1, skill.trim(), "");
            this._contactsService.addSkill(this.skillCreated).subscribe(() => {
                    this.messageInfo = skill.trim() + " added succesfully!";
                }
            );

        })

        this.skillForm = new FormControl();
    }

}
