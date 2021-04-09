import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, ResolveEnd } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { FuseUtils } from '@fuse/utils';

import { environment } from 'environments/environment'
import { Contact } from 'app/main/apps/contacts/contact.model';
import { Skill } from 'app/models/Skill';

@Injectable()
export class ContactsService implements Resolve<any>
{
    onContactsChanged: BehaviorSubject<any>;
    onSelectedContactsChanged: BehaviorSubject<any>;
    onUserDataChanged: BehaviorSubject<any>;
    onSearchTextChanged: Subject<any>;
    onFilterChanged: Subject<any>;

    contacts: Contact[];
    user: any;
    selectedContacts: number[] = [];

    searchText: string;
    filterBy: string;

    baseUrlFakeDbFruits: string = 'api/fruits';

    skillReturn: Skill;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient
    )
    {
        // Set the defaults
        this.onContactsChanged = new BehaviorSubject([]);
        this.onSelectedContactsChanged = new BehaviorSubject([]);
        this.onUserDataChanged = new BehaviorSubject([]);
        this.onSearchTextChanged = new Subject();
        this.onFilterChanged = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.getContacts(),
                this.getUserData()
            ]).then(
                ([files]) => {

                    this.onSearchTextChanged.subscribe(searchText => {
                        this.searchText = searchText;
                        this.getContacts();
                    });

                    this.onFilterChanged.subscribe(filter => {
                        this.filterBy = filter;
                        this.getContacts();
                    });

                    resolve(null);

                },
                reject
            );
        });
    }

    /**
     * Get contacts
     *
     * @returns {Promise<any>}
     */
    getContacts(): Promise<any>
    {
        return new Promise((resolve, reject) => {
                this._httpClient.get(`${environment.backendUrl}/getUsers`)
                    .subscribe((response: any) => {

                        this.contacts = response;
                        // console.log(this.contacts)

                        if ( this.filterBy === 'starred' )
                        {
                            this.contacts = this.contacts.filter(_contact => {
                                return this.user.starred.includes(_contact.id);
                            });
                        }

                        if ( this.filterBy === 'frequent' )
                        {
                            this.contacts = this.contacts.filter(_contact => {
                                return this.user.frequentContacts.includes(_contact.id);
                            });
                        }

                        if ( this.searchText && this.searchText !== '' )
                        {
                            this.contacts = FuseUtils.filterArrayByString(this.contacts, this.searchText);
                        }

                        this.contacts = this.contacts.map(contact => {
                            return new Contact(contact);
                        });

                        this.onContactsChanged.next(this.contacts);
                        resolve(this.contacts);
                    }, reject);
            }
        );
    }

    /**
     * Get user data
     *
     * @returns {Promise<any>}
     */
    getUserData(): Promise<any>
    {
        return new Promise((resolve, reject) => {
                this._httpClient.get('api/contacts-user/5725a6802d10e277a0f35724')
                    .subscribe((response: any) => {
                        this.user = response;
                        this.onUserDataChanged.next(this.user);
                        resolve(this.user);
                    }, reject);
            }
        );
    }

    /**
     * Toggle selected contact by id
     *
     * @param id
     */
    toggleSelectedContact(id): void
    {
        // First, check if we already have that contact as selected...
        if ( this.selectedContacts.length > 0 )
        {
            const index = this.selectedContacts.indexOf(id);

            if ( index !== -1 )
            {
                this.selectedContacts.splice(index, 1);

                // Trigger the next event
                this.onSelectedContactsChanged.next(this.selectedContacts);

                // Return
                return;
            }
        }

        // If we don't have it, push as selected
        this.selectedContacts.push(id);

        // Trigger the next event
        this.onSelectedContactsChanged.next(this.selectedContacts);
    }

    /**
     * Toggle select all
     */
    toggleSelectAll(): void
    {
        if ( this.selectedContacts.length > 0 )
        {
            this.deselectContacts();
        }
        else
        {
            this.selectContacts();
        }
    }

    /**
     * Select contacts
     *
     * @param filterParameter
     * @param filterValue
     */
    selectContacts(filterParameter?, filterValue?): void
    {
        this.selectedContacts = [];

        // If there is no filter, select all contacts
        if ( filterParameter === undefined || filterValue === undefined )
        {
            this.selectedContacts = [];
            this.contacts.map(contact => {
                this.selectedContacts.push(contact.id);
            });
        }

        // Trigger the next event
        this.onSelectedContactsChanged.next(this.selectedContacts);
    }

    /**
     * Update contact
     *
     * @param contact
     * @returns {Promise<any>}
     */
    updateContact(contact): Promise<any>
    {
        return new Promise(async (resolve, reject) => {

             console.log(contact)

            await Promise.all(contact.skills.map(async (skill, index) => {
                // console.log(contact.skills[index])
                
                if(typeof(contact.skills[index]) == "string"){
                    await this.getSkillByName(contact.skills[index]).then((resolve) => {
                        contact.skills[index] = resolve;
                    })
                }

                if(typeof(contact.skills[index]) == "number"){
                    await this.getSkillById(contact.skills[index]).then((resolve) => {
                        contact.skills[index] = resolve;
                    })
                }

                if(contact.skills[index].users) contact.skills[index].users = null;     
            }))

            // console.log(JSON.stringify(contact.skills, undefined, 2));

            if(contact.id == 0) {
                this._httpClient.post(`${environment.backendUrl}/postUser`, contact)
                    .subscribe(response => {
                        this.getContacts();
                        resolve(response);
                    });
            } else {   
                this._httpClient.put(`${environment.backendUrl}/putUser/${contact.id}`, contact)
                .subscribe(response => {
                    this.getContacts();
                    resolve(response);
                });
            }
        });
    }


    /**
     * Update user data
     *
     * @param userData
     * @returns {Promise<any>}
     */
    updateUserData(userData): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this._httpClient.post('api/contacts-user/' + this.user.id, {...userData})
                .subscribe(response => {
                    this.getUserData();
                    this.getContacts();
                    resolve(response);
                });
        });
    }

    /**
     * Deselect contacts
     */
    deselectContacts(): void
    {
        this.selectedContacts = [];

        // Trigger the next event
        this.onSelectedContactsChanged.next(this.selectedContacts);
    }

    /**
     * Delete contact
     *
     * @param contact
     */
    async deleteContact(contact): Promise<void>
    {
        return new Promise((resolve) => {

            const contactIndex = this.contacts.indexOf(contact);
            this.contacts.splice(contactIndex, 1);
            this.onContactsChanged.next(this.contacts);
            this._httpClient.delete(`${environment.backendUrl}/deleteUser/${contact.id}`)
            .subscribe(response => {
                this.getContacts();
                resolve();
            });
        })
    }

    /**
     * Delete selected contacts
     */
    deleteSelectedContacts(): void
    {
        for ( const contactId of this.selectedContacts )
        {
            const contact = this.contacts.find(_contact => {
                return _contact.id === contactId;
            });
            const contactIndex = this.contacts.indexOf(contact);
            this.contacts.splice(contactIndex, 1);
        }
        this.onContactsChanged.next(this.contacts);
        this.deselectContacts();
    }


    /**
     * Get Items of Fruits
     */
    getFruitsList(): Observable<string[]> {
        return this._httpClient.get<string[]>(`${this.baseUrlFakeDbFruits}`)
    }

    /**
     * Get All Skills
     */
    getAllSkills(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get<Skill[]>(`${environment.backendUrl}/getAllSkills`)
                .subscribe(async (skills) => {
                    await Promise.all(skills.map(async (skill, index) => {
                        if(typeof(skill) == "number") {
                            await this.getSkillById(skill).then(skillReceived => {
                                skills[index] = skillReceived;
                            })
                        }
                    }))
                    resolve(skills)
                })
        })
    }

    getSkillById(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get<Skill>(`${environment.backendUrl}/getSkill/${id}`)
                .subscribe(skill => {
                    resolve(skill);
                })
        })
    }

    getSkillByName(name: string): Promise<any> {
        return new Promise((resolve) => {
            this.getAllSkills().then((skills) => {
                skills.map(skill => {
                    if(skill.title == name) resolve(skill);
                })
            })
        })
    }

    addSkill(skill): Observable<Skill> {

        // console.log("Skill: ", skill)
        return this._httpClient.post<Skill>(`${environment.backendUrl}/postSkill`, skill);
        
    }
}
